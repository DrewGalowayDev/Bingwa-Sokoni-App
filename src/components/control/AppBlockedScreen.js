/**
 * App Blocked Screen
 * 
 * Shown when the app is remotely disabled by the developer
 * Full-screen blocking overlay that prevents app usage
 */

import React from 'react';
import { useAppControl } from '../../context/AppControlContext';
import './AppBlockedScreen.css';

// Warning Icon
const WarningIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// Phone Icon
const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

// Refresh Icon
const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23,4 23,10 17,10"/>
    <polyline points="1,20 1,14 7,14"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>
);

const AppBlockedScreen = () => {
  const { blockReason, config, refreshConfig, isLoading } = useAppControl();
  const supportNumber = config?.contactSupport || '0725911246';

  const handleCallSupport = () => {
    window.location.href = `tel:${supportNumber}`;
  };

  const handleRefresh = () => {
    refreshConfig();
  };

  return (
    <div className="app-blocked-overlay">
      <div className="app-blocked-container">
        {/* Warning Icon */}
        <div className="blocked-icon">
          <WarningIcon />
        </div>

        {/* Title */}
        <h1 className="blocked-title">App Console Pending</h1>

        {/* Message */}
        <p className="blocked-message">
          {blockReason || 'This app has been temporarily disabled. Please consult the developer for assistance.'}
        </p>

        {/* Divider */}
        <div className="blocked-divider"></div>

        {/* Info Box */}
        <div className="blocked-info">
          <p>If you believe this is an error, please contact support for help.</p>
        </div>

        {/* Action Buttons */}
        <div className="blocked-actions">
          <button 
            className="blocked-btn blocked-btn-primary"
            onClick={handleCallSupport}
          >
            <PhoneIcon />
            <span>Call Support: {supportNumber}</span>
          </button>

          <button 
            className={`blocked-btn blocked-btn-secondary ${isLoading ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshIcon />
            <span>{isLoading ? 'Checking...' : 'Retry Connection'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="blocked-footer">
          <p>BEESAM Tech</p>
          <p className="blocked-version">Version {config?.latestVersion || '1.0.0'}</p>
        </div>
      </div>
    </div>
  );
};

export default AppBlockedScreen;
