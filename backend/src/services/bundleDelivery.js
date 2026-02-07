const axios = require('axios');
const db = require('../database/connection');

/**
 * Bundle Delivery Service
 * Handles delivery of purchased bundles via Safaricom APIs
 * 
 * Note: In production, this would integrate with Safaricom's
 * Partner API or USSD gateway for actual bundle delivery
 */

class BundleDeliveryService {
  constructor() {
    // Simulated delivery for development
    this.simulatedMode = process.env.NODE_ENV !== 'production';
  }

  /**
   * Deliver bundle to customer
   */
  async deliverBundle(orderId) {
    try {
      // Get order details
      const [orders] = await db.query(
        `SELECT o.*, p.ussd_code, p.name as package_name, p.amount, p.unit
         FROM orders o
         JOIN packages p ON o.package_id = p.id
         WHERE o.id = ?`,
        [orderId]
      );

      if (orders.length === 0) {
        throw new Error('Order not found');
      }

      const order = orders[0];

      // Verify order is paid
      if (order.status !== 'paid') {
        throw new Error(`Cannot deliver bundle for order with status: ${order.status}`);
      }

      // Update order to delivering
      await db.query(
        "UPDATE orders SET status = 'delivering' WHERE id = ?",
        [orderId]
      );

      // Log delivery attempt
      await db.query(
        `INSERT INTO transaction_logs (order_id, action, details)
         VALUES (?, 'delivery_started', ?)`,
        [orderId, JSON.stringify({ timestamp: new Date().toISOString() })]
      );

      let deliveryResult;

      if (this.simulatedMode) {
        // Simulate delivery in development
        deliveryResult = await this.simulateDelivery(order);
      } else {
        // Actual delivery in production
        deliveryResult = await this.executeDelivery(order);
      }

      if (deliveryResult.success) {
        await db.query(
          `UPDATE orders 
           SET status = 'completed', 
               delivered_at = NOW(),
               delivery_reference = ?
           WHERE id = ?`,
          [deliveryResult.reference, orderId]
        );

        await db.query(
          `INSERT INTO transaction_logs (order_id, action, details)
           VALUES (?, 'delivery_completed', ?)`,
          [orderId, JSON.stringify(deliveryResult)]
        );

        return {
          success: true,
          message: 'Bundle delivered successfully',
          reference: deliveryResult.reference
        };
      } else {
        await db.query(
          `UPDATE orders 
           SET status = 'delivery_failed', 
               error_message = ?
           WHERE id = ?`,
          [deliveryResult.error, orderId]
        );

        await db.query(
          `INSERT INTO transaction_logs (order_id, action, details)
           VALUES (?, 'delivery_failed', ?)`,
          [orderId, JSON.stringify(deliveryResult)]
        );

        return {
          success: false,
          message: 'Bundle delivery failed',
          error: deliveryResult.error
        };
      }
    } catch (error) {
      console.error('Bundle Delivery Error:', error);
      
      await db.query(
        `UPDATE orders 
         SET status = 'delivery_failed', 
             error_message = ?
         WHERE id = ?`,
        [error.message, orderId]
      );

      throw error;
    }
  }

  /**
   * Simulate bundle delivery for development/testing
   */
  async simulateDelivery(order) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 95% success rate in simulation
    const success = Math.random() < 0.95;

    if (success) {
      return {
        success: true,
        reference: `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        message: `Simulated delivery of ${order.package_name} to ${order.phone_number}`
      };
    } else {
      return {
        success: false,
        error: 'Simulated delivery failure - network timeout'
      };
    }
  }

  /**
   * Execute actual bundle delivery via Safaricom API
   * Note: This is a placeholder - actual implementation depends on
   * Safaricom Partner API access
   */
  async executeDelivery(order) {
    // In production, this would:
    // 1. Call Safaricom Partner API to deliver the bundle
    // 2. Or trigger USSD command via gateway
    // 3. Or use other authorized delivery method

    // Example structure for actual API call:
    /*
    const response = await axios.post(process.env.SAFARICOM_DELIVERY_URL, {
      phone: order.phone_number,
      bundleCode: order.ussd_code,
      transactionId: order.id
    }, {
      headers: {
        'Authorization': `Bearer ${await this.getDeliveryToken()}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: response.data.status === 'success',
      reference: response.data.reference,
      error: response.data.error
    };
    */

    // For now, fall back to simulation
    return this.simulateDelivery(order);
  }

  /**
   * Check bundle delivery status
   */
  async checkDeliveryStatus(orderId) {
    const [orders] = await db.query(
      `SELECT status, delivered_at, delivery_reference, error_message
       FROM orders WHERE id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      throw new Error('Order not found');
    }

    const order = orders[0];

    return {
      orderId,
      status: order.status,
      deliveredAt: order.delivered_at,
      reference: order.delivery_reference,
      error: order.error_message
    };
  }

  /**
   * Retry failed delivery
   */
  async retryDelivery(orderId) {
    const [orders] = await db.query(
      'SELECT status FROM orders WHERE id = ?',
      [orderId]
    );

    if (orders.length === 0) {
      throw new Error('Order not found');
    }

    if (orders[0].status !== 'delivery_failed') {
      throw new Error('Order is not in delivery_failed status');
    }

    // Reset to paid status and attempt delivery again
    await db.query(
      "UPDATE orders SET status = 'paid', error_message = NULL WHERE id = ?",
      [orderId]
    );

    return this.deliverBundle(orderId);
  }
}

module.exports = new BundleDeliveryService();
