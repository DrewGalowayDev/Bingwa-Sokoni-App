/**
 * PACKAGE DATA - AUTHORITATIVE SOURCE
 * All Safaricom packages with exact pricing
 * 
 * Categories:
 * - DATA: Regular data deals (once per day)
 * - TUNUKIWA: Special data deals (multi-buy)
 * - SMS: SMS packages
 * - MINUTES: Voice minutes packages
 */

export const PACKAGE_CATEGORIES = {
  DATA: 'data',
  TUNUKIWA: 'tunukiwa',
  SMS: 'sms',
  MINUTES: 'minutes'
};

// Gradient colors for each category
export const CATEGORY_GRADIENTS = {
  [PACKAGE_CATEGORIES.DATA]: {
    primary: 'linear-gradient(135deg, #00C853 0%, #00A86B 100%)',
    secondary: 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
    accent: '#00A86B'
  },
  [PACKAGE_CATEGORIES.TUNUKIWA]: {
    primary: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
    secondary: 'linear-gradient(135deg, #FF8A50 0%, #FF6B35 100%)',
    accent: '#FF6B35'
  },
  [PACKAGE_CATEGORIES.SMS]: {
    primary: 'linear-gradient(135deg, #9C27B0 0%, #E040FB 100%)',
    secondary: 'linear-gradient(135deg, #BA68C8 0%, #9C27B0 100%)',
    accent: '#9C27B0'
  },
  [PACKAGE_CATEGORIES.MINUTES]: {
    primary: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
    secondary: 'linear-gradient(135deg, #FF7043 0%, #FF5722 100%)',
    accent: '#FF5722'
  }
};

// ============================================
// DATA DEALS - Once per day per line
// ============================================
export const DATA_PACKAGES = [
  {
    id: 'data-55',
    price: 55,
    amount: '1.25 GB',
    validity: 'Till Midnight',
    validityHours: 24,
    category: PACKAGE_CATEGORIES.DATA,
    popular: true,
    description: 'Perfect for daily browsing'
  },
  {
    id: 'data-19',
    price: 19,
    amount: '1 GB',
    validity: '1 Hour',
    validityHours: 1,
    category: PACKAGE_CATEGORIES.DATA,
    popular: false,
    description: 'Quick hourly bundle'
  },
  {
    id: 'data-20',
    price: 20,
    amount: '250 MB',
    validity: '24 Hours',
    validityHours: 24,
    category: PACKAGE_CATEGORIES.DATA,
    popular: false,
    description: 'Light daily usage'
  },
  {
    id: 'data-49',
    price: 49,
    amount: '350 MB',
    validity: '7 Days',
    validityHours: 168,
    category: PACKAGE_CATEGORIES.DATA,
    popular: false,
    description: 'Weekly light bundle'
  },
  {
    id: 'data-50',
    price: 50,
    amount: '1.5 GB',
    validity: '3 Hours',
    validityHours: 3,
    category: PACKAGE_CATEGORIES.DATA,
    popular: true,
    description: 'High-speed streaming'
  },
  {
    id: 'data-99',
    price: 99,
    amount: '1 GB',
    validity: '24 Hours',
    validityHours: 24,
    category: PACKAGE_CATEGORIES.DATA,
    popular: false,
    description: 'Full day coverage'
  },
  {
    id: 'data-300',
    price: 300,
    amount: '2.5 GB',
    validity: '7 Days',
    validityHours: 168,
    category: PACKAGE_CATEGORIES.DATA,
    popular: true,
    description: 'Weekly heavy usage'
  },
  {
    id: 'data-700',
    price: 700,
    amount: '6 GB',
    validity: '7 Days',
    validityHours: 168,
    category: PACKAGE_CATEGORIES.DATA,
    popular: false,
    description: 'Power user weekly'
  }
];

// ============================================
// TUNUKIWA DATA DEALS - Buy many times a day
// ============================================
export const TUNUKIWA_PACKAGES = [
  {
    id: 'tunukiwa-21',
    price: 21,
    amount: '1 GB',
    validity: '1 Hour',
    validityHours: 1,
    category: PACKAGE_CATEGORIES.TUNUKIWA,
    multiBuy: true,
    popular: true,
    description: 'Quick unlimited purchase'
  },
  {
    id: 'tunukiwa-53',
    price: 53,
    amount: '1.5 GB',
    validity: '3 Hours',
    validityHours: 3,
    category: PACKAGE_CATEGORIES.TUNUKIWA,
    multiBuy: true,
    popular: true,
    description: 'Extended streaming session'
  },
  {
    id: 'tunukiwa-120',
    price: 120,
    amount: '2 GB',
    validity: '24 Hours',
    validityHours: 24,
    category: PACKAGE_CATEGORIES.TUNUKIWA,
    multiBuy: true,
    popular: false,
    description: 'Full day power pack'
  }
];

// ============================================
// SMS PACKAGES - Buy many times a day
// ============================================
export const SMS_PACKAGES = [
  {
    id: 'sms-5',
    price: 5,
    amount: '20 SMS',
    validity: '24 Hours',
    validityHours: 24,
    category: PACKAGE_CATEGORIES.SMS,
    multiBuy: true,
    popular: false,
    description: 'Quick messaging'
  },
  {
    id: 'sms-10',
    price: 10,
    amount: '200 SMS',
    validity: '24 Hours',
    validityHours: 24,
    category: PACKAGE_CATEGORIES.SMS,
    multiBuy: true,
    popular: true,
    description: 'Daily messaging pack'
  },
  {
    id: 'sms-30',
    price: 30,
    amount: '1000 SMS',
    validity: '7 Days',
    validityHours: 168,
    category: PACKAGE_CATEGORIES.SMS,
    multiBuy: true,
    popular: true,
    description: 'Weekly messaging bundle'
  },
  {
    id: 'sms-105',
    price: 105,
    amount: '1500 SMS',
    validity: '30 Days',
    validityHours: 720,
    category: PACKAGE_CATEGORIES.SMS,
    multiBuy: true,
    popular: false,
    description: 'Monthly messaging pack'
  }
];

// ============================================
// MINUTES PACKAGES - Buy many times a day
// ============================================
export const MINUTES_PACKAGES = [
  {
    id: 'minutes-22',
    price: 22,
    amount: '43 Minutes',
    validity: '3 Hours',
    validityHours: 3,
    category: PACKAGE_CATEGORIES.MINUTES,
    multiBuy: true,
    popular: true,
    description: 'Quick calling bundle'
  },
  {
    id: 'minutes-52',
    price: 52,
    amount: '50 Minutes',
    validity: 'Till Midnight',
    validityHours: 24,
    category: PACKAGE_CATEGORIES.MINUTES,
    multiBuy: true,
    popular: true,
    description: 'Daily calling pack'
  }
];

// Combined packages for easy access
export const ALL_PACKAGES = [
  ...DATA_PACKAGES,
  ...TUNUKIWA_PACKAGES,
  ...SMS_PACKAGES,
  ...MINUTES_PACKAGES
];

// Helper to get package by ID
export const getPackageById = (id) => {
  return ALL_PACKAGES.find(pkg => pkg.id === id);
};

// Helper to get packages by category
export const getPackagesByCategory = (category) => {
  return ALL_PACKAGES.filter(pkg => pkg.category === category);
};

// Helper to get featured/popular packages
export const getFeaturedPackages = () => {
  return ALL_PACKAGES.filter(pkg => pkg.popular);
};
