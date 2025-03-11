import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

const NotificationExample: React.FC = () => {
  const { success, error, warning, info } = useNotification();

  return (
    <div className="notification-example">
      <h2>Notification Examples</h2>
      <div className="buttons">
        <button 
          onClick={() => success('Operation completed successfully!')}
          className="button button-success"
        >
          Show Success
        </button>
        
        <button 
          onClick={() => error('An error occurred. Please try again.')}
          className="button button-error"
        >
          Show Error
        </button>
        
        <button 
          onClick={() => warning('This action cannot be undone.')}
          className="button button-warning"
        >
          Show Warning
        </button>
        
        <button 
          onClick={() => info('Your session will expire in 5 minutes.')}
          className="button button-info"
        >
          Show Info
        </button>
        
        <button 
          onClick={() => {
            // Example of a notification with longer duration
            success('This notification will stay longer', 10000);
          }}
          className="button"
        >
          Longer Duration (10s)
        </button>
      </div>
    </div>
  );
};

export default NotificationExample;

