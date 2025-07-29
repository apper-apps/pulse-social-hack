import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SuggestedUsers from "@/components/organisms/SuggestedUsers";
import userService from "@/services/api/userService";
import postService from "@/services/api/postService";
import ApperIcon from "@/components/ApperIcon";
import PostCard from "@/components/organisms/PostCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");
      
// Get trending posts sorted by engagement metrics
const trendingPosts = await postService.getTrendingPosts();
setPosts(trendingPosts);
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
{/* Three-column discovery layout */}
<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
  {/* Main content - Trending Posts */}
  <div className="lg:col-span-3">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mb-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-2">Trending Posts</h2>
      <p className="text-gray-600 text-sm">Popular posts from across the platform</p>
    </motion.div>

    {filteredPosts.length === 0 ? (
      <Empty
        title={searchQuery ? "No posts found" : "No trending posts"}
        message={searchQuery ? "Try adjusting your search terms" : "Check back later for trending content"}
        icon="TrendingUp"
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

  {/* Sidebar */}
  <div className="lg:col-span-1 space-y-6">
    {/* Trending Hashtags */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <ApperIcon name="Hash" className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-900">Trending Topics</h3>
      </div>
      <div className="space-y-3">
        {[
          { tag: "#design", posts: "2.4k posts" },
          { tag: "#travel", posts: "1.8k posts" },
          { tag: "#technology", posts: "3.1k posts" },
          { tag: "#fitness", posts: "1.2k posts" },
          { tag: "#startup", posts: "892 posts" }
        ].map((item, index) => (
          <div
            key={item.tag}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
          >
            <div>
              <p className="font-medium text-primary-700">{item.tag}</p>
              <p className="text-sm text-gray-500">{item.posts}</p>
            </div>
            <ApperIcon name="TrendingUp" className="w-4 h-4 text-green-500" />
          </div>
        ))}
      </div>
    </motion.div>

    {/* Suggested Users */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <ApperIcon name="UserPlus" className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-900">Suggested for you</h3>
      </div>
      <div className="space-y-4">
        <SuggestedUsers />
      </div>
    </motion.div>
  </div>
</div>
    </div>
  );
};

export default ExplorePage;