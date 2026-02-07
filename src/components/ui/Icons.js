import React from 'react';

/**
 * Custom Icon Components
 * Real SVG icons with vibrant colors to replace emojis
 */

// WiFi/Data Icon - Green gradient
export const DataIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="dataGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00E676" />
        <stop offset="100%" stopColor="#00C853" />
      </linearGradient>
    </defs>
    <path 
      d="M12 3C7.03 3 2.7 5.06.25 8.25l1.5 1.5C3.8 7.05 7.65 5.5 12 5.5s8.2 1.55 10.25 4.25l1.5-1.5C21.3 5.06 16.97 3 12 3zm0 5c-3.35 0-6.4 1.29-8.75 3.4l1.5 1.5C6.55 11.16 9.1 10.5 12 10.5s5.45.66 7.25 2.4l1.5-1.5C18.4 9.29 15.35 8 12 8zm0 5c-1.98 0-3.78.74-5.15 1.95l1.5 1.5C9.3 15.55 10.55 15 12 15s2.7.55 3.65 1.45l1.5-1.5C15.78 13.74 13.98 13 12 13z" 
      fill="url(#dataGrad)"
    />
    <circle cx="12" cy="19" r="2" fill="url(#dataGrad)" />
  </svg>
);

// Fire/Tunukiwa Icon - Orange/Red gradient  
export const TunukiwaIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="fireGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF5722" />
        <stop offset="50%" stopColor="#FF9800" />
        <stop offset="100%" stopColor="#FFC107" />
      </linearGradient>
    </defs>
    <path 
      d="M12 23c-4.97 0-9-3.13-9-7 0-2.16 1.17-4.16 3-6 .58 1.22 2.29 2.48 4 3 0-3 1.5-6.5 5-9 .33 2.33 1 4.08 2 5.25 1.5 1.75 3 3.92 3 6.75 0 3.87-4.03 7-9 7zm0-2c3.31 0 6-1.79 6-4 0-1.79-.79-3.29-1.75-4.5-.71-.89-1.25-1.83-1.5-2.75-.73 1.58-1.75 2.75-1.75 4.75 0 .55-.45 1-1 1s-1-.45-1-1c0-1.58-.67-2.75-2-3.5-.65.83-1 1.83-1 2.5 0 2.21 2.24 4 5 4z" 
      fill="url(#fireGrad)"
    />
  </svg>
);

// Message/SMS Icon - Purple gradient
export const SmsIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="smsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E040FB" />
        <stop offset="100%" stopColor="#9C27B0" />
      </linearGradient>
    </defs>
    <path 
      d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" 
      fill="url(#smsGrad)"
    />
    <circle cx="8" cy="10" r="1.5" fill="url(#smsGrad)" />
    <circle cx="12" cy="10" r="1.5" fill="url(#smsGrad)" />
    <circle cx="16" cy="10" r="1.5" fill="url(#smsGrad)" />
  </svg>
);

// Phone/Minutes Icon - Blue/Cyan gradient
export const MinutesIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00BCD4" />
        <stop offset="100%" stopColor="#2196F3" />
      </linearGradient>
    </defs>
    <path 
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" 
      fill="url(#phoneGrad)"
    />
  </svg>
);

// Lightning/Instant Icon - Yellow/Gold gradient
export const InstantIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="instantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD600" />
        <stop offset="100%" stopColor="#FF9800" />
      </linearGradient>
    </defs>
    <path 
      d="M7 2v11h3v9l7-12h-4l4-8H7z" 
      fill="url(#instantGrad)"
    />
  </svg>
);

// Shield/Security Icon - Green/Teal gradient
export const SecureIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="secureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#26A69A" />
        <stop offset="100%" stopColor="#00897B" />
      </linearGradient>
    </defs>
    <path 
      d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" 
      fill="url(#secureGrad)"
    />
    <path 
      d="M10 12l-2 2 4 4 6-6-2-2-4 4-2-2z" 
      fill="url(#secureGrad)"
    />
  </svg>
);

// Clock/Time Icon - Coral/Pink gradient
export const TimeIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="timeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF7043" />
        <stop offset="100%" stopColor="#F4511E" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" 
      fill="url(#timeGrad)"
    />
  </svg>
);

// Trophy/Champion Icon - Gold gradient
export const TrophyIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFA000" />
        <stop offset="100%" stopColor="#FF8F00" />
      </linearGradient>
    </defs>
    <path 
      d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H8v2h8v-2h-3v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" 
      fill="url(#trophyGrad)"
    />
  </svg>
);

// Star/Popular Icon - Multicolor gradient
export const StarIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FF6B35" />
      </linearGradient>
    </defs>
    <path 
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" 
      fill="url(#starGrad)"
    />
  </svg>
);

// Trending Up Icon - Green gradient
export const TrendingIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="trendGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00C853" />
        <stop offset="100%" stopColor="#64DD17" />
      </linearGradient>
    </defs>
    <path 
      d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" 
      fill="url(#trendGrad)"
    />
  </svg>
);

// Arrow Right Icon
export const ArrowRightIcon = ({ size = 24, className = '', color = '#fff' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" 
      fill={color}
    />
  </svg>
);

// Notification Bell Icon
export const BellIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="bellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFC107" />
        <stop offset="100%" stopColor="#FF9800" />
      </linearGradient>
    </defs>
    <path 
      d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" 
      fill="url(#bellGrad)"
    />
  </svg>
);

// User Profile Icon
export const UserIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="userGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#42A5F5" />
        <stop offset="100%" stopColor="#1976D2" />
      </linearGradient>
    </defs>
    <path 
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 8c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 4c.22-.72 3.31-2 6-2s5.78 1.28 6 2H6z" 
      fill="url(#userGrad)"
    />
  </svg>
);

// Menu/Hamburger Icon
export const MenuIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" 
      fill={color}
    />
  </svg>
);

export default {
  DataIcon,
  TunukiwaIcon,
  SmsIcon,
  MinutesIcon,
  InstantIcon,
  SecureIcon,
  TimeIcon,
  TrophyIcon,
  StarIcon,
  TrendingIcon,
  ArrowRightIcon,
  BellIcon,
  UserIcon,
  MenuIcon
};
