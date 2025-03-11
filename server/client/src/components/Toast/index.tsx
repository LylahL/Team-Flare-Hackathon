import React, { useEffect, useState } from 'react';
import './styles.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  message, 
  type, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Set visible with a small delay to trigger animation
    const visibleTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    // Auto dismiss after duration
    const dismissTimeout = setTimeout(() => {
      setIsVisible(false);
      
      // Wait for exit animation to complete before removing from DOM
      setTimeout(() => {
        onClose(id);
      }, 300);
    }, duration);
    
    return () => {
      clearTimeout(visibleTimeout);
      clearTimeout(dismissTimeout);
    };
  }, [id, duration, onClose]);
  
  return (
    <div 
      className={`toast toast-${type} ${isVisible ? 'toast-visible' : ''}`}
      role="alert"
    >
      <div className="toast-icon">
        {type === 'success' && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 6L9 17l-5-5 1.41-1.42L9 14.17l9.59-9.59L20 6z" />
          </svg>
        )}
        {type === 'error' && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
          </svg>
        )}
        {type === 'warning' && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 3v5h2V9h-2zm0 6v2h2v-2h-2z" />
          </svg>
        )}
        {type === 'info' && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        )}
      </div>
      <div className="toast-content">{message}</div>
      <button 
        type="button" 
        className="toast-close" 
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
        aria-label="Close notification"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;

