import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import userService from "@/services/api/userService";
import { toast } from "react-toastify";

const SuggestedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState({});

  useEffect(() => {
    loadSuggestedUsers();
  }, []);

  const loadSuggestedUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAll();
      const currentUser = await userService.getCurrentUser();
      
      // Filter out current user and get random 4 users
      const suggestedUsers = allUsers
        .filter(user => user.Id !== currentUser.Id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
      
      setUsers(suggestedUsers);

      // Check follow status for each user
      const followStates = {};
      for (const user of suggestedUsers) {
        followStates[user.Id] = await userService.isFollowing(user.Id);
      }
      setFollowingStates(followStates);
    } catch (error) {
      console.error("Error loading suggested users:", error);
      toast.error("Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      const isCurrentlyFollowing = followingStates[userId];
      
      if (isCurrentlyFollowing) {
        await userService.unfollowUser(userId);
        setFollowingStates(prev => ({ ...prev, [userId]: false }));
        toast.success("User unfollowed");
      } else {
        await userService.followUser(userId);
        setFollowingStates(prev => ({ ...prev, [userId]: true }));
        toast.success("User followed");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full shimmer"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded shimmer mb-2"></div>
              <div className="h-3 bg-gray-200 rounded shimmer w-2/3"></div>
            </div>
            <div className="w-16 h-8 bg-gray-200 rounded shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {users.map((user, index) => (
        <motion.div
          key={user.Id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.1 }}
          className="flex items-center gap-3"
        >
          <Avatar
            src={user.profilePicture}
            alt={user.displayName}
            size="md"
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {user.displayName}
            </p>
            <p className="text-sm text-gray-500 truncate">
              @{user.username}
            </p>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-gray-400">
                {user.followersCount} followers
              </span>
            </div>
          </div>
          <Button
            variant={followingStates[user.Id] ? "secondary" : "primary"}
            size="sm"
            onClick={() => handleFollowToggle(user.Id)}
            className="flex-shrink-0"
          >
            {followingStates[user.Id] ? (
              <>
                <ApperIcon name="UserCheck" size={14} />
                Following
              </>
            ) : (
              <>
                <ApperIcon name="UserPlus" size={14} />
                Follow
              </>
            )}
          </Button>
        </motion.div>
      ))}
    </>
  );
};

export default SuggestedUsers;