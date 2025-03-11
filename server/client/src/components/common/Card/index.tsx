import React, { ReactNode } from 'react';
import './styles.css';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'flat' | 'interactive';

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  headerAction?: ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  id?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  title,
  subtitle,
  footer,
  headerAction,
  onClick,
  isLoading = false,
  disabled = false,
  id,
}) => {
  const cardClasses = [
    'card',
    `card--${variant}`,
    onClick ? 'card--clickable' : '',
    isLoading ? 'card--loading' : '',
    disabled ? 'card--disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (onClick && !disabled && !isLoading) {
      onClick();
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      id={id}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-disabled={disabled}
    >
      {isLoading && (
        <div className="card__loading-overlay">
          <div className="card__loading-spinner"></div>
        </div>
      )}
      
      {(title || subtitle || headerAction) && (
        <div className="card__header">
          <div className="card__header-content">
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {headerAction && (
            <div className="card__header-action">
              {headerAction}
            </div>
          )}
        </div>
      )}
      
      <div className="card__content">
        {children}
      </div>
      
      {footer && (
        <div className="card__footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

