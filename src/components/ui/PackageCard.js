import React from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { PACKAGE_CATEGORIES } from '../../data/packages';
import { DataIcon, TunukiwaIcon, SmsIcon, MinutesIcon, StarIcon } from './Icons';
import './PackageCard.css';

/**
 * PackageCard Component
 * Modern glassmorphism 3D card for displaying telecom packages
 * 
 * Features:
 * - Glassmorphism effect with 3D appearance
 * - Vibrant gradient backgrounds
 * - Real SVG icons with colors
 * - Smooth hover animations
 * - Responsive design
 */

// Card gradient colors - softer, muted tones
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #D97706 0%, #B45309 100%)', // Muted Orange
  'linear-gradient(135deg, #059669 0%, #047857 100%)', // Muted Green
  'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)', // Muted Purple
  'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)', // Muted Red
  'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)', // Muted Cyan
  'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)', // Muted Orange-Red
  'linear-gradient(135deg, #16A34A 0%, #15803D 100%)', // Forest Green
  'linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)', // Muted Violet
  'linear-gradient(135deg, #CA8A04 0%, #A16207 100%)', // Muted Yellow/Gold
  'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', // Muted Blue
];

export const PackageCard = ({ 
  package: pkg, 
  onSelect,
  isQueued = false,
  index = 0
}) => {
  const { isOnline } = useNetwork();
  
  const getCategoryIcon = () => {
    switch (pkg.category) {
      case PACKAGE_CATEGORIES.DATA:
        return DataIcon;
      case PACKAGE_CATEGORIES.TUNUKIWA:
        return TunukiwaIcon;
      case PACKAGE_CATEGORIES.SMS:
        return SmsIcon;
      case PACKAGE_CATEGORIES.MINUTES:
        return MinutesIcon;
      default:
        return DataIcon;
    }
  };

  const Icon = getCategoryIcon();
  
  // Get gradient based on index for variety
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  const handleClick = () => {
    if (onSelect) {
      onSelect(pkg);
    }
  };

  return (
    <div 
      className={`package-card ${isQueued ? 'package-card--queued' : ''}`}
      style={{ '--card-gradient': gradient }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Glassmorphism inner layer */}
      <div className="package-card__glass" />
      
      {/* 3D Light effect */}
      <div className="package-card__shine" />
      
      {/* Badges */}
      <div className="package-card__badges">
        {pkg.popular && (
          <span className="package-card__badge package-card__badge--popular">
            <StarIcon size={12} />
            Popular
          </span>
        )}
        {pkg.multiBuy && (
          <span className="package-card__badge package-card__badge--multi">
            Multi-Buy
          </span>
        )}
        {!isOnline && (
          <span className="package-card__badge package-card__badge--offline">
            Offline
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="package-card__content">
        {/* Validity/Duration at top */}
        <div className="package-card__validity">{pkg.validity}</div>

        {/* Price in center */}
        <div className="package-card__price">
          <span className="package-card__currency">Ksh</span>
          <span className="package-card__price-value">{pkg.price}</span>
        </div>

        {/* Amount/Speed at bottom */}
        <div className="package-card__amount">{pkg.amount}</div>
      </div>

      {/* Queued Overlay */}
      {isQueued && (
        <div className="package-card__queued-overlay">
          <Icon size={24} />
          <span>Queued</span>
        </div>
      )}
    </div>
  );
};

/**
 * PackageCardSkeleton - Loading placeholder
 */
export const PackageCardSkeleton = () => (
  <div className="package-card package-card--skeleton">
    <div className="package-card__content">
      <div className="skeleton skeleton--text" style={{ width: '60%', height: '16px' }} />
      <div className="skeleton skeleton--text" style={{ width: '40%', height: '32px', marginTop: '12px' }} />
      <div className="skeleton skeleton--text" style={{ width: '50%', height: '14px', marginTop: '8px' }} />
    </div>
  </div>
);

export default PackageCard;
