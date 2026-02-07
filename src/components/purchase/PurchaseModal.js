import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useNetwork } from '../../context/NetworkContext';
import { useToast } from '../ui/Toast';
import { useNotifications } from '../../context/NotificationContext';
import { CATEGORY_GRADIENTS } from '../../data/packages';
import { isValidPhoneNumber, formatPhoneNumber } from '../../data/constants';
import { useOrderStore } from '../../store/orderStore';
import './PurchaseModal.css';

/**
 * PurchaseModal Component
 * 
 * Handles the package purchase flow:
 * 1. Show package details
 * 2. Collect phone number with autosuggest from saved numbers
 * 3. Choose payment method (STK Push - Coming Soon, or Manual Payment)
 * 4. Process payment
 */

const STEPS = {
  DETAILS: 'details',
  PAYMENT_METHOD: 'payment_method',
  MANUAL_PAYMENT: 'manual_payment',
  CONFIRM: 'confirm',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  QUEUED: 'queued',
  ERROR: 'error'
};

const PAYMENT_METHODS = {
  STK_PUSH: 'stk_push',
  MANUAL: 'manual'
};

// Paybill number
const PAYBILL_NUMBER = '3720688';

// Icons as inline SVG
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const WifiOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/>
    <path d="M5 12.55a10.94 10.94 0 015.17-2.39"/>
    <path d="M10.71 5.05A16 16 0 0122.58 9"/>
    <path d="M1.42 9a15.91 15.91 0 014.7-2.88"/>
    <path d="M8.53 16.11a6 6 0 016.95 0"/>
    <line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);

const LoaderIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
    <path d="M21 12a9 9 0 11-6.219-8.56"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const MpesaIcon = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#4CAF50"/>
    <text x="24" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">M</text>
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

const CheckSmallIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const ComingSoonIcon = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#9CA3AF"/>
    <circle cx="24" cy="20" r="8" stroke="white" strokeWidth="2" fill="none"/>
    <path d="M24 16v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <text x="24" y="40" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">SOON</text>
  </svg>
);

// Get saved phone numbers from localStorage
const getSavedPhoneNumbers = () => {
  try {
    const saved = localStorage.getItem('savedPhoneNumbers');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save phone number to localStorage
const savePhoneNumber = (phoneNumber) => {
  try {
    const saved = getSavedPhoneNumbers();
    const formatted = formatPhoneNumber(phoneNumber);
    if (!saved.includes(formatted)) {
      const updated = [formatted, ...saved].slice(0, 10); // Keep last 10
      localStorage.setItem('savedPhoneNumbers', JSON.stringify(updated));
    }
  } catch {
    // Ignore errors
  }
};

export const PurchaseModal = ({ package: pkg, isOpen, onClose }) => {
  const { isOnline } = useNetwork();
  const { showToast } = useToast();
  const { notifySuccess, notifyInfo } = useNotifications();
  const addOrder = useOrderStore((state) => state.addOrder);
  
  const [step, setStep] = useState(STEPS.DETAILS);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPaybill, setCopiedPaybill] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const savedNumbers = useMemo(() => getSavedPhoneNumbers(), []);

  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!phoneNumber) return savedNumbers;
    const input = phoneNumber.replace(/\D/g, '');
    return savedNumbers.filter(num => {
      const numDigits = num.replace(/\D/g, '');
      return numDigits.includes(input);
    });
  }, [phoneNumber, savedNumbers]);

  const gradient = pkg ? (CATEGORY_GRADIENTS[pkg.category] || { primary: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }) : { primary: '' };

  const validatePhone = (value) => {
    if (!value) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (!isValidPhoneNumber(value)) {
      setPhoneError('Enter a valid Safaricom number (07XX or 01XX)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setPhoneNumber(value);
    setShowSuggestions(true);
    if (phoneError) validatePhone(value);
  };

  const handleSelectSuggestion = (number) => {
    const digits = number.replace(/\D/g, '');
    // Convert 254... to 07... format for input
    const formatted = digits.startsWith('254') ? '0' + digits.slice(3) : digits;
    setPhoneNumber(formatted);
    setShowSuggestions(false);
    validatePhone(formatted);
  };

  const handleProceed = () => {
    if (validatePhone(phoneNumber)) {
      savePhoneNumber(phoneNumber);
      setStep(STEPS.PAYMENT_METHOD);
    }
  };

  const handleSelectPaymentMethod = (method) => {
    if (method === PAYMENT_METHODS.STK_PUSH) {
      // Show coming soon message
      showToast('STK Push coming soon! Please use Direct Payment.', 'info');
      notifyInfo('Coming Soon', 'STK Push payment will be available soon. Use Direct Payment for now.');
      return;
    }
    setPaymentMethod(method);
    setStep(STEPS.MANUAL_PAYMENT);
  };

  const copyPaybill = async () => {
    try {
      await navigator.clipboard.writeText(PAYBILL_NUMBER);
      setCopiedPaybill(true);
      showToast('Paybill copied!', 'success');
      setTimeout(() => setCopiedPaybill(false), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const handleManualPaymentRedirect = () => {
    // Open USSD for Lipa na M-Pesa
    const ussdCode = '*334#';
    window.location.href = `tel:${encodeURIComponent(ussdCode)}`;
    
    const order = {
      id: `ORD-${Date.now()}`,
      packageId: pkg.id,
      packageName: pkg.amount,
      packagePrice: pkg.price,
      packageValidity: pkg.validity,
      category: pkg.category,
      phoneNumber: formatPhoneNumber(phoneNumber),
      paymentMethod: PAYMENT_METHODS.MANUAL,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    addOrder(order);
    notifySuccess('Payment Started', `Dial *334# → Lipa na M-PESA → Pay Bill → ${PAYBILL_NUMBER} → KES ${pkg.price}`);
    setStep(STEPS.SUCCESS);
  };

  const handleConfirmPurchase = async () => {
    setIsLoading(true);

    const order = {
      id: `ORD-${Date.now()}`,
      packageId: pkg.id,
      packageName: pkg.amount,
      packagePrice: pkg.price,
      packageValidity: pkg.validity,
      category: pkg.category,
      phoneNumber: formatPhoneNumber(phoneNumber),
      paymentMethod: paymentMethod,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    if (!isOnline) {
      order.status = 'queued';
      addOrder(order);
      setStep(STEPS.QUEUED);
      showToast('Order queued! Will process when online.', 'info');
      notifyInfo('Order Queued', 'Your order has been saved and will be processed when you are back online.');
      setIsLoading(false);
      return;
    }

    // For manual payment, redirect
    if (paymentMethod === PAYMENT_METHODS.MANUAL) {
      handleManualPaymentRedirect();
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setStep(STEPS.DETAILS);
    setPhoneNumber('');
    setPhoneError('');
    setPaymentMethod(null);
    setCopiedPaybill(false);
    setShowSuggestions(false);
    onClose();
  };

  const renderContent = () => {
    if (!pkg) return null;

    switch (step) {
      case STEPS.DETAILS:
        return (
          <>
            {/* Package Summary */}
            <div className="purchase-package-card" style={{ background: gradient.primary }}>
              <div className="purchase-package-amount">{pkg.amount}</div>
              <div className="purchase-package-validity">{pkg.validity}</div>
              <div className="purchase-package-price">
                <span className="currency">KES</span>
                <span className="value">{pkg.price}</span>
              </div>
            </div>

            {/* Phone Input with Autosuggest */}
            <div className="purchase-form">
              <label className="purchase-label">
                <PhoneIcon />
                Phone Number to Receive Bundle
              </label>
              <div className="phone-input-wrapper">
                <span className="phone-prefix">+254</span>
                <input
                  type="tel"
                  placeholder="7XX XXX XXX"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className={`phone-input ${phoneError ? 'phone-input--error' : ''}`}
                  autoFocus
                />
              </div>
              {phoneError && <span className="phone-error">{phoneError}</span>}
              
              {/* Phone Number Suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="phone-suggestions">
                  <div className="phone-suggestions__header">Recent Numbers</div>
                  {filteredSuggestions.map((num, idx) => (
                    <button
                      key={idx}
                      className="phone-suggestion"
                      onMouseDown={() => handleSelectSuggestion(num)}
                    >
                      <PhoneIcon />
                      <span>+{num}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Offline Notice */}
            {!isOnline && (
              <div className="purchase-offline-notice">
                <WifiOffIcon />
                <span>You're offline. Order will be queued.</span>
              </div>
            )}
          </>
        );

      case STEPS.PAYMENT_METHOD:
        return (
          <div className="payment-method-selection">
            <h3>Choose Payment Method</h3>
            <p>How would you like to pay for this bundle?</p>

            <div className="payment-options">
              {/* STK Push - Coming Soon */}
              <button 
                className="payment-option payment-option--disabled"
                onClick={() => handleSelectPaymentMethod(PAYMENT_METHODS.STK_PUSH)}
              >
                <ComingSoonIcon />
                <div className="payment-option-info">
                  <strong>Pay via App (STK Push)</strong>
                  <span className="coming-soon-badge">Coming Soon</span>
                  <span>M-PESA prompt will appear on your phone</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>

              {/* Manual Payment - Recommended */}
              <button 
                className="payment-option payment-option--recommended"
                onClick={() => handleSelectPaymentMethod(PAYMENT_METHODS.MANUAL)}
              >
                <MpesaIcon />
                <div className="payment-option-info">
                  <strong>Direct Payment</strong>
                  <span className="recommended-badge">Recommended</span>
                  <span>Pay via M-PESA Paybill</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>
            </div>

            <button className="back-btn" onClick={() => setStep(STEPS.DETAILS)}>
              ← Back
            </button>
          </div>
        );

      case STEPS.MANUAL_PAYMENT:
        return (
          <div className="manual-payment">
            <h3>Direct M-PESA Payment</h3>
            
            {/* Paybill Card */}
            <div className="paybill-info-card">
              <div className="paybill-info-header">
                <MpesaIcon />
                <span>Lipa na M-PESA</span>
              </div>
              
              <div className="paybill-details">
                <div className="paybill-row">
                  <span className="paybill-label">Paybill Number</span>
                  <div className="paybill-value-row">
                    <span className="paybill-value">{PAYBILL_NUMBER}</span>
                    <button className="copy-btn" onClick={copyPaybill}>
                      {copiedPaybill ? <CheckSmallIcon /> : <CopyIcon />}
                      {copiedPaybill ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                
                <div className="paybill-row">
                  <span className="paybill-label">Account Number</span>
                  <span className="paybill-value">+{formatPhoneNumber(phoneNumber)}</span>
                </div>
                
                <div className="paybill-row paybill-row--amount">
                  <span className="paybill-label">Amount</span>
                  <span className="paybill-value paybill-value--amount">KES {pkg.price}</span>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="payment-steps">
              <h4>How to Pay:</h4>
              <ol>
                <li>Go to M-PESA on your phone</li>
                <li>Select <strong>Lipa na M-PESA</strong></li>
                <li>Select <strong>Pay Bill</strong></li>
                <li>Enter Business No: <strong>{PAYBILL_NUMBER}</strong></li>
                <li>Account No: <strong>Your Phone Number</strong></li>
                <li>Amount: <strong>KES {pkg.price}</strong></li>
                <li>Enter PIN and confirm</li>
              </ol>
            </div>

            <div className="manual-payment-actions">
              <button className="back-btn" onClick={() => setStep(STEPS.PAYMENT_METHOD)}>
                ← Back
              </button>
              <Button onClick={handleManualPaymentRedirect} fullWidth>
                Open M-PESA (*334#)
              </Button>
            </div>
          </div>
        );

      case STEPS.PROCESSING:
        return (
          <div className="purchase-status">
            <div className="status-icon status-icon--processing">
              <LoaderIcon />
            </div>
            <h3>Processing Payment</h3>
            <p>Please check your phone for the M-PESA prompt and enter your PIN...</p>
          </div>
        );

      case STEPS.SUCCESS:
        return (
          <div className="purchase-status">
            <div className="status-icon status-icon--success">
              <CheckIcon />
            </div>
            <h3>Payment Started!</h3>
            <p>Complete your payment in M-PESA using Paybill <strong>{PAYBILL_NUMBER}</strong></p>
            <div className="success-reminder">
              <p>Your data bundle will be delivered automatically once payment is confirmed.</p>
            </div>
          </div>
        );

      case STEPS.QUEUED:
        return (
          <div className="purchase-status">
            <div className="status-icon status-icon--queued">
              <ClockIcon />
            </div>
            <h3>Order Queued</h3>
            <p>Your order has been saved and will be processed automatically when you're back online.</p>
          </div>
        );

      case STEPS.ERROR:
        return (
          <div className="purchase-status">
            <div className="status-icon status-icon--error">
              <ErrorIcon />
            </div>
            <h3>Payment Failed</h3>
            <p>Something went wrong. Please try again or use a different payment method.</p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (step) {
      case STEPS.DETAILS:
        return (
          <Button onClick={handleProceed} fullWidth>
            Continue
          </Button>
        );

      case STEPS.PAYMENT_METHOD:
      case STEPS.MANUAL_PAYMENT:
        return null;

      case STEPS.CONFIRM:
        return (
          <div className="confirm-actions">
            <Button 
              variant="secondary" 
              onClick={() => setStep(STEPS.PAYMENT_METHOD)}
            >
              Back
            </Button>
            <Button 
              onClick={handleConfirmPurchase} 
              loading={isLoading}
            >
              {isOnline ? 'Pay Now' : 'Queue Order'}
            </Button>
          </div>
        );

      case STEPS.SUCCESS:
      case STEPS.QUEUED:
      case STEPS.ERROR:
        return (
          <Button onClick={handleClose} fullWidth>
            Done
          </Button>
        );

      default:
        return null;
    }
  };

  if (!pkg) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === STEPS.DETAILS ? 'Buy Bundle' : undefined}
    >
      <div className="purchase-modal">
        {renderContent()}
        <div className="purchase-footer">
          {renderFooter()}
        </div>
      </div>
    </Modal>
  );
};

export default PurchaseModal;
