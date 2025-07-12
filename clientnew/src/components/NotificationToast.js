import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import './NotificationToast.css';

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification-toast ${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            <button className="notification-close">×</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast; 