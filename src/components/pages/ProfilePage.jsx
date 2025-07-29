import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProfileHeader from "@/components/organisms/ProfileHeader";
import PostGrid from "@/components/organisms/PostGrid";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import userService from "@/services/api/userService";
import postService from "@/services/api/postService";
const ProfilePage = () => {
const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
loadProfileData();
  }, [userId, refreshKey]);
  const loadProfileData = async () => {
try {
      setLoading(true);
      setError("");
      
      const [userData, userPosts, currentUserData] = await Promise.all([
        userService.getById(userId),
        postService.getByUserId(userId),
        userService.getCurrentUser()
      ]);
      
      // Get updated user data with current follow counts
      const updatedUserData = await userService.getById(userId);
      
      setUser(updatedUserData);
      setPosts(userPosts);
      setCurrentUser(currentUserData);
      
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const handleRetry = () => {
    loadProfileData();
  };

  const handleFollowChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  const isCurrentUser = currentUser && user && currentUser.Id === user.Id;

  if (loading) return <Loading type="profile" />;
  if (error) return <Error message={error} onRetry={handleRetry} />;
  if (!user) return <Error message="User not found" />;

return (
    <div className="p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          isCurrentUser={isCurrentUser}
          onEdit={() => console.log("Edit profile")}
          onFollowChange={handleFollowChange}
        />

        {/* Posts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-gray-900">
              Posts
            </h2>
            <span className="text-gray-500 text-sm">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          </div>

          {posts.length === 0 ? (
            <Empty
              title={isCurrentUser ? "You haven't posted yet" : `${user.displayName} hasn't posted yet`}
              message={isCurrentUser ? "Share your first post to get started!" : "Check back later for new posts."}
              actionText={isCurrentUser ? "Create Your First Post" : undefined}
              onAction={isCurrentUser ? () => console.log("Create post") : undefined}
              icon="FileText"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PostGrid posts={posts} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;