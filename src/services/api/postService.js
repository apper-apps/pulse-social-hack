import posts from "../mockData/posts.json";
import userService from "./userService.js";
class PostService {
  constructor() {
    this.posts = [...posts];
    this.comments = []; // Track comments count for posts
    this.nextId = Math.max(...posts.map(p => p.Id)) + 1;
  }

  async delay() {
return new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200));
  }

  async getAll(page = 1, limit = 10) {
    await this.delay();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const sortedPosts = [...this.posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return sortedPosts.slice(startIndex, endIndex);
  }

  async getFollowingFeed(userId, page = 1, limit = 10) {
    await this.delay();
    const followingIds = await userService.getFollowingIds(userId);
    
    if (followingIds.length === 0) {
      // If not following anyone, return suggested content (all posts)
      return this.getAll(page, limit);
    }

    // Filter posts from followed users
    const followingPosts = this.posts.filter(post => 
      followingIds.includes(post.authorId)
    );

    // If we have very few posts from following, supplement with suggested content
    if (followingPosts.length < 5) {
      const allPosts = [...this.posts];
      const suggestedPosts = allPosts.filter(post => 
        !followingIds.includes(post.authorId) && post.authorId !== userId
      );
      
      // Mix following posts with suggested posts
      const mixedPosts = [...followingPosts, ...suggestedPosts.slice(0, 8)];
      const sortedPosts = mixedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      return sortedPosts.slice(startIndex, endIndex);
    }

    // Sort by timestamp and paginate
    const sortedPosts = followingPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return sortedPosts.slice(startIndex, endIndex);
  }

async getById(id) {
  await this.delay();
  return this.posts.find(post => post.Id === parseInt(id));
}

async getTrendingPosts(limit = 20) {
  await this.delay();
  // Sort posts by engagement score (likes + comments)
  const sortedPosts = [...this.posts]
    .map(post => ({
      ...post,
      engagementScore: post.likes + post.comments
    }))
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, limit);
  
  return sortedPosts;
}

  async getByUserId(userId, page = 1, limit = 12) {
    await this.delay();
    const userPosts = this.posts.filter(post => post.authorId === parseInt(userId));
    const sortedPosts = userPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return sortedPosts.slice(startIndex, endIndex);
  }

  async create(postData) {
    await this.delay();
    const currentUser = await userService.getCurrentUser();
    const newPost = {
      Id: this.nextId++,
      authorId: currentUser.Id,
      content: postData.content,
      imageUrl: postData.imageUrl || null,
      likes: 0,
      isLiked: false,
      comments: 0,
      shares: 0,
      timestamp: new Date().toISOString()
    };
    this.posts.unshift(newPost);
    return newPost;
  }

  async toggleLike(id) {
    await this.delay();
    const postIndex = this.posts.findIndex(post => post.Id === parseInt(id));
    if (postIndex !== -1) {
      const post = this.posts[postIndex];
      post.isLiked = !post.isLiked;
      post.likes += post.isLiked ? 1 : -1;
      return post;
    }
    throw new Error("Post not found");
  }

  async delete(id) {
    await this.delay();
    const postIndex = this.posts.findIndex(post => post.Id === parseInt(id));
    if (postIndex !== -1) {
      this.posts.splice(postIndex, 1);
      return true;
    }
throw new Error("Post not found");
  }

async addComment(postId) {
    await this.delay();
    
    const post = this.posts.find(p => p.Id === parseInt(postId));
    if (!post) {
      throw new Error("Post not found");
    }

    post.comments = (post.comments || 0) + 1;
    return { ...post };
  }

async removeComment(postId) {
    await this.delay();
    
    const post = this.posts.find(p => p.Id === parseInt(postId));
    if (!post) {
      throw new Error("Post not found");
    }

    post.comments = Math.max((post.comments || 0) - 1, 0);
    return { ...post };
  }
}

export default new PostService();