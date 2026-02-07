const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const db = require('../database/connection');

/**
 * Orders API Routes
 * Handles order creation, retrieval, and management
 */

// Validation schema
const createOrderSchema = Joi.object({
  packageId: Joi.string().required(),
  phoneNumber: Joi.string().pattern(/^254[17]\d{8}$/).required(),
  userId: Joi.string().optional()
});

// GET /api/orders - List orders (with optional filters)
router.get('/', async (req, res, next) => {
  try {
    const { status, phone, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (phone) {
      query += ' AND phone_number = ?';
      params.push(phone);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [orders] = await db.query(query, params);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res, next) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: orders[0]
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders - Create new order
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const { packageId, phoneNumber, userId } = value;
    
    // Get package details
    const [packages] = await db.query(
      'SELECT * FROM packages WHERE id = ? AND is_active = TRUE',
      [packageId]
    );
    
    if (packages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found or inactive'
      });
    }
    
    const pkg = packages[0];
    
    // Create order
    const orderId = uuidv4();
    await db.query(
      `INSERT INTO orders (id, user_id, package_id, phone_number, amount, status)
       VALUES (?, ?, ?, ?, ?, 'queued')`,
      [orderId, userId || null, packageId, phoneNumber, pkg.price]
    );
    
    // Log transaction
    await db.query(
      `INSERT INTO transaction_logs (order_id, action, details)
       VALUES (?, 'order_created', ?)`,
      [orderId, JSON.stringify({ packageId, phoneNumber, amount: pkg.price })]
    );
    
    // Fetch created order
    const [newOrders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    res.status(201).json({
      success: true,
      data: newOrders[0],
      message: 'Order created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/:id - Update order status
router.patch('/:id', async (req, res, next) => {
  try {
    const { status, mpesaReceiptNumber, errorMessage } = req.body;
    
    const updates = [];
    const params = [];
    
    if (status) {
      updates.push('status = ?');
      params.push(status);
      
      if (status === 'paid') {
        updates.push('paid_at = NOW()');
      } else if (status === 'delivered') {
        updates.push('delivered_at = NOW()');
      }
    }
    
    if (mpesaReceiptNumber) {
      updates.push('mpesa_receipt_number = ?');
      params.push(mpesaReceiptNumber);
    }
    
    if (errorMessage) {
      updates.push('error_message = ?');
      params.push(errorMessage);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }
    
    params.push(req.params.id);
    
    await db.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    // Fetch updated order
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      data: orders[0]
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders/:id/cancel - Cancel order
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orders[0];
    
    // Only allow cancellation of pending or queued orders
    if (!['pending', 'queued'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order in current status'
      });
    }
    
    await db.query(
      "UPDATE orders SET status = 'cancelled' WHERE id = ?",
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders/sync - Sync multiple pending orders
router.post('/sync', async (req, res, next) => {
  try {
    const { orders } = req.body;
    
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No orders to sync'
      });
    }
    
    const results = [];
    
    for (const order of orders) {
      try {
        const orderId = uuidv4();
        
        // Get package
        const [packages] = await db.query(
          'SELECT * FROM packages WHERE id = ?',
          [order.packageId]
        );
        
        if (packages.length === 0) continue;
        
        const pkg = packages[0];
        
        // Create order
        await db.query(
          `INSERT INTO orders (id, package_id, phone_number, amount, status, created_at)
           VALUES (?, ?, ?, ?, 'queued', ?)`,
          [orderId, order.packageId, order.phoneNumber, pkg.price, order.createdAt || new Date()]
        );
        
        results.push({
          localId: order.id,
          serverId: orderId,
          status: 'synced'
        });
      } catch (err) {
        results.push({
          localId: order.id,
          status: 'failed',
          error: err.message
        });
      }
    }
    
    res.json({
      success: true,
      data: results,
      message: `Synced ${results.filter(r => r.status === 'synced').length} of ${orders.length} orders`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
