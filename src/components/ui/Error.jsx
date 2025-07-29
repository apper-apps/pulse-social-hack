import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry }) => {
  // Check if this is a "Record does not exist" error
  const isRecordNotFound = message && message.toLowerCase().includes('record does not exist');
  
  const getErrorTitle = () => {
    if (isRecordNotFound) {
      return "Content Not Found";
    }
    return "Oops! Something went wrong";
  };
  
  const getErrorMessage = () => {
    if (isRecordNotFound) {
      return "The content you're looking for may have been removed or is temporarily unavailable. Please try refreshing the page or check back later.";
    }
    return message;
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <ApperIcon 
          name={isRecordNotFound ? "FileX" : "AlertCircle"} 
          className="w-8 h-8 text-red-500" 
        />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {getErrorTitle()}
      </h3>
      
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {getErrorMessage()}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary flex items-center space-x-2"
        >
          <ApperIcon name="RefreshCw" className="w-4 h-4" />
          <span>{isRecordNotFound ? "Refresh Page" : "Try Again"}</span>
        </button>
      )}
    </div>
  );
};

export default Error;