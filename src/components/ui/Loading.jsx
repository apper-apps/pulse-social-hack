import React from "react";

const Loading = ({ type = "feed" }) => {
  if (type === "feed") {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-card">
            {/* Author section */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full shimmer"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded shimmer w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded shimmer w-20"></div>
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded shimmer w-full"></div>
              <div className="h-4 bg-gray-200 rounded shimmer w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded shimmer w-1/2"></div>
            </div>
            
            {/* Image placeholder */}
            {index % 2 === 0 && (
              <div className="h-64 bg-gray-200 rounded-lg shimmer mb-4"></div>
            )}
            
            {/* Actions */}
            <div className="flex items-center space-x-6">
              <div className="h-8 bg-gray-200 rounded shimmer w-16"></div>
              <div className="h-8 bg-gray-200 rounded shimmer w-20"></div>
              <div className="h-8 bg-gray-200 rounded shimmer w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "profile") {
    return (
      <div>
        {/* Profile header */}
        <div className="bg-white rounded-xl shadow-card mb-6">
          <div className="h-48 bg-gray-200 rounded-t-xl shimmer"></div>
          <div className="p-6">
            <div className="flex items-start space-x-4 -mt-16 mb-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full shimmer border-4 border-white"></div>
              <div className="flex-1 mt-12">
                <div className="h-6 bg-gray-200 rounded shimmer w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded shimmer w-32"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded shimmer w-full"></div>
              <div className="h-4 bg-gray-200 rounded shimmer w-2/3"></div>
            </div>
            <div className="flex space-x-6">
              <div className="h-4 bg-gray-200 rounded shimmer w-20"></div>
              <div className="h-4 bg-gray-200 rounded shimmer w-24"></div>
              <div className="h-4 bg-gray-200 rounded shimmer w-16"></div>
            </div>
          </div>
        </div>
        
        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="aspect-square bg-gray-200 rounded-lg shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  // Default loading
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;