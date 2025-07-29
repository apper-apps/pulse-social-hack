import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const PostActions = ({ post, onLike, onComment, onShare }) => {
  const handleLike = (e) => {
    e.stopPropagation();
    onLike?.(post.Id);
  };

  const handleComment = (e) => {
    e.stopPropagation();
    onComment?.(post.Id);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare?.(post.Id);
  };

  return (
    <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
      <button
        onClick={handleLike}
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
          "hover:bg-gray-50 group",
          post.isLiked && "text-accent-500"
        )}
      >
        <ApperIcon 
          name={post.isLiked ? "Heart" : "Heart"} 
          className={cn(
            "w-5 h-5 transition-all duration-200",
            post.isLiked 
              ? "text-accent-500 fill-current heart-burst" 
              : "text-gray-500 group-hover:text-accent-500"
          )} 
        />
        <span className={cn(
          "text-sm font-medium",
          post.isLiked ? "text-accent-500" : "text-gray-700"
        )}>
          {post.likes}
        </span>
      </button>

      <button
        onClick={handleComment}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 group"
      >
        <ApperIcon 
          name="MessageCircle" 
          className="w-5 h-5 text-gray-500 group-hover:text-primary-500 transition-colors duration-200" 
        />
        <span className="text-sm font-medium text-gray-700">
          {post.comments}
        </span>
      </button>

      <button
        onClick={handleShare}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 group"
      >
        <ApperIcon 
          name="Share" 
          className="w-5 h-5 text-gray-500 group-hover:text-primary-500 transition-colors duration-200" 
        />
        <span className="text-sm font-medium text-gray-700">
          {post.shares}
        </span>
      </button>
    </div>
  );
};

export default PostActions;