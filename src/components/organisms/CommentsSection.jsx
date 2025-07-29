import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import TextArea from '@/components/atoms/TextArea';
import ApperIcon from '@/components/ApperIcon';
import commentService from '@/services/api/commentService';
import userService from '@/services/api/userService';

const CommentsSection = ({ postId, currentUser, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [commentAuthors, setCommentAuthors] = useState({});
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const commentsData = await commentService.getByPostId(postId);
      
      // Load authors for all comments
      const authorIds = [...new Set(commentsData.map(c => c.authorId))];
      const authorsData = {};
      
      await Promise.all(
        authorIds.map(async (authorId) => {
          const author = await userService.getById(authorId);
          if (author) {
            authorsData[authorId] = author;
          }
        })
      );

      setComments(commentsData);
      setCommentAuthors(authorsData);
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!currentUser) {
      toast.error('Please log in to comment');
      return;
    }

    try {
      setSubmitting(true);
      
      const commentData = {
        postId: parseInt(postId),
        authorId: currentUser.Id,
        content: newComment.trim()
      };

      const createdComment = await commentService.create(commentData);
      
      // Add the new comment to the list
      setComments(prev => [...prev, createdComment]);
      
      // Add author data for the new comment
      setCommentAuthors(prev => ({
        ...prev,
        [currentUser.Id]: currentUser
      }));

      setNewComment('');
      toast.success('Comment posted successfully!');
      
      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded();
      }
      
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmitComment();
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full shimmer"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded shimmer w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded shimmer w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Comments ({comments.length})
      </h3>
      
      {/* Comment Input */}
      {currentUser && (
        <div className="flex space-x-3 mb-6">
          <Avatar
            src={currentUser.profilePicture}
            alt={currentUser.displayName}
            size="md"
          />
          <div className="flex-1">
            <TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Write a comment... (Ctrl+Enter to post)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all duration-200"
            />
            <div className="flex justify-between items-center mt-3">
              <p className="text-sm text-gray-500">
                Press Ctrl+Enter to post
              </p>
              <Button 
                onClick={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
                size="sm"
              >
                {submitting ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  'Post Comment'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <ApperIcon name="MessageSquare" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-1">No comments yet</p>
              <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
            </motion.div>
          ) : (
            comments.map((comment, index) => {
              const author = commentAuthors[comment.authorId];
              
              return (
                <motion.div
                  key={comment.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex space-x-3 group"
                >
                  <Avatar
                    src={author?.profilePicture}
                    alt={author?.displayName || 'User'}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-2xl px-4 py-3 group-hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {author?.displayName || 'Unknown User'}
                        </h4>
                        <span className="text-xs text-gray-500">
                          @{author?.username || 'unknown'}
                        </span>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 ml-4">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                      </span>
                      <button className="text-xs text-gray-500 hover:text-primary-600 transition-colors duration-200">
                        Reply
                      </button>
                      <button className="text-xs text-gray-500 hover:text-red-500 transition-colors duration-200">
                        <ApperIcon name="Heart" size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommentsSection;