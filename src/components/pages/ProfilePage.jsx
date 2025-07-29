import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    profilePicture: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
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
      
      // Ensure userId is a valid primitive value
      const idValue = typeof userId === 'object' && userId !== null ? (userId.Id || userId.id) : userId;
      if (!idValue) {
        setError("Invalid user ID");
        setLoading(false);
        return;
      }
      
      const [userData, userPosts, currentUserData] = await Promise.all([
        userService.getById(idValue),
        postService.getByUserId(idValue),
        userService.getCurrentUser()
      ]);
      
      // Get updated user data with current follow counts
      const updatedUserData = await userService.getById(idValue);
      
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
onEdit={handleEditProfile}
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

  // Edit Profile Functions
  const handleEditProfile = () => {
    if (user) {
      setEditFormData({
        displayName: user.displayName || '',
        username: user.username || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || ''
      });
      setEditError('');
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.displayName.trim() || !editFormData.username.trim()) {
      setEditError('Display name and username are required');
      return;
    }

    try {
      setEditLoading(true);
      setEditError('');
      
      await userService.updateProfile(user.Id, editFormData);
      
      setIsEditModalOpen(false);
      toast.success('Profile updated successfully!');
      
      // Refresh profile data
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      setEditError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditError('');
    setEditFormData({
      displayName: '',
      username: '',
      bio: '',
      profilePicture: ''
    });
  };

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
          onEdit={handleEditProfile}
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

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold text-gray-900">
                  Edit Profile
                </h2>
                <button
                  onClick={handleEditCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {editError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {editError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.displayName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your display name"
                    disabled={editLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={editFormData.username}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="@username"
                    disabled={editLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Tell us about yourself..."
                    disabled={editLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.profilePicture}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, profilePicture: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/profile.jpg"
                    disabled={editLoading}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={editLoading}
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;