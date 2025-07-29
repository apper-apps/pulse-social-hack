import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import userService from "@/services/api/userService";
import ApperIcon from "@/components/ApperIcon";
import FollowModal from "@/components/organisms/FollowModal";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
const ProfileHeader = ({ user, isCurrentUser = false, onEdit, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    if (!isCurrentUser && user) {
      checkFollowStatus();
    }
  }, [user, isCurrentUser]);

  const checkFollowStatus = async () => {
    try {
      const status = await userService.isFollowing(user.Id);
      setIsFollowing(status);
    } catch (error) {
      console.error("Failed to check follow status:", error);
    }
  };

  const handleFollow = async () => {
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await userService.unfollowUser(user.Id);
        setIsFollowing(false);
        toast.success(`Unfollowed ${user.displayName}`);
      } else {
        await userService.followUser(user.Id);
        setIsFollowing(true);
        toast.success(`Following ${user.displayName}`);
      }
      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error) {
      console.error("Failed to update follow status:", error);
      toast.error("Failed to update follow status. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  const openFollowModal = (type) => {
    setModalType(type);
    setModalTitle(type === "followers" ? "Followers" : "Following");
    setShowFollowModal(true);
  };
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card overflow-hidden mb-6"
    >
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600">
        {user.coverPhoto ? (
          <img
            src={user.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600"></div>
        )}
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4">
            <Avatar
              src={user.profilePicture}
              alt={user.displayName}
              size="xl"
              className="border-4 border-white shadow-lg mb-4 sm:mb-0"
            />
            <div className="sm:mb-2">
              <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">
                {user.displayName}
              </h1>
              <p className="text-gray-600 mb-2">@{user.username}</p>
              {user.bio && (
                <p className="text-gray-700 leading-relaxed max-w-md">
                  {user.bio}
                </p>
)}
            </div>
          </div>
          
          {isCurrentUser ? (
            <Button
              variant="secondary"
              onClick={onEdit}
              icon="Edit"
              className="self-start sm:self-auto mt-4 sm:mt-0"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-3 self-start sm:self-auto mt-4 sm:mt-0">
              <Button 
                icon={isFollowing ? "UserMinus" : "UserPlus"}
                variant={isFollowing ? "secondary" : "primary"}
                onClick={handleFollow}
                loading={followLoading}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
              <Button variant="secondary" icon="MessageSquare">
                Message
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <ApperIcon name="FileText" className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">{user.postsCount}</span>
<span className="text-gray-600">Posts</span>
          </div>
          <button 
            onClick={() => openFollowModal("followers")}
            className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 transition-colors"
          >
            <ApperIcon name="Users" className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">{user.followersCount}</span>
            <span className="text-gray-600">Followers</span>
          </button>
          <button
            onClick={() => openFollowModal("following")}
            className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 transition-colors"
          >
            <ApperIcon name="UserCheck" className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">{user.followingCount}</span>
            <span className="text-gray-600">Following</span>
          </button>
        </div>
      </div>

      {/* Follow Modal */}
      <FollowModal 
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        userId={user?.Id}
        type={modalType}
        title={modalTitle}
      />
    </motion.div>
);
};

export default ProfileHeader;