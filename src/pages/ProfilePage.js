import React, { useState } from 'react';
import { 
  User, Settings, HelpCircle, LogOut, Moon, Sun, ChevronRight, 
  Bell, Shield, Smartphone, X, Check, AlertTriangle, Phone,
  Lock, Trash2, Volume2, VolumeX, ChevronDown, ChevronUp,
  Mail, MessageSquare, Clock, Package
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNetwork } from '../context/NetworkContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { NetworkStatusBadge } from '../components/ui/NetworkStatusBadge';
import './ProfilePage.css';

/**
 * ProfilePage Component - Fully Functional
 */

// Modal Component
const ProfileModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <div className="profile-modal__header">
          <h2>{title}</h2>
          <button className="profile-modal__close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="profile-modal__content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Personal Information Modal Content
const PersonalInfoContent = ({ user, onSave, onClose }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave({ name, email });
      setSaving(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    }, 500);
  };

  return (
    <div className="modal-form">
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email (optional)"
          className="form-input"
        />
      </div>
      <button 
        className={`form-button ${success ? 'form-button--success' : ''}`}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : success ? <><Check size={20} /> Saved!</> : 'Save Changes'}
      </button>
    </div>
  );
};

// Phone Numbers Modal Content
const PhoneNumbersContent = ({ user, onUpdatePhone }) => {
  const [phones, setPhones] = useState([
    { number: user?.phoneNumber || '+254 7XX XXX XXX', isPrimary: true, label: 'Primary' }
  ]);
  const [newPhone, setNewPhone] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addPhone = () => {
    if (newPhone.length >= 10) {
      setPhones([...phones, { number: newPhone, isPrimary: false, label: 'Secondary' }]);
      setNewPhone('');
      setShowAddForm(false);
    }
  };

  const removePhone = (index) => {
    if (!phones[index].isPrimary) {
      setPhones(phones.filter((_, i) => i !== index));
    }
  };

  const setPrimary = (index) => {
    const updated = phones.map((p, i) => ({
      ...p,
      isPrimary: i === index,
      label: i === index ? 'Primary' : 'Secondary'
    }));
    setPhones(updated);
    onUpdatePhone(updated[index].number);
  };

  return (
    <div className="phone-list">
      {phones.map((phone, index) => (
        <div key={index} className={`phone-item ${phone.isPrimary ? 'phone-item--primary' : ''}`}>
          <div className="phone-item__icon">
            <Phone size={20} />
          </div>
          <div className="phone-item__info">
            <span className="phone-item__number">{phone.number}</span>
            <span className="phone-item__label">{phone.label}</span>
          </div>
          {!phone.isPrimary && (
            <div className="phone-item__actions">
              <button 
                className="phone-action-btn"
                onClick={() => setPrimary(index)}
                title="Set as primary"
              >
                <Check size={16} />
              </button>
              <button 
                className="phone-action-btn phone-action-btn--danger"
                onClick={() => removePhone(index)}
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {phone.isPrimary && (
            <span className="phone-badge">Primary</span>
          )}
        </div>
      ))}
      
      {showAddForm ? (
        <div className="add-phone-form">
          <input
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Enter phone number (e.g., 0712345678)"
            className="form-input"
          />
          <div className="add-phone-actions">
            <button className="form-button form-button--secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
            <button className="form-button" onClick={addPhone} disabled={newPhone.length < 10}>
              Add Number
            </button>
          </div>
        </div>
      ) : (
        <button className="add-phone-btn" onClick={() => setShowAddForm(true)}>
          <Phone size={20} />
          Add Phone Number
        </button>
      )}
    </div>
  );
};

// Notification Settings Content
const NotificationSettingsContent = ({ notificationContext }) => {
  const { permission, requestPermission, clearAll, notifications } = notificationContext;
  const [settings, setSettings] = useState({
    pushEnabled: permission === 'granted',
    soundEnabled: true,
    paymentAlerts: true,
    orderUpdates: true,
    promotions: false
  });

  const toggleSetting = async (key) => {
    if (key === 'pushEnabled') {
      if (!settings.pushEnabled) {
        const result = await requestPermission();
        if (result.success) {
          setSettings({ ...settings, pushEnabled: true });
        }
      } else {
        setSettings({ ...settings, pushEnabled: false });
      }
    } else {
      setSettings({ ...settings, [key]: !settings[key] });
    }
  };

  const settingsList = [
    { 
      key: 'pushEnabled', 
      icon: Bell, 
      label: 'Push Notifications', 
      description: permission === 'denied' ? 'Blocked in browser settings' : 'Receive push notifications'
    },
    { key: 'soundEnabled', icon: settings.soundEnabled ? Volume2 : VolumeX, label: 'Sound', description: 'Play sound for notifications' },
    { key: 'paymentAlerts', icon: MessageSquare, label: 'Payment Alerts', description: 'Get notified about payments' },
    { key: 'orderUpdates', icon: Package, label: 'Order Updates', description: 'Track your order status' },
    { key: 'promotions', icon: Mail, label: 'Promotions', description: 'Receive special offers' }
  ];

  return (
    <div className="notification-settings">
      {settingsList.map(({ key, icon: Icon, label, description }) => (
        <div key={key} className="setting-item">
          <div className="setting-item__icon">
            <Icon size={20} />
          </div>
          <div className="setting-item__info">
            <span className="setting-item__label">{label}</span>
            <span className="setting-item__description">{description}</span>
          </div>
          <button 
            className={`toggle-switch ${settings[key] ? 'toggle-switch--active' : ''}`}
            onClick={() => toggleSetting(key)}
            disabled={key === 'pushEnabled' && permission === 'denied'}
          >
            <div className="toggle-switch__knob" />
          </button>
        </div>
      ))}
      
      <div className="notification-stats">
        <div className="stat-item">
          <span className="stat-value">{notifications.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{notifications.filter(n => !n.read).length}</span>
          <span className="stat-label">Unread</span>
        </div>
      </div>

      {notifications.length > 0 && (
        <button className="form-button form-button--danger" onClick={clearAll}>
          <Trash2 size={16} />
          Clear All Notifications
        </button>
      )}
    </div>
  );
};

// App Settings Content
const AppSettingsContent = ({ auth, onClose }) => {
  const { changePin, resetPin, logout } = auth;
  const [showPinChange, setShowPinChange] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handlePinChange = () => {
    setError('');
    
    if (newPin !== confirmPin) {
      setError('New PINs do not match');
      return;
    }
    
    const result = changePin(currentPin, newPin);
    if (result.success) {
      setSuccess('PIN changed successfully!');
      setTimeout(() => {
        setShowPinChange(false);
        setSuccess('');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  const handleResetPin = () => {
    resetPin();
    logout();
    onClose();
  };

  const clearAppData = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="app-settings">
      {/* Change PIN Section */}
      <div className="settings-section">
        <button 
          className="settings-section__header"
          onClick={() => setShowPinChange(!showPinChange)}
        >
          <div className="settings-section__icon">
            <Lock size={20} />
          </div>
          <span>Change PIN</span>
          {showPinChange ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {showPinChange && (
          <div className="pin-change-form">
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}
            
            <div className="form-group">
              <label>Current PIN</label>
              <input
                type="password"
                maxLength={4}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="form-input form-input--pin"
              />
            </div>
            <div className="form-group">
              <label>New PIN</label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="form-input form-input--pin"
              />
            </div>
            <div className="form-group">
              <label>Confirm New PIN</label>
              <input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="form-input form-input--pin"
              />
            </div>
            <button 
              className="form-button"
              onClick={handlePinChange}
              disabled={currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4}
            >
              Update PIN
            </button>
          </div>
        )}
      </div>

      {/* Reset PIN Section */}
      <div className="settings-section settings-section--danger">
        <button 
          className="settings-section__header"
          onClick={() => setShowConfirmReset(!showConfirmReset)}
        >
          <div className="settings-section__icon settings-section__icon--danger">
            <AlertTriangle size={20} />
          </div>
          <span>Forgot PIN / Reset Account</span>
          {showConfirmReset ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {showConfirmReset && (
          <div className="reset-warning">
            <p className="warning-text">
              <AlertTriangle size={16} />
              This will reset your PIN and log you out. You'll need to set up a new PIN.
            </p>
            <button className="form-button form-button--danger" onClick={handleResetPin}>
              Reset PIN & Logout
            </button>
          </div>
        )}
      </div>

      {/* Clear Data Section */}
      <div className="settings-section settings-section--danger">
        <button 
          className="settings-section__header"
          onClick={clearAppData}
        >
          <div className="settings-section__icon settings-section__icon--danger">
            <Trash2 size={20} />
          </div>
          <span>Clear All App Data</span>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* App Info */}
      <div className="app-info">
        <div className="app-info__item">
          <span>Version</span>
          <span>1.0.0</span>
        </div>
        <div className="app-info__item">
          <span>Build</span>
          <span>2026.02.01</span>
        </div>
        <div className="app-info__item">
          <span>Cache Size</span>
          <span>~2.3 MB</span>
        </div>
      </div>
    </div>
  );
};

// Help Center Content
const HelpCenterContent = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      question: 'How do I buy a data bundle?',
      answer: 'Navigate to the Home page, select a package category, tap on the bundle you want, enter your phone number, choose your payment method, and complete the purchase.'
    },
    {
      question: 'What payment methods are available?',
      answer: 'We support two payment methods: STK Push (M-PESA prompt sent to your phone) and SIM Toolkit (redirects to USSD menu). Both are secure and instant.'
    },
    {
      question: 'How long does it take to receive my bundle?',
      answer: 'Once payment is confirmed, your bundle is activated instantly. You will receive an SMS confirmation from Safaricom.'
    },
    {
      question: 'What if my purchase fails?',
      answer: 'If your purchase fails, no money is deducted. You can retry the purchase. If money was deducted but bundle not received, contact support.'
    },
    {
      question: 'How do I change my PIN?',
      answer: 'Go to Profile → App Settings → Change PIN. Enter your current PIN and then your new 4-digit PIN.'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes! We use M-PESA\'s secure payment gateway. We never store your M-PESA PIN or sensitive payment details.'
    }
  ];

  return (
    <div className="help-center">
      <div className="help-section">
        <h3>Frequently Asked Questions</h3>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button 
                className="faq-question"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <span>{faq.question}</span>
                {expandedFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedFaq === index && (
                <div className="faq-answer">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="help-section">
        <h3>Contact Support</h3>
        <div className="contact-options">
          <a href="tel:0725911246" className="contact-btn">
            <Phone size={20} />
            <span>Call Support</span>
            <span className="contact-detail">0725 911 246</span>
          </a>
          <a href="mailto:support@beesamdata.co.ke" className="contact-btn">
            <Mail size={20} />
            <span>Email Us</span>
            <span className="contact-detail">support@beesamdata.co.ke</span>
          </a>
        </div>
      </div>

      <div className="help-section">
        <h3>Business Hours</h3>
        <div className="business-hours">
          <Clock size={20} />
          <div>
            <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
            <p>Saturday: 9:00 AM - 5:00 PM</p>
            <p>Sunday: 10:00 AM - 4:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Privacy Policy Content
const PrivacyPolicyContent = () => {
  return (
    <div className="privacy-policy">
      <div className="policy-section">
        <h3>Introduction</h3>
        <p>
          BEESAM Data ("we", "our", or "us") is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, and safeguard your information 
          when you use our mobile application.
        </p>
      </div>

      <div className="policy-section">
        <h3>Information We Collect</h3>
        <ul>
          <li><strong>Phone Number:</strong> Required for purchasing bundles and M-PESA transactions</li>
          <li><strong>Transaction History:</strong> Records of your purchases for your reference</li>
          <li><strong>App Usage Data:</strong> Anonymous analytics to improve our services</li>
        </ul>
      </div>

      <div className="policy-section">
        <h3>How We Use Your Information</h3>
        <ul>
          <li>Process your bundle purchases</li>
          <li>Send purchase confirmations and notifications</li>
          <li>Provide customer support</li>
          <li>Improve our app and services</li>
        </ul>
      </div>

      <div className="policy-section">
        <h3>Data Security</h3>
        <p>
          We implement appropriate security measures to protect your personal information. 
          Your PIN is stored locally on your device in encrypted form. We do not store 
          your M-PESA PIN or payment credentials on our servers.
        </p>
      </div>

      <div className="policy-section">
        <h3>Third-Party Services</h3>
        <p>
          We use Safaricom's M-PESA API for payment processing. Their use of your 
          information is governed by their own privacy policy.
        </p>
      </div>

      <div className="policy-section">
        <h3>Your Rights</h3>
        <ul>
          <li>Request access to your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of promotional communications</li>
        </ul>
      </div>

      <div className="policy-section">
        <h3>Contact Us</h3>
        <p>
          For any privacy-related questions, contact us at:<br />
          Email: support@beesamdata.co.ke<br />
          Phone: 0725 911 246
        </p>
      </div>

      <div className="policy-footer">
        <p>Last updated: February 1, 2026</p>
      </div>
    </div>
  );
};

// Main ProfilePage Component
const ProfilePage = () => {
  const { theme, toggleTheme } = useTheme();
  const { isOnline } = useNetwork();
  const auth = useAuth();
  const notificationContext = useNotifications();
  
  const [activeModal, setActiveModal] = useState(null);
  const [userData, setUserData] = useState({
    name: auth.user?.name || '',
    email: auth.user?.email || '',
    phoneNumber: auth.user?.phoneNumber || '+254 7XX XXX XXX'
  });

  const closeModal = () => setActiveModal(null);

  const handleSavePersonalInfo = (data) => {
    setUserData({ ...userData, ...data });
    // Persist to auth context
    if (auth.updateProfile) {
      auth.updateProfile(data);
    }
  };

  const handleUpdatePhone = (phone) => {
    setUserData({ ...userData, phoneNumber: phone });
    auth.updatePhoneNumber(phone);
  };

  const handleLogout = () => {
    auth.logout();
  };

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: User, label: 'Personal Information', action: () => setActiveModal('personal') },
        { icon: Smartphone, label: 'My Phone Numbers', action: () => setActiveModal('phones') },
        { icon: Bell, label: 'Notifications', action: () => setActiveModal('notifications'), badge: notificationContext.unreadCount }
      ]
    },
    {
      section: 'Preferences',
      items: [
        { 
          icon: theme === 'dark' ? Moon : Sun, 
          label: 'Dark Mode', 
          action: toggleTheme,
          toggle: true,
          value: theme === 'dark'
        }
      ]
    },
    {
      section: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', action: () => setActiveModal('help') },
        { icon: Shield, label: 'Privacy Policy', action: () => setActiveModal('privacy') },
        { icon: Settings, label: 'App Settings', action: () => setActiveModal('settings') }
      ]
    }
  ];

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <h1 className="profile-title">Profile</h1>
      </div>

      {/* User Card */}
      <div className="user-card">
        <div className="user-card__avatar">
          {userData.name ? (
            <span className="user-card__initials">
              {userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          ) : (
            <User size={32} />
          )}
        </div>
        <div className="user-card__info">
          <h2 className="user-card__name">{userData.name || 'Welcome!'}</h2>
          <p className="user-card__phone">{userData.phoneNumber}</p>
        </div>
        <NetworkStatusBadge variant="pill" size="small" />
      </div>

      {/* Menu Sections */}
      {menuItems.map((section) => (
        <div key={section.section} className="menu-section">
          <h3 className="menu-section__title">{section.section}</h3>
          <div className="menu-list">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="menu-item"
                  onClick={item.action}
                >
                  <div className="menu-item__icon">
                    <Icon size={20} />
                  </div>
                  <span className="menu-item__label">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="menu-item__badge">{item.badge}</span>
                  )}
                  {item.toggle ? (
                    <div className={`toggle-switch ${item.value ? 'toggle-switch--active' : ''}`}>
                      <div className="toggle-switch__knob" />
                    </div>
                  ) : (
                    <ChevronRight size={20} className="menu-item__arrow" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Logout */}
      <div className="menu-section">
        <button className="menu-item menu-item--danger" onClick={handleLogout}>
          <div className="menu-item__icon">
            <LogOut size={20} />
          </div>
          <span className="menu-item__label">Log Out</span>
        </button>
      </div>

      {/* App Version */}
      <div className="profile-footer">
        <p>BEESAM Data App v1.0.0</p>
        <p>© 2026 All rights reserved</p>
      </div>

      {/* Modals */}
      <ProfileModal 
        isOpen={activeModal === 'personal'} 
        onClose={closeModal} 
        title="Personal Information"
      >
        <PersonalInfoContent 
          user={userData} 
          onSave={handleSavePersonalInfo} 
          onClose={closeModal} 
        />
      </ProfileModal>

      <ProfileModal 
        isOpen={activeModal === 'phones'} 
        onClose={closeModal} 
        title="My Phone Numbers"
      >
        <PhoneNumbersContent 
          user={auth.user} 
          onUpdatePhone={handleUpdatePhone} 
        />
      </ProfileModal>

      <ProfileModal 
        isOpen={activeModal === 'notifications'} 
        onClose={closeModal} 
        title="Notification Settings"
      >
        <NotificationSettingsContent notificationContext={notificationContext} />
      </ProfileModal>

      <ProfileModal 
        isOpen={activeModal === 'help'} 
        onClose={closeModal} 
        title="Help Center"
      >
        <HelpCenterContent />
      </ProfileModal>

      <ProfileModal 
        isOpen={activeModal === 'privacy'} 
        onClose={closeModal} 
        title="Privacy Policy"
      >
        <PrivacyPolicyContent />
      </ProfileModal>

      <ProfileModal 
        isOpen={activeModal === 'settings'} 
        onClose={closeModal} 
        title="App Settings"
      >
        <AppSettingsContent auth={auth} onClose={closeModal} />
      </ProfileModal>
    </div>
  );
};

export default ProfilePage;
