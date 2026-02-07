const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('./connection');

/**
 * Database Seeder
 * Populates packages table with initial data
 */

const packages = [
  // DATA PACKAGES
  { id: 'data-55', category: 'data', price: 55, amount: '1.25 GB', validity: 'Till Midnight', validity_hours: 24, ussd_code: '*544*6*1#', description: 'Perfect for daily browsing', is_multi_buy: false, is_popular: true },
  { id: 'data-19', category: 'data', price: 19, amount: '1 GB', validity: '1 Hour', validity_hours: 1, ussd_code: '*544*6*2#', description: 'Quick hourly bundle', is_multi_buy: false, is_popular: false },
  { id: 'data-20', category: 'data', price: 20, amount: '250 MB', validity: '24 Hours', validity_hours: 24, ussd_code: '*544*6*3#', description: 'Light daily usage', is_multi_buy: false, is_popular: false },
  { id: 'data-49', category: 'data', price: 49, amount: '350 MB', validity: '7 Days', validity_hours: 168, ussd_code: '*544*6*4#', description: 'Weekly light bundle', is_multi_buy: false, is_popular: false },
  { id: 'data-50', category: 'data', price: 50, amount: '1.5 GB', validity: '3 Hours', validity_hours: 3, ussd_code: '*544*6*5#', description: 'High-speed streaming', is_multi_buy: false, is_popular: true },
  { id: 'data-99', category: 'data', price: 99, amount: '1 GB', validity: '24 Hours', validity_hours: 24, ussd_code: '*544*6*6#', description: 'Full day coverage', is_multi_buy: false, is_popular: false },
  { id: 'data-300', category: 'data', price: 300, amount: '2.5 GB', validity: '7 Days', validity_hours: 168, ussd_code: '*544*6*7#', description: 'Weekly heavy usage', is_multi_buy: false, is_popular: true },
  { id: 'data-700', category: 'data', price: 700, amount: '6 GB', validity: '7 Days', validity_hours: 168, ussd_code: '*544*6*8#', description: 'Power user weekly', is_multi_buy: false, is_popular: false },
  
  // TUNUKIWA PACKAGES
  { id: 'tunukiwa-21', category: 'tunukiwa', price: 21, amount: '1 GB', validity: '1 Hour', validity_hours: 1, ussd_code: '*544*7*1#', description: 'Quick unlimited purchase', is_multi_buy: true, is_popular: true },
  { id: 'tunukiwa-53', category: 'tunukiwa', price: 53, amount: '1.5 GB', validity: '3 Hours', validity_hours: 3, ussd_code: '*544*7*2#', description: 'Extended streaming session', is_multi_buy: true, is_popular: true },
  { id: 'tunukiwa-120', category: 'tunukiwa', price: 120, amount: '2 GB', validity: '24 Hours', validity_hours: 24, ussd_code: '*544*7*3#', description: 'Full day power pack', is_multi_buy: true, is_popular: false },
  
  // SMS PACKAGES
  { id: 'sms-5', category: 'sms', price: 5, amount: '20 SMS', validity: '24 Hours', validity_hours: 24, ussd_code: '*544*8*1#', description: 'Quick messaging', is_multi_buy: true, is_popular: false },
  { id: 'sms-10', category: 'sms', price: 10, amount: '200 SMS', validity: '24 Hours', validity_hours: 24, ussd_code: '*544*8*2#', description: 'Daily messaging pack', is_multi_buy: true, is_popular: true },
  { id: 'sms-30', category: 'sms', price: 30, amount: '1000 SMS', validity: '7 Days', validity_hours: 168, ussd_code: '*544*8*3#', description: 'Weekly messaging bundle', is_multi_buy: true, is_popular: true },
  { id: 'sms-105', category: 'sms', price: 105, amount: '1500 SMS', validity: '30 Days', validity_hours: 720, ussd_code: '*544*8*4#', description: 'Monthly messaging pack', is_multi_buy: true, is_popular: false },
  
  // MINUTES PACKAGES
  { id: 'minutes-22', category: 'minutes', price: 22, amount: '43 Minutes', validity: '3 Hours', validity_hours: 3, ussd_code: '*544*9*1#', description: 'Quick calling bundle', is_multi_buy: true, is_popular: true },
  { id: 'minutes-52', category: 'minutes', price: 52, amount: '50 Minutes', validity: 'Till Midnight', validity_hours: 24, ussd_code: '*544*9*2#', description: 'Daily calling pack', is_multi_buy: true, is_popular: true }
];

async function seed() {
  try {
    console.log('🌱 Seeding packages...');
    
    for (const pkg of packages) {
      await db.query(
        `INSERT INTO packages (id, category, price, amount, validity, validity_hours, ussd_code, description, is_multi_buy, is_popular)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         price = VALUES(price),
         amount = VALUES(amount),
         validity = VALUES(validity),
         validity_hours = VALUES(validity_hours),
         ussd_code = VALUES(ussd_code),
         description = VALUES(description),
         is_multi_buy = VALUES(is_multi_buy),
         is_popular = VALUES(is_popular)`,
        [pkg.id, pkg.category, pkg.price, pkg.amount, pkg.validity, pkg.validity_hours, pkg.ussd_code, pkg.description, pkg.is_multi_buy, pkg.is_popular]
      );
    }
    
    console.log(`✅ Seeded ${packages.length} packages`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
