import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { NetworkStatusBadge } from '../ui/NetworkStatusBadge';
import { NotificationPanel } from '../ui/NotificationPanel';
import { TrophyIcon, BellIcon, UserIcon, MenuIcon } from '../ui/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import BeeLogo from '../ui/Beelogo.png';
import './Header.css';

/**
 * Header Component
 * 
 * Contains:
 * - Logo/Brand with Beesam Tech logo
 * - Network status indicator
 * - Notification bell with panel
 * - User menu
 * - Menu toggle (desktop)
 */
export const Header = ({ onMenuClick, showMenuButton = true }) => {
  const { theme } = useTheme();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header__left">
          {showMenuButton && (
            <button 
              className="header__menu-btn"
              onClick={onMenuClick}
              aria-label="Toggle menu"
            >
              <MenuIcon size={24} />
            </button>
          )}
          
          <Link to="/" className="header__brand">
            <div className="header__logo beesam-logo">
              <img src={BeeLogo} alt="BEESAM Tech" className="header__logo-img" />
            </div>
            <div className="header__brand-text">
              <span className="header__brand-name">BEESAM Tech</span>
              <span className="header__brand-tagline">Safaricom Data Packages</span>
            </div>
          </Link>
        </div>

        <div className="header__right">
          <NetworkStatusBadge variant="pill" size="small" />
          
          <button 
            className="header__icon-btn" 
            aria-label="Notifications"
            onClick={() => setShowNotifications(true)}
          >
            <BellIcon size={22} />
            {unreadCount > 0 && (
              <span className="header__notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          <Link to="/profile" className="header__avatar" aria-label="Profile menu">
            <UserIcon size={22} />
          </Link>
        </div>
      </header>

      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
};

export default Header;
