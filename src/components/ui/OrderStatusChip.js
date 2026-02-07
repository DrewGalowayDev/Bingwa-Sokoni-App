import React from 'react';
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../data/constants';
import { Clock, CheckCircle, XCircle, Loader, Truck, CreditCard, AlertCircle, Ban } from 'lucide-react';
import './OrderStatusChip.css';

/**
 * OrderStatusChip Component
 * Visual indicator for order status
 */
const STATUS_ICONS = {
  [ORDER_STATUS.PENDING]: Clock,
  [ORDER_STATUS.QUEUED]: Loader,
  [ORDER_STATUS.PROCESSING]: Loader,
  [ORDER_STATUS.PAID]: CreditCard,
  [ORDER_STATUS.DELIVERING]: Truck,
  [ORDER_STATUS.DELIVERED]: CheckCircle,
  [ORDER_STATUS.FAILED]: XCircle,
  [ORDER_STATUS.CANCELLED]: Ban
};

export const OrderStatusChip = ({ 
  status, 
  size = 'medium',
  showIcon = true,
  showLabel = true 
}) => {
  const Icon = STATUS_ICONS[status] || AlertCircle;
  const label = ORDER_STATUS_LABELS[status] || 'Unknown';
  const color = ORDER_STATUS_COLORS[status] || '#6B7280';

  return (
    <div 
      className={`status-chip status-chip--${size} status-chip--${status}`}
      style={{ '--status-color': color }}
    >
      {showIcon && (
        <Icon 
          className={`status-chip__icon ${status === ORDER_STATUS.PROCESSING || status === ORDER_STATUS.QUEUED ? 'animate-spin' : ''}`} 
          size={size === 'small' ? 12 : 16} 
        />
      )}
      {showLabel && <span className="status-chip__label">{label}</span>}
    </div>
  );
};

export default OrderStatusChip;
