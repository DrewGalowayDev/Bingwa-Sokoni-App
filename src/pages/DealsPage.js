import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { PackageCard, PackageCardSkeleton } from '../components/ui/PackageCard';
import { DataIcon, TunukiwaIcon, SmsIcon, MinutesIcon } from '../components/ui/Icons';
import { useNetwork } from '../context/NetworkContext';
import { 
  DATA_PACKAGES, 
  TUNUKIWA_PACKAGES, 
  SMS_PACKAGES, 
  MINUTES_PACKAGES,
  PACKAGE_CATEGORIES 
} from '../data/packages';
import { PurchaseModal } from '../components/purchase/PurchaseModal';
import './DealsPage.css';

/**
 * DealsPage Component
 * 
 * Main deals browsing screen with:
 * - Category tabs/segments
 * - Search functionality
 * - Tunukiwa deals section
 * - Package grid
 */

const TABS = [
  { id: 'data', label: 'Data', Icon: DataIcon, color: '#00C853' },
  { id: 'tunukiwa', label: 'Tunukiwa', Icon: TunukiwaIcon, color: '#FF6B35' },
  { id: 'sms', label: 'SMS', Icon: SmsIcon, color: '#9C27B0' },
  { id: 'minutes', label: 'Minutes', Icon: MinutesIcon, color: '#00BCD4' }
];

const DealsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { isOnline } = useNetwork();
  
  const [activeTab, setActiveTab] = useState(category || 'data');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [sortBy, setSortBy] = useState('price-asc');

  // Get packages for current tab
  const packages = useMemo(() => {
    let pkgs = [];
    switch (activeTab) {
      case 'data':
        pkgs = DATA_PACKAGES;
        break;
      case 'tunukiwa':
        pkgs = TUNUKIWA_PACKAGES;
        break;
      case 'sms':
        pkgs = SMS_PACKAGES;
        break;
      case 'minutes':
        pkgs = MINUTES_PACKAGES;
        break;
      default:
        pkgs = DATA_PACKAGES;
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      pkgs = pkgs.filter(p => 
        p.amount.toLowerCase().includes(query) ||
        p.validity.toLowerCase().includes(query) ||
        p.price.toString().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        pkgs = [...pkgs].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        pkgs = [...pkgs].sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        pkgs = [...pkgs].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
        break;
      default:
        break;
    }

    return pkgs;
  }, [activeTab, searchQuery, sortBy]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/deals/${tabId}`, { replace: true });
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleClosePurchase = () => {
    setSelectedPackage(null);
  };

  const activeTabConfig = TABS.find(t => t.id === activeTab);

  return (
    <div className="deals-page">
      {/* Header */}
      <div className="deals-header">
        <h1 className="deals-title">Browse Deals</h1>
        <p className="deals-subtitle">
          {isOnline 
            ? 'Select a package to purchase instantly' 
            : 'Browsing offline - orders will queue'}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="deals-toolbar">
        <div className="search-box">
          <Search className="search-box__icon" size={20} />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-box__input"
          />
        </div>

        <div className="sort-select">
          <SlidersHorizontal size={16} />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select__input"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="deals-tabs">
        {TABS.map(tab => {
          const { Icon } = tab;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              className={`deals-tab ${isActive ? 'deals-tab--active' : ''}`}
              style={{ '--tab-color': tab.color }}
              onClick={() => handleTabChange(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Header */}
      <div className="tab-content-header">
        <h2 className="tab-content-title">
          {activeTabConfig?.Icon && <activeTabConfig.Icon size={24} />}
          {activeTab === 'tunukiwa' ? 'Tunukiwa Deals' : `${activeTabConfig?.label} Packages`}
        </h2>
        <span className="tab-content-count">{packages.length} packages</span>
      </div>

      {/* Tunukiwa Notice */}
      {activeTab === 'tunukiwa' && (
        <div className="tunukiwa-notice">
          <TunukiwaIcon size={20} />
          <div>
            <strong>Multi-Buy Available!</strong>
            <p>You can purchase these packages multiple times per day.</p>
          </div>
        </div>
      )}

      {/* Data Tab - Include Tunukiwa Sub-section */}
      {activeTab === 'data' && (
        <>
          {/* Regular Data Deals */}
          <div className="deals-section">
            <h3 className="deals-section__title">
              <DataIcon size={18} />
              Data Bundles
              <span className="deals-section__badge">Once per day</span>
            </h3>
            <div className="package-grid">
              {packages.map((pkg, index) => (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  index={index}
                  onSelect={handleSelectPackage}
                />
              ))}
            </div>
          </div>

          {/* Tunukiwa Sub-section */}
          <div className="deals-section deals-section--tunukiwa">
            <h3 className="deals-section__title">
              <TunukiwaIcon size={18} />
              Tunukiwa Deals
              <span className="deals-section__badge deals-section__badge--orange">Multi-Buy</span>
            </h3>
            <div className="package-grid">
              {TUNUKIWA_PACKAGES.map((pkg, index) => (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  index={index + 8}
                  onSelect={handleSelectPackage}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Other Tabs - Just show packages */}
      {activeTab !== 'data' && (
        <div className="package-grid">
          {packages.length > 0 ? (
            packages.map((pkg, index) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                index={index}
                onSelect={handleSelectPackage}
              />
            ))
          ) : (
            <div className="empty-state">
              <Search size={48} />
              <h3>No packages found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
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

export default DealsPage;
