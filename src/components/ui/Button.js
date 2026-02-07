import React from 'react';
import './Button.css';

/**
 * Button Component
 * Reusable button with multiple variants
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const buttonClasses = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full-width',
    loading && 'btn--loading',
    Icon && !children && 'btn--icon-only',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="btn__spinner" />
      )}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="btn__icon" size={size === 'small' ? 16 : 20} />
      )}
      {children && <span className="btn__text">{children}</span>}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="btn__icon" size={size === 'small' ? 16 : 20} />
      )}
    </button>
  );
};

export default Button;
