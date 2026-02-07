/**
 * API Service Layer
 * Handles all backend API communications with offline support
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.timeout = 10000; // 10 seconds
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      
      throw error;
    }
  }

  // ==================== PACKAGES ====================

  /**
   * Get all packages
   */
  async getPackages(category = null) {
    const params = category ? `?category=${category}` : '';
    return this.request(`/packages${params}`);
  }

  /**
   * Get packages by category
   */
  async getPackagesByCategory(category) {
    return this.request(`/packages/category/${category}`);
  }

  /**
   * Get featured packages
   */
  async getFeaturedPackages() {
    return this.request('/packages/featured');
  }

  /**
   * Get single package by ID
   */
  async getPackage(id) {
    return this.request(`/packages/${id}`);
  }

  /**
   * Get package categories
   */
  async getCategories() {
    return this.request('/packages/categories');
  }

  // ==================== ORDERS ====================

  /**
   * Create new order
   */
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  /**
   * Get order by ID
   */
  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  /**
   * Get orders by phone number
   */
  async getOrdersByPhone(phoneNumber) {
    return this.request(`/orders/phone/${phoneNumber}`);
  }

  /**
   * Update order status
   */
  async updateOrder(id, updates) {
    return this.request(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Sync offline orders
   */
  async syncOrders(orders) {
    return this.request('/orders/sync', {
      method: 'POST',
      body: JSON.stringify({ orders })
    });
  }

  // ==================== PAYMENTS ====================

  /**
   * Initiate M-PESA STK Push
   */
  async initiatePayment(paymentData) {
    return this.request('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(paymentId) {
    return this.request(`/payments/${paymentId}/status`);
  }

  /**
   * Query M-PESA transaction status
   */
  async queryPayment(paymentId) {
    return this.request(`/payments/${paymentId}/query`, {
      method: 'POST'
    });
  }

  // ==================== USERS ====================

  /**
   * Register or login user by phone
   */
  async registerUser(phoneNumber, deviceId = null) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, deviceId })
    });
  }

  /**
   * Get user by ID
   */
  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  /**
   * Get user by phone
   */
  async getUserByPhone(phoneNumber) {
    return this.request(`/users/phone/${phoneNumber}`);
  }

  /**
   * Update user profile
   */
  async updateUser(id, updates) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Get user order history
   */
  async getUserOrders(userId, options = {}) {
    const params = new URLSearchParams(options).toString();
    return this.request(`/users/${userId}/orders${params ? `?${params}` : ''}`);
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    return this.request(`/users/${userId}/stats`);
  }

  // ==================== HEALTH ====================

  /**
   * Check API health
   */
  async checkHealth() {
    return this.request('/health');
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
