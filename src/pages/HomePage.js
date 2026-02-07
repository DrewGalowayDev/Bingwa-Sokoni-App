import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageCard } from '../components/ui/PackageCard';
import { Button } from '../components/ui/Button';
import { HeroCarousel } from '../components/ui/HeroCarousel';
import { 
  DataIcon, 
  TunukiwaIcon, 
  SmsIcon, 
  MinutesIcon,
  InstantIcon,
  SecureIcon,
  TimeIcon,
  TrendingIcon,
  ArrowRightIcon
} from '../components/ui/Icons';
import { useNetwork } from '../context/NetworkContext';
import { getFeaturedPackages, DATA_PACKAGES, TUNUKIWA_PACKAGES } from '../data/packages';
import { ROUTES } from '../data/constants';
import { PurchaseModal } from '../components/purchase/PurchaseModal';
import './HomePage.css';

/**
 * HomePage Component
 * 
 * Features:
 * - Hero carousel with background images
 * - Real colorful icons
 * - Featured deals
 * - Quick category access
 * - Network status awareness
 */
const HomePage = () => {
  const { isOnline } = useNetwork();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const featuredPackages = getFeaturedPackages().slice(0, 4);

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleClosePurchase = () => {
    setSelectedPackage(null);
  };

  return (
    <div className="home-page">
      {/* Hero Carousel Section */}
      <HeroCarousel>
        <div className="hero__content">
          <h1 className="hero__title">
            Buy Safaricom Packages
            <span className="hero__title-accent"> Instantly</span>
          </h1>
          <p className="hero__subtitle">
            Data, SMS & Minutes at your fingertips. Pay with M-PESA.
          </p>
          
          <div className="hero__actions">
            <Link to={ROUTES.DEALS}>
              <Button size="large" icon={() => <ArrowRightIcon size={18} />} iconPosition="right">
                Browse Deals
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="hero__stats">
            <div className="hero__stat">
              <InstantIcon size={24} />
              <span className="hero__stat-value">Instant</span>
              <span className="hero__stat-label">Delivery</span>
            </div>
            <div className="hero__stat">
              <SecureIcon size={24} />
              <span className="hero__stat-value">Secure</span>
              <span className="hero__stat-label">M-PESA</span>
            </div>
            <div className="hero__stat">
              <TimeIcon size={24} />
              <span className="hero__stat-value">24/7</span>
              <span className="hero__stat-label">Available</span>
            </div>
          </div>
        </div>
      </HeroCarousel>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2 className="section-title">Quick Buy</h2>
        <div className="quick-actions__grid">
          <Link to={`${ROUTES.DEALS}/data`} className="quick-action quick-action--data">
            <div className="quick-action__icon">
              <DataIcon size={32} />
            </div>
            <span className="quick-action__label">Data</span>
          </Link>
          <Link to={`${ROUTES.DEALS}/tunukiwa`} className="quick-action quick-action--tunukiwa">
            <div className="quick-action__icon">
              <TunukiwaIcon size={32} />
            </div>
            <span className="quick-action__label">Tunukiwa</span>
          </Link>
          <Link to={`${ROUTES.DEALS}/sms`} className="quick-action quick-action--sms">
            <div className="quick-action__icon">
              <SmsIcon size={32} />
            </div>
            <span className="quick-action__label">SMS</span>
          </Link>
          <Link to={`${ROUTES.DEALS}/minutes`} className="quick-action quick-action--minutes">
            <div className="quick-action__icon">
              <MinutesIcon size={32} />
            </div>
            <span className="quick-action__label">Minutes</span>
          </Link>
        </div>
      </section>

      {/* Featured Deals */}
      <section className="featured-deals">
        <div className="section-header">
          <h2 className="section-title">
            <TrendingIcon size={24} />
            Popular Deals
          </h2>
          <Link to={ROUTES.DEALS} className="section-link">
            View All <ArrowRightIcon size={16} />
          </Link>
        </div>
        
        <div className="package-grid">
          {featuredPackages.map((pkg, index) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              index={index}
              onSelect={handleSelectPackage}
            />
          ))}
        </div>
      </section>

      {/* Tunukiwa Highlight */}
      <section className="tunukiwa-section">
        <div className="section-header">
          <h2 className="section-title">
            <TunukiwaIcon size={24} />
            Tunukiwa Deals
          </h2>
          <span className="section-badge">Multi-Buy</span>
        </div>
        <p className="section-description">
          Buy multiple times a day! No daily limits.
        </p>
        
        <div className="package-grid">
          {TUNUKIWA_PACKAGES.map((pkg, index) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              index={index + 4}
              onSelect={handleSelectPackage}
            />
          ))}
        </div>
      </section>

      {/* Offline Notice */}
      {!isOnline && (
        <div className="offline-notice">
          <TimeIcon size={20} />
          <div>
            <strong>You're offline</strong>
            <p>You can still browse and queue orders. They'll process when you're back online.</p>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {selectedPackage && (
        <PurchaseModal
          package={selectedPackage}
          isOpen={!!selectedPackage}
          onClose={handleClosePurchase}
        />
      )}
    </div>
  );
};

export default HomePage;
