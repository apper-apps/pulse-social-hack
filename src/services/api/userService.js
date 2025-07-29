class UserService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'app_User';
    this.followRelationships = new Map(); // currentUserId -> Set of followedUserIds
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "username" } },
          { field: { Name: "displayName" } },
          { field: { Name: "bio" } },
          { field: { Name: "profilePicture" } },
          { field: { Name: "coverPhoto" } },
          { field: { Name: "followersCount" } },
          { field: { Name: "followingCount" } },
          { field: { Name: "postsCount" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching users:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "username" } },
          { field: { Name: "displayName" } },
          { field: { Name: "bio" } },
          { field: { Name: "profilePicture" } },
          { field: { Name: "coverPhoto" } },
          { field: { Name: "followersCount" } },
          { field: { Name: "followingCount" } },
          { field: { Name: "postsCount" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching user with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async getCurrentUser() {
    try {
      // Get the first user as the current logged-in user for demo purposes
      // In a real app, this would come from the authentication context
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "username" } },
          { field: { Name: "displayName" } },
          { field: { Name: "bio" } },
          { field: { Name: "profilePicture" } },
          { field: { Name: "coverPhoto" } },
          { field: { Name: "followersCount" } },
          { field: { Name: "followingCount" } },
          { field: { Name: "postsCount" } }
        ],
        pagingInfo: {
          limit: 1,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching current user:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async updateProfile(id, data) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            username: data.username,
            displayName: data.displayName,
            bio: data.bio,
            profilePicture: data.profilePicture,
            coverPhoto: data.coverPhoto,
            followersCount: data.followersCount,
            followingCount: data.followingCount,
            postsCount: data.postsCount
          }
        ]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update user profile ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating user profile:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async followUser(targetUserId) {
    try {
      const currentUser = await this.getCurrentUser();
      const targetId = parseInt(targetUserId);
      
      if (currentUser.Id === targetId) {
        throw new Error("Cannot follow yourself");
      }

      if (!this.followRelationships.has(currentUser.Id)) {
        this.followRelationships.set(currentUser.Id, new Set());
      }

      this.followRelationships.get(currentUser.Id).add(targetId);
      
      // Update follow counts in database
      const targetUser = await this.getById(targetId);
      if (targetUser) {
        const newFollowersCount = (targetUser.followersCount || 0) + 1;
        await this.updateProfile(targetId, { 
          ...targetUser, 
          followersCount: newFollowersCount 
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    }
  }

  async unfollowUser(targetUserId) {
    try {
      const currentUser = await this.getCurrentUser();
      const targetId = parseInt(targetUserId);

      if (this.followRelationships.has(currentUser.Id)) {
        this.followRelationships.get(currentUser.Id).delete(targetId);
      }

      // Update follow counts in database
      const targetUser = await this.getById(targetId);
      if (targetUser) {
        const newFollowersCount = Math.max((targetUser.followersCount || 0) - 1, 0);
        await this.updateProfile(targetId, { 
          ...targetUser, 
          followersCount: newFollowersCount 
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw error;
    }
  }

  async isFollowing(targetUserId) {
    try {
      const currentUser = await this.getCurrentUser();
      const targetId = parseInt(targetUserId);
      
      return this.followRelationships.get(currentUser.Id)?.has(targetId) || false;
    } catch (error) {
      console.error("Error checking follow status:", error);
      return false;
    }
  }

  async getFollowing(userId) {
    try {
      const id = parseInt(userId);
      const followingIds = this.followRelationships.get(id) || new Set();
      
      if (followingIds.size === 0) {
        return [];
      }

      const allUsers = await this.getAll();
      return allUsers
        .filter(user => followingIds.has(user.Id))
        .map(user => ({
          ...user,
          isFollowing: this.isFollowingSync(user.Id)
        }));
    } catch (error) {
      console.error("Error fetching following users:", error);
      return [];
    }
  }

  async getFollowers(userId) {
    try {
      const id = parseInt(userId);
      const followers = [];
      const allUsers = await this.getAll();
      
      for (const [followerId, followedUsers] of this.followRelationships) {
        if (followedUsers.has(id)) {
          const follower = allUsers.find(u => u.Id === followerId);
          if (follower) {
            followers.push({
              ...follower,
              isFollowing: this.isFollowingSync(follower.Id)
            });
          }
        }
      }
      
      return followers;
    } catch (error) {
      console.error("Error fetching followers:", error);
      return [];
    }
  }

  async getFollowingIds(userId) {
    const id = parseInt(userId);
    return Array.from(this.followRelationships.get(id) || new Set());
  }

  isFollowingSync(targetUserId) {
    const currentUserId = 1; // Assuming current user is always user 1
    const targetId = parseInt(targetUserId);
    return this.followRelationships.get(currentUserId)?.has(targetId) || false;
  }
}

// Create instance and export
const userService = new UserService();

export default userService;
export default new UserService();