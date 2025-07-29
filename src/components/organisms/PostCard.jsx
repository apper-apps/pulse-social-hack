import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import Avatar from "@/components/atoms/Avatar";
import PostActions from "@/components/molecules/PostActions";
import postService from "@/services/api/postService";
import userService from "@/services/api/userService";

const PostCard = ({ post, onLike }) => {
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [isLiking, setIsLiking] = useState(false);

  React.useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const userData = await userService.getById(post.authorId);
        setAuthor(userData);
      } catch (error) {
        console.error("Failed to fetch author:", error);
      }
    };
    fetchAuthor();
  }, [post.authorId]);

  const handleLike = async (postId) => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      await postService.toggleLike(postId);
      onLike?.(postId);
    } catch (error) {
      console.error("Failed to like post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handlePostClick = () => {
    navigate(`/post/${post.Id}`);
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${post.authorId}`);
  };

  if (!author) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card p-6 cursor-pointer"
      onClick={handlePostClick}
    >
      {/* Author Header */}
      <div className="flex items-center space-x-3 mb-4">
        <Avatar
          src={author.profilePicture}
          alt={author.displayName}
          size="md"
        />
        <div className="flex-1">
          <button
            onClick={handleAuthorClick}
            className="font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
          >
            {author.displayName}
          </button>
          <p className="text-sm text-gray-500">
            @{author.username} • {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="mb-4">
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full h-auto rounded-lg object-cover max-h-96"
          />
        </div>
      )}

      {/* Actions */}
      <PostActions
        post={post}
        onLike={handleLike}
        onComment={() => navigate(`/post/${post.Id}`)}
        onShare={() => console.log("Share:", post.Id)}
      />
    </motion.div>
  );
};

export default PostCard;