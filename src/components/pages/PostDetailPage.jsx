import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import PostActions from "@/components/molecules/PostActions";
import CommentsSection from "@/components/organisms/CommentsSection";
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
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showComments, setShowComments] = useState(true);
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
      
      // For demo purposes, use the author as current user
      // In a real app, this would come from auth context
      const userData = await userService.getById(1);
      
      setPost(postData);
      setAuthor(authorData);
      setCurrentUser(userData);
      
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

  const handleComment = () => {
    setShowComments(true);
    // Scroll to comments section
    setTimeout(() => {
      const commentsSection = document.getElementById('comments-section');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleCommentAdded = async () => {
    try {
      // Update post comment count
      const updatedPost = await postService.addComment(postId);
      setPost(updatedPost);
    } catch (error) {
      console.error("Failed to update comment count:", error);
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
            onComment={handleComment}
            onShare={() => console.log("Share")}
          />
        </div>

        {/* Comments Section */}
{showComments && (
          <motion.div
            id="comments-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-6"
          >
            <CommentsSection
              postId={postId}
              currentUser={currentUser}
              onCommentAdded={handleCommentAdded}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PostDetailPage;