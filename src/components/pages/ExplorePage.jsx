import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PostCard from "@/components/organisms/PostCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import postService from "@/services/api/postService";

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get all posts and shuffle them for explore feed
      const allPosts = await postService.getAll(1, 20);
      const shuffledPosts = [...allPosts].sort(() => Math.random() - 0.5);
      setPosts(shuffledPosts);
      
    } catch (err) {
      console.error("Failed to load explore posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
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
    }
  };

  const handleRetry = () => {
    loadPosts();
  };

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loading type="feed" />;
  if (error) return <Error message={error} onRetry={handleRetry} />;

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
            Explore
          </h1>
          <p className="text-gray-600 mb-6">
            Discover trending posts and new voices
          </p>
          
          {/* Search */}
          <div className="relative max-w-md">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all duration-200"
            />
          </div>
        </motion.div>
      </div>

      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trending Topics</h2>
        <div className="flex flex-wrap gap-3">
          {["#design", "#travel", "#technology", "#fitness", "#startup"].map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 rounded-full text-sm font-medium hover:from-primary-100 hover:to-primary-200 transition-all duration-200 cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <Empty
          title={searchQuery ? "No posts found" : "No posts to explore"}
          message={searchQuery ? "Try adjusting your search terms" : "Check back later for new content to discover"}
          icon="Search"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-6"
        >
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <PostCard
                post={post}
                onLike={handlePostLike}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ExplorePage;