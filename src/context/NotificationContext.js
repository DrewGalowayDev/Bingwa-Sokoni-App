import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Notification Context
 * Handles in-app notifications and push notification setup
 */

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const STORAGE_KEY = 'bingwa_notifications';

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permission, setPermission] = useState('default');

  // Load notifications from storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }

    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Save notifications to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return { success: false, error: 'Notifications not supported' };
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return { success: result === 'granted', permission: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Add notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50

    // Show browser notification if permitted
    if (permission === 'granted' && notification.showPush !== false) {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: newNotification.id,
          vibrate: [200, 100, 200]
        });
      } catch (e) {
        console.log('Push notification failed:', e);
      }
    }

    return newNotification;
  }, [permission]);

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Delete notification
  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Notification types helpers
  const notifySuccess = useCallback((title, message) => {
    return addNotification({ type: 'success', title, message });
  }, [addNotification]);

  const notifyError = useCallback((title, message) => {
    return addNotification({ type: 'error', title, message });
  }, [addNotification]);

  const notifyPayment = useCallback((status, details) => {
    const isSuccess = status === 'success';
    return addNotification({
      type: isSuccess ? 'success' : 'error',
      title: isSuccess ? 'Payment Successful!' : 'Payment Failed',
      message: details,
      category: 'payment'
    });
  }, [addNotification]);

  const notifyOrder = useCallback((status, packageName) => {
    const messages = {
      pending: `Your order for ${packageName} is being processed`,
      completed: `${packageName} has been activated on your line!`,
      failed: `Order for ${packageName} failed. Please try again.`,
      queued: `${packageName} has been queued for when you're back online`
    };
    
    return addNotification({
      type: status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'info',
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: messages[status] || `Order status: ${status}`,
      category: 'order'
    });
  }, [addNotification]);

  const value = {
    notifications,
    unreadCount,
    permission,
    requestPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    notifySuccess,
    notifyError,
    notifyPayment,
    notifyOrder
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
