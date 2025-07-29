import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import PostCard from "@/components/organisms/PostCard";
import CreatePostModal from "@/components/organisms/CreatePostModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import postService from "@/services/api/postService";

const HomeFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
        setError("");
      } else {
        setLoadingMore(true);
      }

      const newPosts = await postService.getAll(pageNum, 10);
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
      setHasMore(newPosts.length === 10);
      
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage, true);
    }
  };

  const handlePostLike = async (postId) => {
    try {
      const updatedPost = await postService.toggleLike(postId);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.Id === postId ? { ...post, ...updatedPost } : post
        )
      );
    } catch (error) {
      console.error("Failed to update like:", error);
      toast.error("Failed to update like");
    }
  };

  const handlePostCreated = () => {
    setPage(1);
    loadPosts(1, false);
  };

  const handleRetry = () => {
    setPage(1);
    loadPosts(1, false);
  };

  if (loading) return <Loading type="feed" />;
  if (error) return <Error message={error} onRetry={handleRetry} />;

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Home Feed
            </h1>
            <p className="text-gray-600">
              Stay connected with your community
            </p>
          </div>
        </div>

        {/* Create Post Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={() => setShowCreateModal(true)}
            icon="Plus"
            className="w-full sm:w-auto"
          >
            Create Post
          </Button>
        </motion.div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <Empty
          title="No posts yet"
          message="Be the first to share something with your community! Create a post to get started."
          actionText="Create Your First Post"
          onAction={() => setShowCreateModal(true)}
          icon="FileText"
        />
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.Id}
              post={post}
              onLike={handlePostLike}
            />
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button
                onClick={handleLoadMore}
                variant="secondary"
                loading={loadingMore}
                icon="ChevronDown"
              >
                {loadingMore ? "Loading..." : "Load More Posts"}
              </Button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">You've reached the end of your feed</p>
            </div>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default HomeFeed;