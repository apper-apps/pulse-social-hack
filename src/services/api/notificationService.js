import userService from './userService.js';

class NotificationService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'app_Notification';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type" } },
          { field: { Name: "targetType" } },
          { field: { Name: "conversationId" } },
          { field: { Name: "commentId" } },
          { field: { Name: "content" } },
          { field: { Name: "commentText" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "read" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "actorId" } },
          { field: { Name: "targetId" } },
          { field: { Name: "postId" } }
        ],
        orderBy: [
          { fieldName: "timestamp", sorttype: "DESC" }
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
        console.error("Error fetching notifications:", error?.response?.data?.message);
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
          { field: { Name: "type" } },
          { field: { Name: "targetType" } },
          { field: { Name: "conversationId" } },
          { field: { Name: "commentId" } },
          { field: { Name: "content" } },
          { field: { Name: "commentText" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "read" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "actorId" } },
          { field: { Name: "targetId" } },
          { field: { Name: "postId" } }
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
        console.error(`Error fetching notification with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async getByUserId(userId, options = {}) {
    try {
      const { limit = 20, offset = 0, unreadOnly = false } = options;
      
      const whereConditions = [
        {
          FieldName: "targetId",
          Operator: "EqualTo",
          Values: [parseInt(userId)]
        }
      ];

      if (unreadOnly) {
        whereConditions.push({
          FieldName: "read",
          Operator: "EqualTo",
          Values: [false]
        });
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type" } },
          { field: { Name: "targetType" } },
          { field: { Name: "conversationId" } },
          { field: { Name: "commentId" } },
          { field: { Name: "content" } },
          { field: { Name: "commentText" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "read" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "actorId" } },
          { field: { Name: "targetId" } },
          { field: { Name: "postId" } }
        ],
        where: whereConditions,
        orderBy: [
          { fieldName: "timestamp", sorttype: "DESC" }
        ],
        pagingInfo: {
          limit: limit,
          offset: offset
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
        console.error("Error fetching user notifications:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getGroupedNotifications(userId) {
    try {
      const userNotifications = await this.getByUserId(userId);
      
      // Enrich notifications with actor data
      const enrichedNotifications = await Promise.all(
userNotifications.map(async (notification) => {
          let actor = null;
          
          // Validate actor ID before attempting to fetch
          const actorId = notification.actorId?.Id || notification.actorId;
          if (actorId && !isNaN(parseInt(actorId))) {
            try {
              actor = await userService.getById(parseInt(actorId));
            } catch (error) {
              console.error(`Failed to fetch actor with ID ${actorId} for notification ${notification.Id}:`, error.message);
            }
          }
          
          // Provide fallback actor information if record doesn't exist
          return {
            ...notification,
            actor: actor || { 
              Id: actorId || 0,
              displayName: 'Unknown User', 
              profilePicture: null,
              username: 'unknown'
            }
          };
        })
      );

      // Group by type
      const grouped = {
        likes: enrichedNotifications.filter(n => n.type === 'like'),
        comments: enrichedNotifications.filter(n => n.type === 'comment'),
        follows: enrichedNotifications.filter(n => n.type === 'follow'),
        mentions: enrichedNotifications.filter(n => n.type === 'mention'),
        messages: enrichedNotifications.filter(n => n.type === 'message')
      };

      return grouped;
    } catch (error) {
      console.error("Error fetching grouped notifications:", error);
      return { likes: [], comments: [], follows: [], mentions: [], messages: [] };
    }
  }

  async markAsRead(id) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            read: true
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
          console.error(`Failed to mark notification as read ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error marking notification as read:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async markAsUnread(id) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            read: false
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
          console.error(`Failed to mark notification as unread ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error marking notification as unread:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      // First get all unread notifications for the user
      const unreadNotifications = await this.getByUserId(userId, { unreadOnly: true });
      
      if (unreadNotifications.length === 0) {
        return { success: true, count: 0 };
      }

      const records = unreadNotifications.map(notification => ({
        Id: notification.Id,
        read: true
      }));

      const params = { records };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return { success: false, count: 0 };
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to mark all notifications as read ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        }
        
        return { success: true, count: successfulUpdates.length };
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error marking all notifications as read:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return { success: false, count: 0 };
    }
  }

  async markSelectedAsRead(notificationIds) {
    try {
      const records = notificationIds.map(id => ({
        Id: parseInt(id),
        read: true
      }));

      const params = { records };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return { success: false, count: 0 };
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to mark selected notifications as read ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        }
        
        return { success: true, count: successfulUpdates.length };
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error marking selected notifications as read:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return { success: false, count: 0 };
    }
  }

  async getUnreadCount(userId) {
    try {
      const unreadNotifications = await this.getByUserId(userId, { unreadOnly: true });
      return unreadNotifications.length;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
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
          console.error(`Failed to delete notification ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting notification:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async deleteMultiple(notificationIds) {
    try {
      const params = {
        RecordIds: notificationIds.map(id => parseInt(id))
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return { success: false, count: 0 };
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete notifications ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        }
        
        return { success: true, count: successfulDeletions.length };
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting notifications:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return { success: false, count: 0 };
    }
  }

  async create(notificationData) {
    try {
      const params = {
        records: [
          {
            Name: notificationData.Name || `${notificationData.type} notification`,
            Tags: notificationData.Tags || '',
            type: notificationData.type,
            targetType: notificationData.targetType,
            conversationId: notificationData.conversationId || '',
            commentId: notificationData.commentId || '',
            content: notificationData.content || '',
            commentText: notificationData.commentText || '',
            timestamp: new Date().toISOString(),
            read: false,
            createdAt: new Date().toISOString(),
            actorId: parseInt(notificationData.actorId),
            targetId: parseInt(notificationData.targetId),
            postId: notificationData.postId ? parseInt(notificationData.postId) : null
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
          console.error(`Failed to create notification ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating notification:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  getNotificationIcon(type) {
    switch (type) {
      case "like":
        return "Heart";
      case "follow":
        return "UserPlus";
      case "comment":
        return "MessageCircle";
      case "mention":
        return "AtSign";
      case "message":
        return "MessageSquare";
      default:
        return "Bell";
    }
  }

  getNotificationColor(type) {
    switch (type) {
      case "like":
        return "text-accent-500";
      case "follow":
        return "text-primary-500";
      case "comment":
        return "text-blue-500";
      case "mention":
        return "text-purple-500";
      case "message":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  }

  formatNotificationText(notification) {
    const { type, actor, content, commentText } = notification;
    
    switch (type) {
      case 'like':
        if (notification.targetType === 'post') {
          return `liked your post`;
        } else if (notification.targetType === 'comment') {
          return `liked your comment`;
        }
        return 'liked your content';
      
      case 'follow':
        return 'started following you';
      
      case 'comment':
        return 'commented on your post';
      
      case 'mention':
        return 'mentioned you in a post';
      
      case 'message':
        return 'sent you a message';
      
      default:
        return 'interacted with your content';
    }
  }

  getContentPreview(notification) {
    const { type, content, commentText } = notification;
    
    if (type === 'comment' && commentText) {
      return commentText.length > 100 ? commentText.substring(0, 100) + '...' : commentText;
    }
    
    if (content && content.length > 100) {
      return content.substring(0, 100) + '...';
    }
    
    return content || null;
  }

  // Real-time notification simulation
  simulateRealTimeNotification(targetUserId = 1) {
    const types = ['like', 'comment', 'follow', 'mention'];
    const actors = [2, 3, 4, 5]; // Sample actor IDs
    
    const notification = {
      type: types[Math.floor(Math.random() * types.length)],
      actorId: actors[Math.floor(Math.random() * actors.length)],
      targetId: targetUserId,
      targetType: 'post',
      content: 'Sample notification content for real-time demo',
      postId: Math.floor(Math.random() * 10) + 1,
      read: false
    };

    return this.create(notification);
  }
}

// Create instance and export
const notificationService = new NotificationService();

export default notificationService;