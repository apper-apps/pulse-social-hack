import userService from './userService.js';

class PostService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'post';
  }

  async getAll(page = 1, limit = 10) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "content" } },
          { field: { Name: "imageUrl" } },
          { field: { Name: "mediaUrls" } },
          { field: { Name: "likes" } },
          { field: { Name: "isLiked" } },
          { field: { Name: "comments" } },
          { field: { Name: "shares" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "authorId" } }
        ],
        orderBy: [
          { fieldName: "timestamp", sorttype: "DESC" }
        ],
        pagingInfo: {
          limit: limit,
          offset: (page - 1) * limit
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching posts:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getFollowingFeed(userId, page = 1, limit = 10) {
    try {
      const followingIds = await userService.getFollowingIds(userId);
      
      if (followingIds.length === 0) {
        // If not following anyone, return suggested content (all posts)
        return this.getAll(page, limit);
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "content" } },
          { field: { Name: "imageUrl" } },
          { field: { Name: "mediaUrls" } },
          { field: { Name: "likes" } },
          { field: { Name: "isLiked" } },
          { field: { Name: "comments" } },
          { field: { Name: "shares" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "authorId" } }
        ],
        where: [
          {
            FieldName: "authorId",
            Operator: "ExactMatch",
            Values: followingIds
          }
        ],
        orderBy: [
          { fieldName: "timestamp", sorttype: "DESC" }
        ],
        pagingInfo: {
          limit: limit,
          offset: (page - 1) * limit
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      const followingPosts = response.data || [];

      // If we have very few posts from following, supplement with suggested content
      if (followingPosts.length < 5) {
        const suggestedPosts = await this.getAll(page, Math.max(limit - followingPosts.length, 5));
        const filteredSuggested = suggestedPosts.filter(post => 
          !followingIds.includes(post.authorId?.Id || post.authorId) && 
          (post.authorId?.Id || post.authorId) !== userId
        );
        
        return [...followingPosts, ...filteredSuggested].slice(0, limit);
      }

      return followingPosts;
    } catch (error) {
      console.error("Error fetching following feed:", error);
      return this.getAll(page, limit);
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "content" } },
          { field: { Name: "imageUrl" } },
          { field: { Name: "mediaUrls" } },
          { field: { Name: "likes" } },
          { field: { Name: "isLiked" } },
          { field: { Name: "comments" } },
          { field: { Name: "shares" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "authorId" } }
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
        console.error(`Error fetching post with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async getTrendingPosts(limit = 20) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "content" } },
          { field: { Name: "imageUrl" } },
          { field: { Name: "mediaUrls" } },
          { field: { Name: "likes" } },
          { field: { Name: "isLiked" } },
          { field: { Name: "comments" } },
          { field: { Name: "shares" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "authorId" } }
        ],
        pagingInfo: {
          limit: limit,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      // Sort posts by engagement score (likes + comments)
      const sortedPosts = (response.data || [])
        .map(post => ({
          ...post,
          engagementScore: (post.likes || 0) + (post.comments || 0)
        }))
        .sort((a, b) => b.engagementScore - a.engagementScore);
      
      return sortedPosts;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching trending posts:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getByUserId(userId, page = 1, limit = 12) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "content" } },
          { field: { Name: "imageUrl" } },
          { field: { Name: "mediaUrls" } },
          { field: { Name: "likes" } },
          { field: { Name: "isLiked" } },
          { field: { Name: "comments" } },
          { field: { Name: "shares" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "authorId" } }
        ],
        where: [
          {
            FieldName: "authorId",
            Operator: "EqualTo",
            Values: [parseInt(userId)]
          }
        ],
        orderBy: [
          { fieldName: "timestamp", sorttype: "DESC" }
        ],
        pagingInfo: {
          limit: limit,
          offset: (page - 1) * limit
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching user posts:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async create(postData) {
    try {
      const currentUser = await userService.getCurrentUser();
      
      // Handle backward compatibility with imageUrl
      let mediaUrls = [];
      if (postData.imageUrl) {
        mediaUrls = [postData.imageUrl];
      } else if (postData.mediaFiles && postData.mediaFiles.length > 0) {
        // In a real app, you'd upload files to a server and get URLs back
        // For now, we'll use the preview URLs from the file reader
        mediaUrls = postData.mediaFiles.map(media => media.preview);
      }

      const params = {
        records: [
          {
            Name: postData.Name || `Post by ${currentUser?.displayName || 'User'}`,
            Tags: postData.Tags || '',
            content: postData.content,
            imageUrl: mediaUrls.length > 0 ? mediaUrls[0] : null,
            mediaUrls: mediaUrls.join(','),
            likes: 0,
            isLiked: false,
            comments: 0,
            shares: 0,
            timestamp: new Date().toISOString(),
            authorId: currentUser?.Id || 1
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create post ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating post:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async toggleLike(id) {
    try {
      const post = await this.getById(id);
      if (!post) {
        throw new Error("Post not found");
      }

      const newIsLiked = !post.isLiked;
      const newLikes = newIsLiked ? (post.likes || 0) + 1 : Math.max((post.likes || 0) - 1, 0);

      const params = {
        records: [
          {
            Id: parseInt(id),
            isLiked: newIsLiked,
            likes: newLikes
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
          console.error(`Failed to toggle post like ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error toggling post like:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete post ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting post:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async addComment(postId) {
    try {
      const post = await this.getById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      const newCommentCount = (post.comments || 0) + 1;

      const params = {
        records: [
          {
            Id: parseInt(postId),
            comments: newCommentCount
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
          console.error(`Failed to add comment to post ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error adding comment to post:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async removeComment(postId) {
    try {
      const post = await this.getById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      const newCommentCount = Math.max((post.comments || 0) - 1, 0);

      const params = {
        records: [
          {
            Id: parseInt(postId),
            comments: newCommentCount
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
          console.error(`Failed to remove comment from post ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error removing comment from post:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
}

// Create instance and export
const postService = new PostService();

export default postService;