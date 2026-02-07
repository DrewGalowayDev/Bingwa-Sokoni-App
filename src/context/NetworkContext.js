import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Network Context
 * Manages online/offline state globally
 * Critical for offline-first architecture
 */

const NetworkContext = createContext({
  isOnline: true,
  lastOnline: null,
  connectionType: 'unknown'
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnline, setLastOnline] = useState(
    navigator.onLine ? new Date() : null
  );
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    // Update connection type if available
    if ('connection' in navigator) {
      setConnectionType(navigator.connection?.effectiveType || 'unknown');
    }

    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes
    if ('connection' in navigator) {
      navigator.connection?.addEventListener('change', () => {
        setConnectionType(navigator.connection?.effectiveType || 'unknown');
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, lastOnline, connectionType }}>
      {children}
    </NetworkContext.Provider>
  );
};
