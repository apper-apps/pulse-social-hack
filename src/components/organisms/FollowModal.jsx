import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import userService from "@/services/api/userService";

const FollowModal = ({ isOpen, onClose, userId, type, title }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadUsers();
      loadCurrentUser();
    }
  }, [isOpen, userId, type]);

  const loadCurrentUser = async () => {
    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load current user:", error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      let userData;
      if (type === "followers") {
        userData = await userService.getFollowers(userId);
      } else {
        userData = await userService.getFollowing(userId);
      }
      setUsers(userData);
    } catch (error) {
      console.error(`Failed to load ${type}:`, error);
      toast.error(`Failed to load ${type}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId) => {
    try {
      await userService.followUser(targetUserId);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.Id === targetUserId
            ? { ...user, isFollowing: true, followersCount: user.followersCount + 1 }
            : user
        )
      );
      toast.success("User followed successfully!");
    } catch (error) {
      console.error("Failed to follow user:", error);
      toast.error("Failed to follow user. Please try again.");
    }
  };

  const handleUnfollow = async (targetUserId) => {
    try {
      await userService.unfollowUser(targetUserId);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.Id === targetUserId
            ? { ...user, isFollowing: false, followersCount: user.followersCount - 1 }
            : user
        )
      );
      toast.success("User unfollowed successfully!");
    } catch (error) {
      console.error("Failed to unfollow user:", error);
      toast.error("Failed to unfollow user. Please try again.");
    }
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold text-gray-900">
                {title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                icon="X"
                className="p-2"
              />
            </div>
            
            {/* Search */}
            <div className="mt-4 relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <ApperIcon name="Loader2" className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <ApperIcon name="Users" className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">
                    {searchTerm ? "No users found matching your search." : `No ${type} yet.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <div key={user.Id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={user.profilePicture}
                          name={user.displayName}
                          size="md"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {user.displayName}
                          </h3>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                      
                      {currentUser && user.Id !== currentUser.Id && (
                        <Button
                          variant={user.isFollowing ? "secondary" : "primary"}
                          size="sm"
                          onClick={() => user.isFollowing ? handleUnfollow(user.Id) : handleFollow(user.Id)}
                          icon={user.isFollowing ? "UserMinus" : "UserPlus"}
                        >
                          {user.isFollowing ? "Unfollow" : "Follow"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FollowModal;