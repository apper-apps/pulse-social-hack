import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const MessagesPage = () => {
  return (
    <div className="p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto text-center py-16"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <ApperIcon name="MessageSquare" className="w-10 h-10 text-primary-600" />
        </div>
        
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
          Messages
        </h1>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          Stay connected with your friends and followers through direct messages. This feature is coming soon!
        </p>
        
        <div className="bg-white rounded-xl p-8 shadow-card border border-gray-100">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="text-xs text-gray-400">Soon</div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-28"></div>
              </div>
              <div className="text-xs text-gray-400">Soon</div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-28 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="text-xs text-gray-400">Soon</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MessagesPage;