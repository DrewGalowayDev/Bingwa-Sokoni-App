import React from 'react';
import { Wifi, WifiOff, Signal } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import './NetworkStatusBadge.css';

/**
 * Network Status Badge
 * Shows online/offline status with visual feedback
 * Critical component for offline-first UX
 */
export const NetworkStatusBadge = ({ 
  variant = 'default', 
  showLabel = true,
  size = 'medium'
}) => {
  const { isOnline, connectionType } = useNetwork();

  const getConnectionIcon = () => {
    if (!isOnline) return WifiOff;
    if (connectionType === '4g' || connectionType === 'wifi') return Wifi;
    return Signal;
  };

  const Icon = getConnectionIcon();

  return (
    <div 
      className={`network-badge network-badge--${variant} network-badge--${size} ${isOnline ? 'online' : 'offline'}`}
      role="status"
      aria-live="polite"
    >
      <span className="network-badge__indicator" />
      <Icon className="network-badge__icon" />
      {showLabel && (
        <span className="network-badge__label">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
};

/**
 * Offline Banner
 * Full-width banner shown when offline
 */
export const OfflineBanner = () => {
  const { isOnline } = useNetwork();

  if (isOnline) return null;

  return (
    <div className="offline-banner" role="alert">
      <WifiOff size={16} />
      <span>You're offline. Orders will be saved and synced when you reconnect.</span>
    </div>
  );
};

export default NetworkStatusBadge;
