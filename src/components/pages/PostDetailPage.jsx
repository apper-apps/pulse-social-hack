import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import PostActions from "@/components/molecules/PostActions";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import postService from "@/services/api/postService";
import userService from "@/services/api/userService";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPostData();
  }, [postId]);

  const loadPostData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const postData = await postService.getById(postId);
      if (!postData) {
        setError("Post not found");
        return;
      }
      
      const authorData = await userService.getById(postData.authorId);
      
      setPost(postData);
      setAuthor(authorData);
      
    } catch (err) {
      console.error("Failed to load post:", err);
      setError("Failed to load post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const updatedPost = await postService.toggleLike(postId);
      setPost(updatedPost);
    } catch (error) {
      console.error("Failed to like post:", error);
      toast.error("Failed to update like");
    }
  };

  const handleRetry = () => {
    loadPostData();
  };

  const handleAuthorClick = () => {
    navigate(`/profile/${post.authorId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={handleRetry} />;
  if (!post || !author) return <Error message="Post not found" />;

  return (
    <div className="p-4 lg:p-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Button
          onClick={handleBack}
          variant="ghost"
          icon="ArrowLeft"
          className="mb-4"
        >
          Back
        </Button>
      </motion.div>

      {/* Post Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto"
      >
        <div className="card p-6 lg:p-8">
          {/* Author Header */}
          <div className="flex items-center space-x-4 mb-6">
            <Avatar
              src={author.profilePicture}
              alt={author.displayName}
              size="lg"
            />
            <div className="flex-1">
              <button
                onClick={handleAuthorClick}
                className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
              >
                {author.displayName}
              </button>
              <p className="text-gray-600">
                @{author.username}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Image */}
          {post.imageUrl && (
            <div className="mb-6">
              <img
                src={post.imageUrl}
                alt="Post content"
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <PostActions
            post={post}
            onLike={handleLike}
            onComment={() => console.log("Comment")}
            onShare={() => console.log("Share")}
          />
        </div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6"
        >
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comments
            </h3>
            
            {/* Comment Input */}
            <div className="flex space-x-3 mb-6">
              <Avatar
                src={author.profilePicture}
                alt="Your avatar"
                size="md"
              />
              <div className="flex-1">
                <textarea
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all duration-200"
                />
                <div className="flex justify-end mt-3">
                  <Button size="sm">
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments Placeholder */}
            <div className="text-center py-8">
              <ApperIcon name="MessageSquare" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No comments yet</p>
              <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PostDetailPage;