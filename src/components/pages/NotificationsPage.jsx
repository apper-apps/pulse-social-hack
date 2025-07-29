import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const NotificationsPage = () => {
  const mockNotifications = [
    {
      id: 1,
      type: "like",
      user: "Sarah Kim",
      action: "liked your post",
      time: "2 minutes ago",
      read: false
    },
    {
      id: 2,
      type: "follow",
      user: "Mike Johnson",
      action: "started following you",
      time: "1 hour ago",
      read: false
    },
    {
      id: 3,
      type: "comment",
      user: "Emily Davis",
      action: "commented on your post",
      time: "3 hours ago",
      read: true
    },
    {
      id: 4,
      type: "like",
      user: "David Lee",
      action: "liked your post",
      time: "1 day ago",
      read: true
    }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return "Heart";
      case "follow":
        return "UserPlus";
      case "comment":
        return "MessageCircle";
      default:
        return "Bell";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "like":
        return "text-accent-500";
      case "follow":
        return "text-primary-500";
      case "comment":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Notifications
            </h1>
            <p className="text-gray-600">
              Stay up to date with your activity
            </p>
          </div>
          
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Mark all as read
          </button>
        </div>

        <div className="space-y-3">
          {mockNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                notification.read 
                  ? "bg-white border-gray-200" 
                  : "bg-primary-50 border-primary-200"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.read ? "bg-gray-100" : "bg-white"
                }`}>
                  <ApperIcon 
                    name={getNotificationIcon(notification.type)} 
                    className={`w-5 h-5 ${getNotificationColor(notification.type)}`}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900">
                    <span className="font-semibold">{notification.user}</span>
                    {" "}
                    <span className="text-gray-700">{notification.action}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {notification.time}
                  </p>
                </div>
                
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
            Load more notifications
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationsPage;