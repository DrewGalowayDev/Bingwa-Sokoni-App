import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../data/constants';
import './BottomNav.css';

/**
 * BottomNav Component
 * Mobile bottom tab navigation with colorful icons
 */

// Custom colorful icons for navigation
const HomeIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="homeGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4CAF50" />
        <stop offset="100%" stopColor="#2E7D32" />
      </linearGradient>
    </defs>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" fill="url(#homeGradNav)" />
  </svg>
);

const DealsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="dealsGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF9800" />
        <stop offset="100%" stopColor="#F57C00" />
      </linearGradient>
    </defs>
    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" fill="url(#dealsGradNav)" />
  </svg>
);

const OrdersIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="ordersGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2196F3" />
        <stop offset="100%" stopColor="#1565C0" />
      </linearGradient>
    </defs>
    <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" fill="url(#ordersGradNav)" />
  </svg>
);

const WalletIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="walletGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9C27B0" />
        <stop offset="100%" stopColor="#7B1FA2" />
      </linearGradient>
    </defs>
    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="url(#walletGradNav)" />
  </svg>
);

const ProfileIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="profileGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00BCD4" />
        <stop offset="100%" stopColor="#0097A7" />
      </linearGradient>
    </defs>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="url(#profileGradNav)" />
  </svg>
);

const NAV_ITEMS = [
  { path: ROUTES.HOME, Icon: HomeIcon, label: 'Home' },
  { path: ROUTES.DEALS, Icon: DealsIcon, label: 'Deals' },
  { path: ROUTES.ORDERS, Icon: OrdersIcon, label: 'Orders' },
  { path: ROUTES.WALLET, Icon: WalletIcon, label: 'Wallet' },
  { path: ROUTES.PROFILE, Icon: ProfileIcon, label: 'Profile' }
];

export const BottomNav = ({ currentPath }) => {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map(item => {
        const { Icon } = item;
        const isActive = currentPath === item.path || 
          (item.path !== '/' && currentPath.startsWith(item.path));

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
          >
            <span className="bottom-nav__icon">
              <Icon size={24} />
            </span>
            <span className="bottom-nav__label">{item.label}</span>
            {isActive && <span className="bottom-nav__indicator" />}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
