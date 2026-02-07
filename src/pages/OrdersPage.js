import React, { useState, useMemo } from 'react';
import { 
  Clock, CheckCircle, XCircle, Truck, RefreshCw, Search, 
  Phone, Copy, RotateCcw, Trash2, ExternalLink, AlertCircle,
  Check, ChevronDown, ChevronUp
} from 'lucide-react';
import { OrderStatusChip } from '../components/ui/OrderStatusChip';
import { Button } from '../components/ui/Button';
import { useOrderStore } from '../store/orderStore';
import { useNetwork } from '../context/NetworkContext';
import { useNotifications } from '../context/NotificationContext';
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '../data/constants';
import { getPackageById, CATEGORY_GRADIENTS } from '../data/packages';
import { format, formatDistanceToNow } from 'date-fns';
import './OrdersPage.css';

/**
 * OrdersPage Component
 * 
 * Displays all orders with:
 * - Status filtering (tabs)
 * - Order cards with details
 * - Action buttons (retry, copy, contact support)
 * - Sync indicator for pending orders
 */

const PAYBILL_NUMBER = '3720688';
const SUPPORT_NUMBER = '0725911246';

const STATUS_TABS = [
  { id: 'all', label: 'All', icon: null },
  { id: ORDER_STATUS.PENDING, label: 'Pending', icon: Clock },
  { id: ORDER_STATUS.PAID, label: 'Paid', icon: CheckCircle },
  { id: ORDER_STATUS.DELIVERED, label: 'Delivered', icon: Truck },
  { id: ORDER_STATUS.FAILED, label: 'Failed', icon: XCircle }
];

const OrdersPage = () => {
  const { isOnline } = useNetwork();
  const { notifySuccess, notifyInfo, notifyError } = useNotifications();
  const { orders, syncPendingOrders, syncInProgress, getPendingOrders, removeOrder, updateOrderStatus } = useOrderStore();
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const pendingCount = getPendingOrders().length;

  const filteredOrders = useMemo(() => {
    let filtered = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(o => o.status === activeTab);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.phoneNumber.includes(query) ||
        o.packageName.toLowerCase().includes(query) ||
        o.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [orders, activeTab, searchQuery]);

  const handleSync = () => {
    if (isOnline && pendingCount > 0) {
      syncPendingOrders();
      notifyInfo('Syncing', 'Syncing pending orders...');
    }
  };

  const handleRetryPayment = (order) => {
    // Open USSD for payment
    const ussdCode = '*334#';
    window.location.href = `tel:${encodeURIComponent(ussdCode)}`;
    notifyInfo('Retry Payment', `Dial *334# → Pay Bill → ${PAYBILL_NUMBER} → KES ${order.packagePrice}`);
  };

  const handleCopyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId);
      notifySuccess('Copied', 'Order ID copied to clipboard');
    } catch {
      notifyError('Error', 'Failed to copy');
    }
  };

  const handleContactSupport = () => {
    window.location.href = `tel:${SUPPORT_NUMBER}`;
  };

  const handleMarkAsDelivered = (orderId) => {
    updateOrderStatus(orderId, ORDER_STATUS.DELIVERED);
    notifySuccess('Updated', 'Order marked as delivered');
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      removeOrder(orderId);
      notifySuccess('Deleted', 'Order removed from history');
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="orders-page">
      {/* Header */}
      <div className="orders-header">
        <div>
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">
            {orders.length} total orders
            {pendingCount > 0 && ` • ${pendingCount} pending sync`}
          </p>
        </div>

        {pendingCount > 0 && (
          <Button
            variant="outline"
            size="small"
            icon={RefreshCw}
            onClick={handleSync}
            loading={syncInProgress}
            disabled={!isOnline}
          >
            Sync ({pendingCount})
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="orders-search">
        <Search className="orders-search__icon" size={20} />
        <input
          type="text"
          placeholder="Search by phone or order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="orders-search__input"
        />
      </div>

      {/* Status Tabs */}
      <div className="orders-tabs">
        {STATUS_TABS.map(tab => {
          const Icon = tab.icon;
          const count = tab.id === 'all' 
            ? orders.length 
            : orders.filter(o => o.status === tab.id).length;

          return (
            <button
              key={tab.id}
              className={`orders-tab ${activeTab === tab.id ? 'orders-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {Icon && <Icon size={16} />}
              <span>{tab.label}</span>
              <span className="orders-tab__count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order}
              isExpanded={expandedOrder === order.id}
              onToggleExpand={() => toggleOrderExpand(order.id)}
              onRetry={() => handleRetryPayment(order)}
              onCopyId={() => handleCopyOrderId(order.id)}
              onContactSupport={handleContactSupport}
              onMarkDelivered={() => handleMarkAsDelivered(order.id)}
              onDelete={() => handleDeleteOrder(order.id)}
            />
          ))
        ) : (
          <div className="empty-state">
            <Search size={48} />
            <h3>No orders found</h3>
            <p>
              {orders.length === 0 
                ? 'Your orders will appear here after your first purchase'
                : 'Try adjusting your filters or search'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Order Card Component with Actions
const OrderCard = ({ 
  order, 
  isExpanded, 
  onToggleExpand,
  onRetry, 
  onCopyId, 
  onContactSupport,
  onMarkDelivered,
  onDelete 
}) => {
  const pkg = getPackageById(order.packageId);
  const gradient = pkg ? CATEGORY_GRADIENTS[pkg.category] : CATEGORY_GRADIENTS.data;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy • h:mm a');
  };

  const timeAgo = (dateStr) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };

  const isPending = order.status === ORDER_STATUS.PENDING || order.status === 'queued' || order.status === 'redirected';
  const isFailed = order.status === ORDER_STATUS.FAILED;
  const isDelivered = order.status === ORDER_STATUS.DELIVERED;
  const isPaid = order.status === ORDER_STATUS.PAID;

  return (
    <div className={`order-card ${isExpanded ? 'order-card--expanded' : ''}`}>
      <div className="order-card__header" onClick={onToggleExpand}>
        <div 
          className="order-card__icon"
          style={{ background: gradient.primary }}
        >
          <span>{order.packageName}</span>
        </div>
        <div className="order-card__summary">
          <span className="order-card__amount">KES {order.packagePrice}</span>
          <span className="order-card__time">{timeAgo(order.createdAt)}</span>
        </div>
        <div className="order-card__status-expand">
          <OrderStatusChip status={order.status} size="small" />
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="order-card__details">
            <div className="order-card__row">
              <span className="order-card__label">Order ID</span>
              <div className="order-card__value-action">
                <span className="order-card__value">{order.id}</span>
                <button className="order-card__copy" onClick={(e) => { e.stopPropagation(); onCopyId(); }}>
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <div className="order-card__row">
              <span className="order-card__label">Phone</span>
              <span className="order-card__value">+{order.phoneNumber}</span>
            </div>
            <div className="order-card__row">
              <span className="order-card__label">Package</span>
              <span className="order-card__value">{order.packageName} • {order.packageValidity}</span>
            </div>
            <div className="order-card__row">
              <span className="order-card__label">Date</span>
              <span className="order-card__value">{formatDate(order.createdAt)}</span>
            </div>
            <div className="order-card__row">
              <span className="order-card__label">Payment</span>
              <span className="order-card__value">
                {order.paymentMethod === 'manual' ? 'Direct Payment' : 'STK Push'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="order-card__actions">
            {/* Pending/Failed - Retry Payment */}
            {(isPending || isFailed) && (
              <button className="order-action order-action--primary" onClick={(e) => { e.stopPropagation(); onRetry(); }}>
                <RotateCcw size={16} />
                <span>Retry Payment</span>
              </button>
            )}

            {/* Paid - Mark as Delivered */}
            {isPaid && (
              <button className="order-action order-action--success" onClick={(e) => { e.stopPropagation(); onMarkDelivered(); }}>
                <Check size={16} />
                <span>Mark Delivered</span>
              </button>
            )}

            {/* Contact Support */}
            <button className="order-action order-action--secondary" onClick={(e) => { e.stopPropagation(); onContactSupport(); }}>
              <Phone size={16} />
              <span>Support</span>
            </button>

            {/* Delete Order */}
            <button className="order-action order-action--danger" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <Trash2 size={16} />
            </button>
          </div>

          {/* Status-specific messages */}
          {isPending && (
            <div className="order-card__notice order-card__notice--warning">
              <AlertCircle size={16} />
              <span>Complete payment via M-PESA Paybill {PAYBILL_NUMBER}</span>
            </div>
          )}

          {isFailed && (
            <div className="order-card__notice order-card__notice--error">
              <AlertCircle size={16} />
              <span>Payment failed. Tap "Retry Payment" to try again.</span>
            </div>
          )}

          {isDelivered && (
            <div className="order-card__notice order-card__notice--success">
              <CheckCircle size={16} />
              <span>Bundle delivered successfully!</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersPage;
