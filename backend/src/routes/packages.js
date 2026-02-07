const express = require('express');
const router = express.Router();
const db = require('../database/connection');

/**
 * Packages API Routes
 * Handles package listing and details
 */

// GET /api/packages - List all packages
router.get('/', async (req, res, next) => {
  try {
    const { category, active_only = 'true' } = req.query;
    
    let query = 'SELECT * FROM packages';
    const params = [];
    const conditions = [];
    
    if (active_only === 'true') {
      conditions.push('is_active = 1');
    }
    
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY category, sort_order, price';
    
    const [packages] = await db.query(query, params);
    
    // Group by category
    const grouped = packages.reduce((acc, pkg) => {
      if (!acc[pkg.category]) {
        acc[pkg.category] = [];
      }
      acc[pkg.category].push(pkg);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        packages,
        grouped,
        total: packages.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/packages/categories - List available categories
router.get('/categories', async (req, res, next) => {
  try {
    const [results] = await db.query(
      `SELECT category, COUNT(*) as count 
       FROM packages 
       WHERE is_active = 1 
       GROUP BY category`
    );
    
    const categories = [
      { id: 'data', name: 'Data Deals', icon: '📶', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { id: 'tunukiwa', name: 'Tunukiwa', icon: '🎁', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { id: 'sms', name: 'SMS Bundles', icon: '💬', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { id: 'minutes', name: 'Call Minutes', icon: '📞', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
    ];
    
    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      count: results.find(r => r.category === cat.id)?.count || 0
    }));
    
    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/packages/featured - Get featured/popular packages
router.get('/featured', async (req, res, next) => {
  try {
    const [packages] = await db.query(
      `SELECT * FROM packages 
       WHERE is_active = 1 AND is_featured = 1 
       ORDER BY sort_order 
       LIMIT 6`
    );
    
    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/packages/:id - Get single package by ID
router.get('/:id', async (req, res, next) => {
  try {
    const [packages] = await db.query(
      'SELECT * FROM packages WHERE id = ?',
      [req.params.id]
    );
    
    if (packages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    res.json({
      success: true,
      data: packages[0]
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/packages/category/:category - Get packages by category
router.get('/category/:category', async (req, res, next) => {
  try {
    const validCategories = ['data', 'tunukiwa', 'sms', 'minutes'];
    
    if (!validCategories.includes(req.params.category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Valid categories: ' + validCategories.join(', ')
      });
    }
    
    const [packages] = await db.query(
      `SELECT * FROM packages 
       WHERE category = ? AND is_active = 1 
       ORDER BY sort_order, price`,
      [req.params.category]
    );
    
    res.json({
      success: true,
      data: packages,
      total: packages.length
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/packages - Create new package (admin)
router.post('/', async (req, res, next) => {
  try {
    const {
      name, category, amount, unit, validity,
      price, ussd_code, description, is_featured = false
    } = req.body;
    
    // Validate required fields
    if (!name || !category || !amount || !unit || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const id = `${category}_${Date.now()}`;
    
    await db.query(
      `INSERT INTO packages 
       (id, name, category, amount, unit, validity, price, ussd_code, description, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, category, amount, unit, validity, price, ussd_code, description, is_featured]
    );
    
    const [packages] = await db.query('SELECT * FROM packages WHERE id = ?', [id]);
    
    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: packages[0]
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/packages/:id - Update package (admin)
router.patch('/:id', async (req, res, next) => {
  try {
    const updates = req.body;
    const allowedFields = [
      'name', 'amount', 'unit', 'validity', 'price',
      'ussd_code', 'description', 'is_active', 'is_featured', 'sort_order'
    ];
    
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    values.push(req.params.id);
    
    await db.query(
      `UPDATE packages SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    const [packages] = await db.query('SELECT * FROM packages WHERE id = ?', [req.params.id]);
    
    if (packages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Package updated successfully',
      data: packages[0]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/packages/:id - Soft delete package (admin)
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await db.query(
      'UPDATE packages SET is_active = 0 WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
