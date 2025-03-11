import React from 'react';
import Toast, { ToastProps } from '../Toast';
import '../Toast/styles.css';

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <Toast 
          key={toast.id} 
          id={toast.id} 
          message={toast.message} 
          type={toast.type} 
          duration={toast.duration} 
          onClose={onClose} 
        />
      ))}
    </div>
  );
};

export default ToastContainer;

