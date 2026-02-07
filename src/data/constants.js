/**
 * Application Constants
 */

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',      // Saved locally, waiting for sync
  QUEUED: 'queued',        // Sent to server, waiting for payment
  PROCESSING: 'processing', // Payment initiated
  PAID: 'paid',            // Payment confirmed
  DELIVERING: 'delivering', // Bundle being delivered
  DELIVERED: 'delivered',   // Successfully completed
  FAILED: 'failed',        // Failed at any stage
  CANCELLED: 'cancelled'   // User cancelled
};

// Order Status Labels
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending Sync',
  [ORDER_STATUS.QUEUED]: 'Waiting Payment',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.PAID]: 'Paid',
  [ORDER_STATUS.DELIVERING]: 'Delivering',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.FAILED]: 'Failed',
  [ORDER_STATUS.CANCELLED]: 'Cancelled'
};

// Order Status Colors
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: '#F59E0B',
  [ORDER_STATUS.QUEUED]: '#3B82F6',
  [ORDER_STATUS.PROCESSING]: '#8B5CF6',
  [ORDER_STATUS.PAID]: '#10B981',
  [ORDER_STATUS.DELIVERING]: '#06B6D4',
  [ORDER_STATUS.DELIVERED]: '#059669',
  [ORDER_STATUS.FAILED]: '#EF4444',
  [ORDER_STATUS.CANCELLED]: '#6B7280'
};

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  DEALS: '/deals',
  DATA_DEALS: '/deals/data',
  SMS_DEALS: '/deals/sms',
  MINUTES_DEALS: '/deals/minutes',
  ORDERS: '/orders',
  WALLET: '/wallet',
  PROFILE: '/profile',
  SETTINGS: '/settings'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'bingwa-theme',
  USER: 'bingwa-user',
  PENDING_ORDERS: 'bingwa-pending-orders',
  LAST_SYNC: 'bingwa-last-sync'
};

// IndexedDB Configuration
export const DB_CONFIG = {
  NAME: 'BingwaSokoniDB',
  VERSION: 1,
  STORES: {
    ORDERS: 'orders',
    PACKAGES: 'packages',
    TRANSACTIONS: 'transactions'
  }
};

// API Endpoints (for backend integration)
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify'
  },
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    GET: '/orders/:id',
    CANCEL: '/orders/:id/cancel'
  },
  PAYMENTS: {
    INITIATE: '/payments/initiate',
    STATUS: '/payments/:id/status',
    CALLBACK: '/payments/callback'
  },
  PACKAGES: {
    LIST: '/packages',
    GET: '/packages/:id'
  }
};

// MPESA Configuration
export const MPESA_CONFIG = {
  PAYBILL: '174379', // Sandbox paybill
  ACCOUNT_PREFIX: 'BINGWA',
  MIN_AMOUNT: 5,
  MAX_AMOUNT: 70000
};

// Phone Number Validation
export const PHONE_REGEX = /^(?:254|\+254|0)?([17]\d{8})$/;

// Format phone number to 254 format
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('254')) return cleaned;
  if (cleaned.startsWith('0')) return '254' + cleaned.substring(1);
  if (cleaned.startsWith('7') || cleaned.startsWith('1')) return '254' + cleaned;
  return cleaned;
};

// Validate phone number
export const isValidPhoneNumber = (phone) => {
  return PHONE_REGEX.test(phone);
};
