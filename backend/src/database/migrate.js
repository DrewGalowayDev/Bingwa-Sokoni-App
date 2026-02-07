const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

/**
 * Database Migration Script
 * Creates all necessary tables for the Bingwa Sokoni system
 */

const migrations = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone_number)
  )`,

  // Packages table
  `CREATE TABLE IF NOT EXISTS packages (
    id VARCHAR(50) PRIMARY KEY,
    category ENUM('data', 'tunukiwa', 'sms', 'minutes') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    amount VARCHAR(50) NOT NULL,
    validity VARCHAR(50) NOT NULL,
    validity_hours INT NOT NULL,
    ussd_code VARCHAR(50),
    description TEXT,
    is_multi_buy BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (is_active)
  )`,

  // Orders table
  `CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    package_id VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'queued', 'processing', 'paid', 'delivering', 'delivered', 'failed', 'cancelled') DEFAULT 'pending',
    payment_reference VARCHAR(100),
    mpesa_receipt_number VARCHAR(50),
    delivery_status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_phone (phone_number),
    INDEX idx_created (created_at),
    FOREIGN KEY (package_id) REFERENCES packages(id)
  )`,

  // Payments table
  `CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    merchant_request_id VARCHAR(100),
    checkout_request_id VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    result_code INT,
    result_description TEXT,
    mpesa_receipt_number VARCHAR(50),
    transaction_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order (order_id),
    INDEX idx_checkout (checkout_request_id),
    INDEX idx_status (status),
    FOREIGN KEY (order_id) REFERENCES orders(id)
  )`,

  // Transactions log table (for audit)
  `CREATE TABLE IF NOT EXISTS transaction_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(36),
    payment_id VARCHAR(36),
    action VARCHAR(50) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order (order_id),
    INDEX idx_payment (payment_id),
    INDEX idx_action (action)
  )`
];

async function migrate() {
  let connection;
  
  try {
    // First, connect without database to create it if needed
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD
    });

    const dbName = process.env.DB_NAME || 'bingwa_sokoni';
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbName}' ready`);
    
    // Use the database
    await connection.query(`USE ${dbName}`);

    // Run migrations
    console.log('🔄 Running migrations...');
    for (const sql of migrations) {
      await connection.query(sql);
    }
    
    console.log('✅ All migrations completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrate();
