import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './Toast.css';

/**
 * Toast Notification System
 * Provides global notification capability
 */

const ToastContext = createContext({
  showToast: () => {},
  hideToast: () => {}
});

export const useToast = () => useContext(ToastContext);

const TOAST_TYPES = {
  success: { icon: CheckCircle, color: 'var(--color-success)' },
  error: { icon: AlertCircle, color: 'var(--color-error)' },
  warning: { icon: AlertTriangle, color: 'var(--color-warning)' },
  info: { icon: Info, color: 'var(--color-info)' }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }

    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => {
          const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
          const Icon = config.icon;
          
          return (
            <div
              key={toast.id}
              className={`toast toast-${toast.type}`}
              style={{ '--toast-color': config.color }}
            >
              <Icon className="toast-icon" size={20} />
              <span className="toast-message">{toast.message}</span>
              <button
                className="toast-close"
                onClick={() => hideToast(toast.id)}
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
