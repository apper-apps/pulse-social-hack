import React from "react";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import { clipboardService } from "@/utils/clipboard";
const PostActions = ({ post, onLike, onComment, onShare }) => {
  const handleLike = (e) => {
    e.stopPropagation();
    onLike?.(post.Id);
  };

  const handleComment = (e) => {
    e.stopPropagation();
    onComment?.(post.Id);
  };

const handleShare = async (e) => {
    e.stopPropagation();
    
    try {
      // Generate shareable URL
      const shareUrl = `${window.location.origin}/post/${post.Id}`;
      
      // Use robust clipboard service with comprehensive fallback handling
      const result = await clipboardService.copyLink(shareUrl, {
        showToast: false // We'll handle toast notifications ourselves to maintain existing behavior
      });
      
      if (result.success) {
        if (result.method === 'text-selection') {
          toast.info('Link selected. Press Ctrl+C (Cmd+C on Mac) to copy.', {
            autoClose: 4000
          });
        } else {
          toast.success('Post link copied to clipboard!');
        }
      } else {
        toast.error('Failed to copy link. Please try again.');
      }
      
      // Call optional callback if provided
      onShare?.(post.Id);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link. Please try again.');
    }
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