const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');

/**
 * Users API Routes
 * Handles user registration and profile management
 */

// POST /api/users/register - Register or get user by phone
router.post('/register', async (req, res, next) => {
  try {
    const { phoneNumber, deviceId } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    // Check if user exists
    const [existing] = await db.query(
      'SELECT * FROM users WHERE phone_number = ?',
      [phoneNumber]
    );
    
    if (existing.length > 0) {
      // Update last login
      await db.query(
        'UPDATE users SET last_login = NOW(), device_id = ? WHERE id = ?',
        [deviceId, existing[0].id]
      );
      
      return res.json({
        success: true,
        message: 'Welcome back!',
        data: existing[0],
        isNewUser: false
      });
    }
    
    // Create new user
    const userId = uuidv4();
    
    await db.query(
      `INSERT INTO users (id, phone_number, device_id, created_at, last_login)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [userId, phoneNumber, deviceId]
    );
    
    const [newUser] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: newUser[0],
      isNewUser: true
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/phone/:phoneNumber - Get user by phone
router.get('/phone/:phoneNumber', async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE phone_number = ?',
      [req.params.phoneNumber]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/:id - Update user profile
router.patch('/:id', async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    values.push(req.params.id);
    
    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated',
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/orders - Get user's order history
router.get('/:id/orders', async (req, res, next) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT o.*, p.name as package_name, p.category, p.amount, p.unit
      FROM orders o
      JOIN packages p ON o.package_id = p.id
      WHERE o.user_id = ?
    `;
    const params = [req.params.id];
    
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [orders] = await db.query(query, params);
    
    // Get total count
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/stats - Get user statistics
router.get('/:id/stats', async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Get total orders
    const [orderStats] = await db.query(
      `SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as total_spent
       FROM orders WHERE user_id = ?`,
      [userId]
    );
    
    // Get favorite category
    const [categoryStats] = await db.query(
      `SELECT p.category, COUNT(*) as count
       FROM orders o
       JOIN packages p ON o.package_id = p.id
       WHERE o.user_id = ? AND o.status = 'completed'
       GROUP BY p.category
       ORDER BY count DESC
       LIMIT 1`,
      [userId]
    );
    
    // Get recent activity
    const [recentOrders] = await db.query(
      `SELECT o.*, p.name as package_name
       FROM orders o
       JOIN packages p ON o.package_id = p.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC
       LIMIT 5`,
      [userId]
    );
    
    res.json({
      success: true,
      data: {
        totalOrders: orderStats[0].total_orders || 0,
        completedOrders: orderStats[0].completed_orders || 0,
        totalSpent: orderStats[0].total_spent || 0,
        favoriteCategory: categoryStats[0]?.category || null,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
