const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');

/**
 * M-PESA Payments API Routes
 * Handles STK Push initiation and callbacks
 */

// Get M-PESA OAuth token
async function getMpesaToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');
  
  const response = await axios.get(process.env.MPESA_AUTH_URL, {
    headers: {
      Authorization: `Basic ${auth}`
    }
  });
  
  return response.data.access_token;
}

// Generate password for STK Push
function generatePassword() {
  const timestamp = new Date().toISOString()
    .replace(/[-:T]/g, '')
    .slice(0, 14);
  
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');
  
  return { password, timestamp };
}

// POST /api/payments/initiate - Initiate STK Push
router.post('/initiate', async (req, res, next) => {
  try {
    const { orderId, phoneNumber, amount } = req.body;
    
    if (!orderId || !phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, phoneNumber, amount'
      });
    }
    
    // Verify order exists and is in correct state
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orders[0];
    
    if (!['queued', 'pending'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be paid in current status'
      });
    }
    
    // Get M-PESA token
    const token = await getMpesaToken();
    const { password, timestamp } = generatePassword();
    
    // Create payment record
    const paymentId = uuidv4();
    await db.query(
      `INSERT INTO payments (id, order_id, amount, phone_number, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [paymentId, orderId, amount, phoneNumber]
    );
    
    // Initiate STK Push
    const stkPayload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: phoneNumber,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: `BINGWA-${orderId.slice(0, 8).toUpperCase()}`,
      TransactionDesc: `Package Purchase`
    };
    
    const stkResponse = await axios.post(process.env.MPESA_STK_URL, stkPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Update payment with M-PESA response
    if (stkResponse.data.ResponseCode === '0') {
      await db.query(
        `UPDATE payments 
         SET merchant_request_id = ?, checkout_request_id = ?, status = 'processing'
         WHERE id = ?`,
        [
          stkResponse.data.MerchantRequestID,
          stkResponse.data.CheckoutRequestID,
          paymentId
        ]
      );
      
      // Update order status
      await db.query(
        "UPDATE orders SET status = 'processing' WHERE id = ?",
        [orderId]
      );
      
      // Log transaction
      await db.query(
        `INSERT INTO transaction_logs (order_id, payment_id, action, details)
         VALUES (?, ?, 'stk_initiated', ?)`,
        [orderId, paymentId, JSON.stringify(stkResponse.data)]
      );
      
      res.json({
        success: true,
        message: 'STK Push sent successfully. Check your phone.',
        data: {
          paymentId,
          checkoutRequestId: stkResponse.data.CheckoutRequestID
        }
      });
    } else {
      await db.query(
        "UPDATE payments SET status = 'failed', result_description = ? WHERE id = ?",
        [stkResponse.data.ResponseDescription, paymentId]
      );
      
      res.status(400).json({
        success: false,
        message: stkResponse.data.ResponseDescription
      });
    }
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    next(error);
  }
});

// POST /api/payments/callback - M-PESA Callback
router.post('/callback', async (req, res) => {
  try {
    const callback = req.body.Body?.stkCallback;
    
    if (!callback) {
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
    
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = callback;
    
    // Find payment by checkout request ID
    const [payments] = await db.query(
      'SELECT * FROM payments WHERE checkout_request_id = ?',
      [CheckoutRequestID]
    );
    
    if (payments.length === 0) {
      console.error('Payment not found for callback:', CheckoutRequestID);
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
    
    const payment = payments[0];
    
    if (ResultCode === 0) {
      // Payment successful
      const metadata = callback.CallbackMetadata?.Item || [];
      const receipt = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = metadata.find(i => i.Name === 'TransactionDate')?.Value;
      
      await db.query(
        `UPDATE payments 
         SET status = 'completed', 
             result_code = ?, 
             result_description = ?,
             mpesa_receipt_number = ?,
             transaction_date = ?
         WHERE id = ?`,
        [ResultCode, ResultDesc, receipt, transactionDate, payment.id]
      );
      
      // Update order to paid
      await db.query(
        `UPDATE orders 
         SET status = 'paid', 
             mpesa_receipt_number = ?,
             paid_at = NOW()
         WHERE id = ?`,
        [receipt, payment.order_id]
      );
      
      // Log success
      await db.query(
        `INSERT INTO transaction_logs (order_id, payment_id, action, details)
         VALUES (?, ?, 'payment_completed', ?)`,
        [payment.order_id, payment.id, JSON.stringify(callback)]
      );
      
      // TODO: Trigger bundle delivery here
      // await deliverBundle(payment.order_id);
      
    } else {
      // Payment failed
      await db.query(
        `UPDATE payments 
         SET status = 'failed', result_code = ?, result_description = ?
         WHERE id = ?`,
        [ResultCode, ResultDesc, payment.id]
      );
      
      await db.query(
        `UPDATE orders 
         SET status = 'failed', error_message = ?
         WHERE id = ?`,
        [ResultDesc, payment.order_id]
      );
      
      // Log failure
      await db.query(
        `INSERT INTO transaction_logs (order_id, payment_id, action, details)
         VALUES (?, ?, 'payment_failed', ?)`,
        [payment.order_id, payment.id, JSON.stringify(callback)]
      );
    }
    
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Callback Error:', error);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});

// GET /api/payments/:id/status - Check payment status
router.get('/:id/status', async (req, res, next) => {
  try {
    const [payments] = await db.query(
      'SELECT * FROM payments WHERE id = ? OR checkout_request_id = ?',
      [req.params.id, req.params.id]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    const payment = payments[0];
    
    // Get associated order
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [payment.order_id]
    );
    
    res.json({
      success: true,
      data: {
        payment,
        order: orders[0] || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/:id/query - Query STK status from M-PESA
router.post('/:id/query', async (req, res, next) => {
  try {
    const [payments] = await db.query(
      'SELECT * FROM payments WHERE id = ?',
      [req.params.id]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    const payment = payments[0];
    
    if (!payment.checkout_request_id) {
      return res.status(400).json({
        success: false,
        message: 'No checkout request to query'
      });
    }
    
    const token = await getMpesaToken();
    const { password, timestamp } = generatePassword();
    
    const queryResponse = await axios.post(process.env.MPESA_QUERY_URL, {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: payment.checkout_request_id
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json({
      success: true,
      data: queryResponse.data
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
