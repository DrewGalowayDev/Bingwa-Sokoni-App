import { useState, useCallback } from 'react';
import { useNetwork } from '../context/NetworkContext';
import apiService from '../services/api';

/**
 * Custom hook for API calls with loading, error states, and offline handling
 */
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isOnline } = useNetwork();

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      showError = true, 
      offlineFallback = null,
      requireOnline = false 
    } = options;

    // Check if we require online and are offline
    if (requireOnline && !isOnline) {
      const offlineError = new Error('This action requires an internet connection');
      setError(offlineError);
      return { success: false, error: offlineError };
    }

    // Return fallback if offline and fallback provided
    if (!isOnline && offlineFallback !== null) {
      return { success: true, data: offlineFallback, offline: true };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setLoading(false);
      return { success: true, ...result };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.message || 'An error occurred';
      setError(showError ? errorMessage : null);
      return { success: false, error: errorMessage };
    }
  }, [isOnline]);

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, execute, clearError, isOnline };
}

/**
 * Hook for fetching packages
 */
export function usePackages() {
  const { loading, error, execute, isOnline } = useApi();
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchPackages = useCallback(async (category = null) => {
    const result = await execute(
      () => apiService.getPackages(category),
      { offlineFallback: [] }
    );
    
    if (result.success && result.data) {
      setPackages(result.data.packages || []);
    }
    return result;
  }, [execute]);

  const fetchCategories = useCallback(async () => {
    const result = await execute(
      () => apiService.getCategories(),
      { offlineFallback: [] }
    );
    
    if (result.success && result.data) {
      setCategories(result.data);
    }
    return result;
  }, [execute]);

  const fetchFeatured = useCallback(async () => {
    const result = await execute(
      () => apiService.getFeaturedPackages(),
      { offlineFallback: [] }
    );
    return result;
  }, [execute]);

  return {
    packages,
    categories,
    loading,
    error,
    isOnline,
    fetchPackages,
    fetchCategories,
    fetchFeatured
  };
}

/**
 * Hook for order operations
 */
export function useOrders() {
  const { loading, error, execute, clearError, isOnline } = useApi();
  const [orders, setOrders] = useState([]);

  const createOrder = useCallback(async (orderData) => {
    return execute(
      () => apiService.createOrder(orderData),
      { requireOnline: true }
    );
  }, [execute]);

  const fetchOrders = useCallback(async (phoneNumber) => {
    const result = await execute(
      () => apiService.getOrdersByPhone(phoneNumber),
      { offlineFallback: [] }
    );
    
    if (result.success && result.data) {
      setOrders(result.data);
    }
    return result;
  }, [execute]);

  const getOrder = useCallback(async (orderId) => {
    return execute(() => apiService.getOrder(orderId));
  }, [execute]);

  const updateOrder = useCallback(async (orderId, updates) => {
    return execute(
      () => apiService.updateOrder(orderId, updates),
      { requireOnline: true }
    );
  }, [execute]);

  const syncOrders = useCallback(async (pendingOrders) => {
    return execute(
      () => apiService.syncOrders(pendingOrders),
      { requireOnline: true }
    );
  }, [execute]);

  return {
    orders,
    loading,
    error,
    isOnline,
    createOrder,
    fetchOrders,
    getOrder,
    updateOrder,
    syncOrders,
    clearError
  };
}

/**
 * Hook for payment operations
 */
export function usePayments() {
  const { loading, error, execute, clearError, isOnline } = useApi();

  const initiatePayment = useCallback(async (paymentData) => {
    return execute(
      () => apiService.initiatePayment(paymentData),
      { requireOnline: true }
    );
  }, [execute]);

  const checkStatus = useCallback(async (paymentId) => {
    return execute(
      () => apiService.getPaymentStatus(paymentId),
      { requireOnline: true }
    );
  }, [execute]);

  const queryPayment = useCallback(async (paymentId) => {
    return execute(
      () => apiService.queryPayment(paymentId),
      { requireOnline: true }
    );
  }, [execute]);

  return {
    loading,
    error,
    isOnline,
    initiatePayment,
    checkStatus,
    queryPayment,
    clearError
  };
}

/**
 * Hook for user operations
 */
export function useUser() {
  const { loading, error, execute, clearError, isOnline } = useApi();
  const [user, setUser] = useState(null);

  const register = useCallback(async (phoneNumber, deviceId) => {
    const result = await execute(
      () => apiService.registerUser(phoneNumber, deviceId),
      { requireOnline: true }
    );
    
    if (result.success && result.data) {
      setUser(result.data);
      // Store in localStorage for persistence
      localStorage.setItem('bingwa_user', JSON.stringify(result.data));
    }
    return result;
  }, [execute]);

  const loadUser = useCallback(() => {
    const stored = localStorage.getItem('bingwa_user');
    if (stored) {
      setUser(JSON.parse(stored));
      return JSON.parse(stored);
    }
    return null;
  }, []);

  const updateProfile = useCallback(async (userId, updates) => {
    const result = await execute(
      () => apiService.updateUser(userId, updates),
      { requireOnline: true }
    );
    
    if (result.success && result.data) {
      setUser(result.data);
      localStorage.setItem('bingwa_user', JSON.stringify(result.data));
    }
    return result;
  }, [execute]);

  const getStats = useCallback(async (userId) => {
    return execute(
      () => apiService.getUserStats(userId),
      { offlineFallback: null }
    );
  }, [execute]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('bingwa_user');
  }, []);

  return {
    user,
    loading,
    error,
    isOnline,
    register,
    loadUser,
    updateProfile,
    getStats,
    logout,
    clearError
  };
}

export default useApi;
