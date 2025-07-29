import users from "../mockData/users.json";
class UserService {
constructor() {
    this.users = [...users];
    this.followRelationships = new Map(); // currentUserId -> Set of followedUserIds
    this.initializeFollowCounts();
  }

  initializeFollowCounts() {
    // Initialize some sample follow relationships
    this.followRelationships.set(1, new Set([2, 3])); // Alex follows Sarah and Mike
    this.followRelationships.set(2, new Set([1, 4, 5])); // Sarah follows Alex, Emily, David
    this.followRelationships.set(3, new Set([1, 2])); // Mike follows Alex and Sarah
    this.followRelationships.set(4, new Set([2, 5])); // Emily follows Sarah and David
    this.followRelationships.set(5, new Set([1, 2, 3, 4])); // David follows everyone
    
    // Update follow counts based on relationships
    this.users.forEach(user => {
      user.followingCount = this.followRelationships.get(user.Id)?.size || 0;
      user.followersCount = this.getFollowersCount(user.Id);
    });
  }

  getFollowersCount(userId) {
    let count = 0;
    for (const [, followedUsers] of this.followRelationships) {
      if (followedUsers.has(userId)) {
        count++;
      }
    }
    return count;
  }

async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll() {
    await this.delay();
    return [...this.users];
  }

  async getById(id) {
    await this.delay();
    const user = this.users.find(user => user.Id === parseInt(id));
    if (user) {
      // Ensure follow counts are current
      user.followingCount = this.followRelationships.get(user.Id)?.size || 0;
      user.followersCount = this.getFollowersCount(user.Id);
    }
    return user;
  }

  async getCurrentUser() {
    await this.delay();
    // Return the first user as the current logged-in user
    const user = this.users[0];
    if (user) {
      user.followingCount = this.followRelationships.get(user.Id)?.size || 0;
      user.followersCount = this.getFollowersCount(user.Id);
    }
    return user;
  }

  async updateProfile(id, data) {
    await this.delay();
    const userIndex = this.users.findIndex(user => user.Id === parseInt(id));
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...data };
      return this.users[userIndex];
    }
    throw new Error("User not found");
  }

  async followUser(targetUserId) {
    await this.delay();
    const currentUser = await this.getCurrentUser();
    const targetId = parseInt(targetUserId);
    
    if (currentUser.Id === targetId) {
      throw new Error("Cannot follow yourself");
    }

    if (!this.followRelationships.has(currentUser.Id)) {
      this.followRelationships.set(currentUser.Id, new Set());
    }

    this.followRelationships.get(currentUser.Id).add(targetId);
    
    // Update follow counts
    const targetUser = this.users.find(u => u.Id === targetId);
    if (targetUser) {
      targetUser.followersCount = this.getFollowersCount(targetId);
    }
    
    return { success: true };
  }

  async unfollowUser(targetUserId) {
    await this.delay();
    const currentUser = await this.getCurrentUser();
    const targetId = parseInt(targetUserId);

    if (this.followRelationships.has(currentUser.Id)) {
      this.followRelationships.get(currentUser.Id).delete(targetId);
    }

    // Update follow counts
    const targetUser = this.users.find(u => u.Id === targetId);
    if (targetUser) {
      targetUser.followersCount = this.getFollowersCount(targetId);
    }

    return { success: true };
  }

  async isFollowing(targetUserId) {
    await this.delay();
    const currentUser = await this.getCurrentUser();
    const targetId = parseInt(targetUserId);
    
    return this.followRelationships.get(currentUser.Id)?.has(targetId) || false;
  }

  async getFollowing(userId) {
    await this.delay();
    const id = parseInt(userId);
    const followingIds = this.followRelationships.get(id) || new Set();
    
    return this.users
      .filter(user => followingIds.has(user.Id))
      .map(user => ({
        ...user,
        isFollowing: this.isFollowingSync(user.Id)
      }));
  }

  async getFollowers(userId) {
    await this.delay();
    const id = parseInt(userId);
    const followers = [];
    
    for (const [followerId, followedUsers] of this.followRelationships) {
      if (followedUsers.has(id)) {
        const follower = this.users.find(u => u.Id === followerId);
        if (follower) {
          followers.push({
            ...follower,
            isFollowing: this.isFollowingSync(follower.Id)
          });
        }
      }
    }
    
    return followers;
  }

  async getFollowingIds(userId) {
    await this.delay();
    const id = parseInt(userId);
    return Array.from(this.followRelationships.get(id) || new Set());
  }

  isFollowingSync(targetUserId) {
    const currentUserId = 1; // Assuming current user is always user 1
    const targetId = parseInt(targetUserId);
    return this.followRelationships.get(currentUserId)?.has(targetId) || false;
  }
}

export default new UserService();