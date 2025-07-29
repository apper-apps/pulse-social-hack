import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import notificationService from "@/services/api/notificationService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [groupedNotifications, setGroupedNotifications] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showGrouped, setShowGrouped] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load both regular and grouped notifications
      const [allNotifications, grouped, unreadCountData] = await Promise.all([
        notificationService.getByUserId(1), // Current user ID
        notificationService.getGroupedNotifications(1),
        notificationService.getUnreadCount(1)
      ]);
      
      setNotifications(allNotifications);
      setGroupedNotifications(grouped);
      setUnreadCount(unreadCountData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setActionLoading(true);
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.Id === notificationId ? { ...n, read: true } : n)
      );
      
      // Update unread count
      const newUnreadCount = await notificationService.getUnreadCount(1);
      setUnreadCount(newUnreadCount);
      
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Failed to mark notification as read');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsUnread = async (notificationId) => {
    try {
      setActionLoading(true);
      await notificationService.markAsUnread(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.Id === notificationId ? { ...n, read: false } : n)
      );
      
      // Update unread count
      const newUnreadCount = await notificationService.getUnreadCount(1);
      setUnreadCount(newUnreadCount);
      
      toast.success('Notification marked as unread');
    } catch (err) {
      toast.error('Failed to mark notification as unread');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      const result = await notificationService.markAllAsRead(1);
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      toast.success(`${result.count} notifications marked as read`);
    } catch (err) {
      toast.error('Failed to mark all notifications as read');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.size === 0) {
      toast.warning('Please select notifications first');
      return;
    }

    try {
      setActionLoading(true);
      const result = await notificationService.markSelectedAsRead(Array.from(selectedNotifications));
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => selectedNotifications.has(n.Id) ? { ...n, read: true } : n)
      );
      
      // Update unread count
      const newUnreadCount = await notificationService.getUnreadCount(1);
      setUnreadCount(newUnreadCount);
      
      setSelectedNotifications(new Set());
      toast.success(`${result.count} notifications marked as read`);
    } catch (err) {
      toast.error('Failed to mark selected notifications as read');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.size === 0) {
      toast.warning('Please select notifications first');
      return;
    }

    try {
      setActionLoading(true);
      const result = await notificationService.deleteMultiple(Array.from(selectedNotifications));
      
      // Update local state
      setNotifications(prev => 
        prev.filter(n => !selectedNotifications.has(n.Id))
      );
      
      // Update unread count
      const newUnreadCount = await notificationService.getUnreadCount(1);
      setUnreadCount(newUnreadCount);
      
      setSelectedNotifications(new Set());
      toast.success(`${result.count} notifications deleted`);
    } catch (err) {
      toast.error('Failed to delete selected notifications');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.Id)));
    }
  };

  const renderNotificationItem = (notification, index) => (
    <motion.div
      key={notification.Id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer relative ${
        notification.read 
          ? "bg-white border-gray-200" 
          : "bg-primary-50 border-primary-200"
      } ${selectedNotifications.has(notification.Id) ? 'ring-2 ring-primary-500' : ''}`}
      onClick={() => !notification.read && handleMarkAsRead(notification.Id)}
    >
      {/* Selection checkbox */}
      <div className="absolute top-2 right-2">
        <input
          type="checkbox"
          checked={selectedNotifications.has(notification.Id)}
          onChange={() => handleSelectNotification(notification.Id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
        />
      </div>

      <div className="flex items-start space-x-3 pr-8">
        {/* Actor Avatar */}
        <Avatar
          src={notification.actor?.profilePicture}
          alt={notification.actor?.displayName}
          size="md"
        />
        
        {/* Notification Icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          notification.read ? "bg-gray-100" : "bg-white shadow-sm"
        }`}>
          <ApperIcon 
            name={notificationService.getNotificationIcon(notification.type)} 
            className={`w-4 h-4 ${notificationService.getNotificationColor(notification.type)}`}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Main notification text */}
          <p className="text-gray-900">
            <span className="font-semibold">{notification.actor?.displayName}</span>
            {" "}
            <span className="text-gray-700">
              {notificationService.formatNotificationText(notification)}
            </span>
          </p>
          
          {/* Content preview */}
          {notificationService.getContentPreview(notification) && (
            <p className="text-sm text-gray-600 mt-1 bg-gray-50 rounded px-2 py-1 inline-block">
              "{notificationService.getContentPreview(notification)}"
            </p>
          )}
          
          {/* Timestamp */}
          <p className="text-sm text-gray-500 mt-1">
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </p>
        </div>
        
        {/* Unread indicator */}
        {!notification.read && (
          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-2 flex space-x-2" onClick={(e) => e.stopPropagation()}>
        {!notification.read ? (
          <button
            onClick={() => handleMarkAsRead(notification.Id)}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            disabled={actionLoading}
          >
            Mark as read
          </button>
        ) : (
          <button
            onClick={() => handleMarkAsUnread(notification.Id)}
            className="text-xs text-gray-600 hover:text-gray-700 font-medium"
            disabled={actionLoading}
          >
            Mark as unread
          </button>
        )}
      </div>
    </motion.div>
  );

  const renderGroupedNotifications = () => {
    const types = [
      { key: 'likes', label: 'Likes', icon: 'Heart', color: 'text-accent-500' },
      { key: 'comments', label: 'Comments', icon: 'MessageCircle', color: 'text-blue-500' },
      { key: 'follows', label: 'Follows', icon: 'UserPlus', color: 'text-primary-500' },
      { key: 'mentions', label: 'Mentions', icon: 'AtSign', color: 'text-purple-500' },
      { key: 'messages', label: 'Messages', icon: 'MessageSquare', color: 'text-green-500' }
    ];

    return (
      <div className="space-y-6">
        {types.map(type => {
          const typeNotifications = groupedNotifications[type.key] || [];
          if (typeNotifications.length === 0) return null;

          return (
            <div key={type.key}>
              <div className="flex items-center space-x-2 mb-3">
                <ApperIcon name={type.icon} className={`w-5 h-5 ${type.color}`} />
                <h3 className="font-semibold text-gray-900">{type.label}</h3>
                <span className="text-sm text-gray-500">({typeNotifications.length})</span>
              </div>
              <div className="space-y-2">
                {typeNotifications.slice(0, 5).map((notification, index) => 
                  renderNotificationItem(notification, index)
                )}
                {typeNotifications.length > 5 && (
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View {typeNotifications.length - 5} more {type.label.toLowerCase()}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadNotifications} />;
  if (notifications.length === 0) {
    return <Empty message="No notifications yet" icon="Bell" />;
  }

return (
    <div className="p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-primary-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600">
              Stay up to date with your activity
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowGrouped(!showGrouped)}
              className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center space-x-1"
            >
              <ApperIcon name={showGrouped ? "List" : "Grid3X3"} className="w-4 h-4" />
              <span>{showGrouped ? "List View" : "Group View"}</span>
            </button>
            
            <Button
              onClick={handleMarkAllAsRead}
              variant="ghost"
              size="sm"
              disabled={actionLoading || unreadCount === 0}
              loading={actionLoading}
            >
              Mark all as read
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-primary-800">
                  {selectedNotifications.size} notification{selectedNotifications.size > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {selectedNotifications.size === notifications.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleBulkMarkAsRead}
                  variant="ghost"
                  size="sm"
                  disabled={actionLoading}
                  loading={actionLoading}
                >
                  Mark as read
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  variant="danger"
                  size="sm"
                  disabled={actionLoading}
                  loading={actionLoading}
                >
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {showGrouped ? renderGroupedNotifications() : (
            <>
              {notifications.map((notification, index) => 
                renderNotificationItem(notification, index)
              )}
            </>
          )}
        </div>

        {/* Load More */}
        {notifications.length >= 20 && (
          <div className="text-center mt-8">
            <Button
              onClick={() => {
                // TODO: Implement pagination
                toast.info('Pagination coming soon!');
              }}
              variant="ghost"
            >
              Load more notifications
            </Button>
          </div>
        )}
      </motion.div>
    </div>
);
};

export default NotificationsPage;