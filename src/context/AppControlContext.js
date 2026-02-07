/**
 * App Control Context
 * 
 * Remote control system for the app
 * Checks a remote config to determine if app should be enabled/disabled
 * Config is hosted on GitHub Pages for easy management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppControlContext = createContext();

// IMPORTANT: Update this URL after hosting on GitHub Pages
// Format: https://yourusername.github.io/your-repo-name/app-config.json
const CONFIG_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/beesam-control/main/app-config.json';

// Fallback config if remote fetch fails (app works by default)
const DEFAULT_CONFIG = {
  appEnabled: true,
  message: '',
  title: 'BEESAM Data',
  maintenanceMode: false,
  maintenanceMessage: 'App is under maintenance. Please try again later.',
  minVersion: '1.0.0',
  latestVersion: '1.0.0',
  forceUpdate: false,
  updateUrl: '',
  announcements: [],
  features: {
    stkPush: false,
    simToolkit: true,
    wallet: true,
    orders: true
  },
  contactSupport: '0725911246',
  lastUpdated: new Date().toISOString()
};

// Current app version
const APP_VERSION = '1.0.0';

export const AppControlProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [lastCheck, setLastCheck] = useState(null);

  // Fetch remote config
  const fetchConfig = useCallback(async () => {
    try {
      // Add cache-busting parameter
      const response = await fetch(`${CONFIG_URL}?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch config');
      }

      const remoteConfig = await response.json();
      
      // Merge with defaults
      const mergedConfig = { ...DEFAULT_CONFIG, ...remoteConfig };
      setConfig(mergedConfig);
      
      // Check if app should be blocked
      if (!mergedConfig.appEnabled) {
        setIsBlocked(true);
        setBlockReason(mergedConfig.message || 'App is currently disabled. Please contact support.');
      } else if (mergedConfig.maintenanceMode) {
        setIsBlocked(true);
        setBlockReason(mergedConfig.maintenanceMessage);
      } else if (mergedConfig.forceUpdate && compareVersions(APP_VERSION, mergedConfig.minVersion) < 0) {
        setIsBlocked(true);
        setBlockReason(`Please update to version ${mergedConfig.latestVersion} to continue using the app.`);
      } else {
        setIsBlocked(false);
        setBlockReason('');
      }

      setLastCheck(new Date());
      
      // Store config locally for offline access
      localStorage.setItem('beesam_app_config', JSON.stringify(mergedConfig));
      localStorage.setItem('beesam_config_timestamp', Date.now().toString());
      
    } catch (error) {
      console.log('Failed to fetch remote config, using cached/default:', error);
      
      // Try to use cached config
      const cachedConfig = localStorage.getItem('beesam_app_config');
      const cacheTimestamp = localStorage.getItem('beesam_config_timestamp');
      
      if (cachedConfig) {
        const parsed = JSON.parse(cachedConfig);
        const cacheAge = Date.now() - parseInt(cacheTimestamp || '0');
        
        // Use cached config if less than 24 hours old
        if (cacheAge < 24 * 60 * 60 * 1000) {
          setConfig(parsed);
          if (!parsed.appEnabled) {
            setIsBlocked(true);
            setBlockReason(parsed.message || 'App is currently disabled.');
          }
        } else {
          // Cache too old, use defaults (allow app to work)
          setConfig(DEFAULT_CONFIG);
        }
      } else {
        // No cache, use defaults
        setConfig(DEFAULT_CONFIG);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Compare version strings
  const compareVersions = (v1, v2) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }
    return 0;
  };

  // Initial fetch
  useEffect(() => {
    fetchConfig();
    
    // Check config every 5 minutes
    const interval = setInterval(fetchConfig, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchConfig]);

  // Re-check when app becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchConfig();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchConfig]);

  const value = {
    config,
    isLoading,
    isBlocked,
    blockReason,
    lastCheck,
    refreshConfig: fetchConfig,
    appVersion: APP_VERSION,
    isFeatureEnabled: (feature) => config.features?.[feature] ?? true
  };

  return (
    <AppControlContext.Provider value={value}>
      {children}
    </AppControlContext.Provider>
  );
};

export const useAppControl = () => {
  const context = useContext(AppControlContext);
  if (!context) {
    throw new Error('useAppControl must be used within AppControlProvider');
  }
  return context;
};

export default AppControlContext;
