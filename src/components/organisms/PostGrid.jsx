import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const PostGrid = ({ posts }) => {
  const navigate = useNavigate();

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ApperIcon name="Grid3X3" className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.Id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group cursor-pointer"
          onClick={() => handlePostClick(post.Id)}
        >
          {post.imageUrl ? (
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <div className="flex items-center space-x-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center space-x-1">
                    <ApperIcon name="Heart" className="w-5 h-5" />
                    <span className="font-medium">{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ApperIcon name="MessageCircle" className="w-5 h-5" />
                    <span className="font-medium">{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 flex items-center justify-center border-2 border-gray-200 hover:border-primary-300 transition-colors duration-300">
              <div className="text-center">
                <ApperIcon name="FileText" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 line-clamp-3">
                  {post.content}
                </p>
                <div className="flex items-center justify-center space-x-4 mt-4 text-gray-500">
                  <div className="flex items-center space-x-1">
                    <ApperIcon name="Heart" className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ApperIcon name="MessageCircle" className="w-4 h-4" />
                    <span className="text-sm">{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default PostGrid;