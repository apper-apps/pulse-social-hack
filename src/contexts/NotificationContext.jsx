import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import NotificationPopup from '@/components/organisms/NotificationPopup';

const NotificationContext = createContext();

export const useNotificationPopup = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationPopup must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((notification) => {
    setNotifications(prev => [...prev, notification]);
  }, []);

  const hideNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.Id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    showNotification,
    hideNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Popups Portal */}
      <div className="fixed top-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification, index) => (
              <NotificationPopup
                key={notification.Id}
                notification={notification}
                index={index}
                onClose={hideNotification}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;