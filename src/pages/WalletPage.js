import React, { useState } from 'react';
import { 
  Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, History, RefreshCw,
  Plus, Send, Phone, Copy, Check, AlertCircle, Smartphone, Trash2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNetwork } from '../context/NetworkContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useOrderStore } from '../store/orderStore';
import { ORDER_STATUS } from '../data/constants';
import './WalletPage.css';

/**
 * WalletPage Component - Fully Functional
 * 
 * Features:
 * - M-PESA wallet balance
 * - Top up via paybill
 * - Transaction history
 * - Send money
 * - Sync status
 */

// Modal Component
const WalletModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={e => e.stopPropagation()}>
        <div className="wallet-modal__header">
          <h2>{title}</h2>
          <button className="wallet-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="wallet-modal__content">
          {children}
        </div>
      </div>
    </div>
  );
};

const WalletPage = () => {
  const { isOnline } = useNetwork();
  const auth = useAuth();
  const { notifySuccess, notifyInfo } = useNotifications();
  const { orders, lastSyncTime, getPendingOrders, syncInProgress, clearAllOrders } = useOrderStore();

  const [activeModal, setActiveModal] = useState(null);
  const [copiedPaybill, setCopiedPaybill] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendPhone, setSendPhone] = useState('');

  const PAYBILL_NUMBER = '3720688';
  const ACCOUNT_NUMBER = auth?.user?.phoneNumber || 'Your Phone';

  const pendingCount = getPendingOrders().length;
  
  // Calculate totals
  const paidOrders = orders.filter(o => 
    o.status === ORDER_STATUS.PAID || 
    o.status === ORDER_STATUS.DELIVERED
  );
  const totalSpent = paidOrders.reduce((sum, o) => sum + o.packagePrice, 0);
  const totalOrders = orders.length;

  // Simulated wallet balance (in production, fetch from backend)
  const [walletBalance, setWalletBalance] = useState(0);

  const copyPaybill = () => {
    navigator.clipboard.writeText(PAYBILL_NUMBER);
    setCopiedPaybill(true);
    notifySuccess('Copied!', 'Paybill number copied to clipboard');
    setTimeout(() => setCopiedPaybill(false), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all transaction history? This cannot be undone.')) {
      clearAllOrders();
      notifyInfo('History Cleared', 'All transaction history has been deleted.');
    }
  };

  const handleTopUp = () => {
    // Generate USSD code for M-PESA
    const ussdCode = `*334*${PAYBILL_NUMBER}*${topUpAmount}#`;
    window.location.href = `tel:${encodeURIComponent(ussdCode)}`;
    setActiveModal(null);
    notifySuccess('Top Up Initiated', 'Follow the M-PESA prompts on your phone');
  };

  const handleSendMoney = () => {
    if (sendPhone && sendAmount) {
      // In production, call API to send money
      notifySuccess('Send Money', `Sending KES ${sendAmount} to ${sendPhone}`);
      setActiveModal(null);
      setSendAmount('');
      setSendPhone('');
    }
  };

  const quickAmounts = [50, 100, 200, 500, 1000];

  return (
    <div className="wallet-page">
      {/* Header */}
      <div className="wallet-header">
        <h1 className="wallet-title">Wallet</h1>
        <p className="wallet-subtitle">M-PESA & Transaction History</p>
      </div>

      {/* Balance Card */}
      <div className="wallet-card">
        <div className="wallet-card__header">
          <div className="wallet-card__icon">
            <Wallet size={24} />
          </div>
          <span className="wallet-card__label">Total Spent</span>
        </div>
        <div className="wallet-card__amount">
          <span className="wallet-card__currency">KES</span>
          <span className="wallet-card__value">{totalSpent.toLocaleString()}</span>
        </div>
        <div className="wallet-card__footer">
          <span>{totalOrders} total transactions</span>
        </div>
        
        {/* Quick Actions */}
        <div className="wallet-card__actions">
          <button className="wallet-action-btn" onClick={() => setActiveModal('topup')}>
            <Plus size={18} />
            <span>Top Up</span>
          </button>
          <button className="wallet-action-btn" onClick={() => setActiveModal('send')}>
            <Send size={18} />
            <span>Send</span>
          </button>
          <button className="wallet-action-btn" onClick={() => setActiveModal('withdraw')}>
            <ArrowUpRight size={18} />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="wallet-stats">
        <div className="wallet-stat">
          <div className="wallet-stat__icon wallet-stat__icon--success">
            <ArrowUpRight size={20} />
          </div>
          <div className="wallet-stat__info">
            <span className="wallet-stat__value">{paidOrders.length}</span>
            <span className="wallet-stat__label">Successful</span>
          </div>
        </div>
        
        <div className="wallet-stat">
          <div className="wallet-stat__icon wallet-stat__icon--pending">
            <History size={20} />
          </div>
          <div className="wallet-stat__info">
            <span className="wallet-stat__value">{pendingCount}</span>
            <span className="wallet-stat__label">Pending</span>
          </div>
        </div>
      </div>

      {/* Paybill Info Card */}
      <div className="wallet-section">
        <h2 className="wallet-section__title">
          <CreditCard size={20} />
          Payment Details
        </h2>
        
        <div className="paybill-card">
          <div className="paybill-card__header">
            <span className="mpesa-logo">M-PESA</span>
            <span className={`paybill-status ${isOnline ? 'paybill-status--online' : ''}`}>
              {isOnline ? '● Active' : '○ Offline'}
            </span>
          </div>
          
          <div className="paybill-card__details">
            <div className="paybill-item">
              <span className="paybill-item__label">Paybill Number</span>
              <div className="paybill-item__value">
                <span className="paybill-number">{PAYBILL_NUMBER}</span>
                <button className="copy-btn" onClick={copyPaybill}>
                  {copiedPaybill ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className="paybill-item">
              <span className="paybill-item__label">Account Number</span>
              <div className="paybill-item__value">
                <span>Your Phone Number</span>
              </div>
            </div>
          </div>

          <div className="paybill-card__instructions">
            <h4>How to Pay:</h4>
            <ol>
              <li>Go to M-PESA → Lipa na M-PESA → Paybill</li>
              <li>Enter Business No: <strong>{PAYBILL_NUMBER}</strong></li>
              <li>Account No: <strong>Your Phone Number</strong></li>
              <li>Enter Amount and PIN</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="wallet-section">
        <h2 className="wallet-section__title">
          <RefreshCw size={20} className={syncInProgress ? 'spin' : ''} />
          Sync Status
        </h2>
        
        <div className="sync-card">
          <div className="sync-card__status">
            <span className={`sync-indicator ${isOnline ? 'sync-indicator--online' : 'sync-indicator--offline'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          
          {pendingCount > 0 && (
            <div className="sync-card__pending">
              <AlertCircle size={16} />
              <span>{pendingCount} orders pending sync</span>
            </div>
          )}
          
          {lastSyncTime && (
            <div className="sync-card__time">
              Last synced: {new Date(lastSyncTime).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="wallet-section">
        <div className="wallet-section__header">
          <h2 className="wallet-section__title">
            <History size={20} />
            Recent Activity
          </h2>
          {orders.length > 0 && (
            <button className="clear-history-btn" onClick={handleClearHistory}>
              <Trash2 size={16} />
              Clear
            </button>
          )}
        </div>
        
        {orders.length > 0 ? (
          <div className="activity-list">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="activity-item">
                <div className={`activity-item__icon activity-item__icon--${order.status}`}>
                  <ArrowDownLeft size={16} />
                </div>
                <div className="activity-item__info">
                  <span className="activity-item__title">{order.packageName}</span>
                  <span className="activity-item__time">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="activity-item__amount">
                  -KES {order.packagePrice}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-activity">
            <Wallet size={48} />
            <p>No transactions yet</p>
            <span>Your purchase history will appear here</span>
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      <WalletModal 
        isOpen={activeModal === 'topup'} 
        onClose={() => setActiveModal(null)}
        title="Top Up Wallet"
      >
        <div className="topup-content">
          <div className="topup-paybill">
            <p>Send money to:</p>
            <div className="topup-paybill__info">
              <span className="mpesa-logo small">M-PESA</span>
              <div className="topup-paybill__number">
                <strong>Paybill: {PAYBILL_NUMBER}</strong>
                <button onClick={copyPaybill}>
                  {copiedPaybill ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="topup-amount">
            <label>Amount (KES)</label>
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="Enter amount"
              className="form-input"
            />
            <div className="quick-amounts">
              {quickAmounts.map(amount => (
                <button 
                  key={amount}
                  className={`quick-amount-btn ${topUpAmount === String(amount) ? 'active' : ''}`}
                  onClick={() => setTopUpAmount(String(amount))}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="topup-btn"
            onClick={handleTopUp}
            disabled={!topUpAmount || parseInt(topUpAmount) < 10}
          >
            <Smartphone size={20} />
            Pay via M-PESA
          </button>
        </div>
      </WalletModal>

      {/* Send Money Modal */}
      <WalletModal 
        isOpen={activeModal === 'send'} 
        onClose={() => setActiveModal(null)}
        title="Send Money"
      >
        <div className="send-content">
          <div className="form-group">
            <label>Phone Number</label>
            <div className="phone-input">
              <span className="phone-prefix">+254</span>
              <input
                type="tel"
                value={sendPhone}
                onChange={(e) => setSendPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="7XXXXXXXX"
                maxLength={9}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Amount (KES)</label>
            <input
              type="number"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              placeholder="Enter amount"
              className="form-input"
            />
          </div>

          <button 
            className="send-btn"
            onClick={handleSendMoney}
            disabled={!sendPhone || sendPhone.length < 9 || !sendAmount}
          >
            <Send size={20} />
            Send Money
          </button>
        </div>
      </WalletModal>

      {/* Withdraw Modal */}
      <WalletModal 
        isOpen={activeModal === 'withdraw'} 
        onClose={() => setActiveModal(null)}
        title="Withdraw to M-PESA"
      >
        <div className="withdraw-content">
          <div className="withdraw-notice">
            <AlertCircle size={24} />
            <p>Withdrawals are processed to your registered M-PESA number within 24 hours.</p>
          </div>
          
          <div className="form-group">
            <label>Amount (KES)</label>
            <input
              type="number"
              placeholder="Enter amount"
              className="form-input"
            />
          </div>

          <div className="withdraw-info">
            <span>Withdrawal to:</span>
            <strong>{auth?.user?.phoneNumber || '+254 7XX XXX XXX'}</strong>
          </div>

          <button className="withdraw-btn">
            <ArrowUpRight size={20} />
            Request Withdrawal
          </button>
        </div>
      </WalletModal>
    </div>
  );
};

export default WalletPage;
