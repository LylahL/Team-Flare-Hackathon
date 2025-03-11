import React, { InputHTMLAttributes, ReactNode, forwardRef, useState } from 'react';
import './styles.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  isRequired?: boolean;
  onClear?: () => void;
  showClearButton?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  id,
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  className = '',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  isRequired = false,
  onClear,
  showClearButton = false,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  const baseClass = 'input';
  const wrapperClasses = [
    `${baseClass}-wrapper`,
    `${baseClass}--${size}`,
    fullWidth ? `${baseClass}--full-width` : '',
    error ? `${baseClass}--error` : '',
    disabled ? `${baseClass}--disabled` : '',
    isFocused ? `${baseClass}--focused` : '',
    className
  ].filter(Boolean).join(' ');

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    rest.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    rest.onBlur?.(e);
  };

  const hasValue = rest.value !== undefined && rest.value !== '';

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
          {isRequired && <span className="input__required">*</span>}
        </label>
      )}
      
      <div className="input__container">
        {leftIcon && <div className="input__icon input__icon--left">{leftIcon}</div>}
        
        <input
          id={inputId}
          ref={ref}
          className={`input__field ${leftIcon ? 'input__field--with-left-icon' : ''} ${
            rightIcon || (showClearButton && hasValue) ? 'input__field--with-right-icon' : ''
          }`}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={`${inputId}-helper ${inputId}-error`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        
        {((showClearButton && hasValue) || rightIcon) && (
          <div className="input__icon input__icon--right">
            {showClearButton && hasValue ? (
              <button
                type="button"
                className="input__clear-button"
                onClick={onClear}
                aria-label="Clear input"
              >
                &times;
              </button>
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>
      
      {(helperText || error) && (
        <div 
          id={`${inputId}-${error ? 'error' : 'helper'}`}
          className={`input__helper-text ${error ? 'input__helper-text--error' : ''}`}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

