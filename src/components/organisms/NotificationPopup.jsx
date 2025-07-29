import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Avatar from '@/components/atoms/Avatar';
import { cn } from '@/utils/cn';
import notificationService from '@/services/api/notificationService';

const NotificationPopup = ({ notification, onClose, index = 0 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.Id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification.Id, onClose]);

  const handleClick = () => {
    onClose(notification.Id);
  };

  const iconName = notificationService.getNotificationIcon(notification.type);
  const iconColor = notificationService.getNotificationColor(notification.type);
  const notificationText = notificationService.formatNotificationText(notification);
  const contentPreview = notificationService.getContentPreview(notification);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.3
      }}
      className={cn(
        "fixed right-4 bg-white rounded-xl shadow-lg border border-gray-100 p-4 cursor-pointer",
        "hover:shadow-xl transition-all duration-200 hover:scale-105",
        "max-w-sm w-full z-50"
      )}
      style={{ 
        top: `${1 + index * 5.5}rem`
      }}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {notification.actor?.profilePicture ? (
            <Avatar 
              src={notification.actor.profilePicture} 
              alt={notification.actor.displayName}
              size="sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {notification.actor?.displayName?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {notification.actor?.displayName || 'Someone'}
              </p>
              <p className="text-sm text-gray-600">
                {notificationText}
              </p>
              {contentPreview && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  "{contentPreview}"
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-2">
              <ApperIcon 
                name={iconName} 
                size={16} 
                className={cn("flex-shrink-0", iconColor)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(notification.Id);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ApperIcon name="X" size={14} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
            </span>
            
            {!notification.read && (
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-primary-500 rounded-b-xl"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 3, ease: "linear" }}
      />
    </motion.div>
  );
};

export default NotificationPopup;