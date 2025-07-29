import notifications from "../mockData/notifications.json";
import userService from "./userService.js";

// Notification Service Class

class NotificationService {
  constructor() {
    this.notifications = [...notifications];
    this.nextId = Math.max(...this.notifications.map(n => n.Id)) + 1;
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll() {
    await this.delay();
    return [...this.notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getById(id) {
    await this.delay();
    const notification = this.notifications.find(n => n.Id === parseInt(id));
    return notification ? { ...notification } : null;
  }

  async getByUserId(userId, options = {}) {
    await this.delay();
    const { limit = 20, offset = 0, unreadOnly = false } = options;
    
    let userNotifications = this.notifications
      .filter(n => n.targetId === parseInt(userId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.read);
    }

    return userNotifications.slice(offset, offset + limit);
  }

  async getGroupedNotifications(userId) {
    await this.delay();
    const userNotifications = await this.getByUserId(userId);
    
    // Enrich notifications with actor data
    const enrichedNotifications = await Promise.all(
      userNotifications.map(async (notification) => {
        const actor = await userService.getById(notification.actorId);
        return {
          ...notification,
          actor: actor || { displayName: 'Unknown User', profilePicture: null }
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
  }

  async markAsRead(id) {
    await this.delay();
    const notification = this.notifications.find(n => n.Id === parseInt(id));
    if (notification) {
      notification.read = true;
      return { ...notification };
    }
    throw new Error("Notification not found");
  }

  async markAsUnread(id) {
    await this.delay();
    const notification = this.notifications.find(n => n.Id === parseInt(id));
    if (notification) {
      notification.read = false;
      return { ...notification };
    }
    throw new Error("Notification not found");
  }

  async markAllAsRead(userId) {
    await this.delay();
    const userNotifications = this.notifications.filter(n => n.targetId === parseInt(userId));
    userNotifications.forEach(notification => {
      notification.read = true;
    });
    return { success: true, count: userNotifications.length };
  }

  async markSelectedAsRead(notificationIds) {
    await this.delay();
    const updated = [];
    notificationIds.forEach(id => {
      const notification = this.notifications.find(n => n.Id === parseInt(id));
      if (notification) {
        notification.read = true;
        updated.push(notification);
      }
    });
    return { success: true, count: updated.length };
  }

  async getUnreadCount(userId) {
    await this.delay();
    const unreadNotifications = this.notifications.filter(
      n => n.targetId === parseInt(userId) && !n.read
    );
    return unreadNotifications.length;
  }

  async delete(id) {
    await this.delay();
    const index = this.notifications.findIndex(n => n.Id === parseInt(id));
    if (index !== -1) {
      const deleted = this.notifications.splice(index, 1)[0];
      return deleted;
    }
    throw new Error("Notification not found");
  }

  async deleteMultiple(notificationIds) {
    await this.delay();
    const deleted = [];
    notificationIds.forEach(id => {
      const index = this.notifications.findIndex(n => n.Id === parseInt(id));
      if (index !== -1) {
        deleted.push(this.notifications.splice(index, 1)[0]);
      }
    });
    return { success: true, count: deleted.length };
  }

  async create(notificationData) {
    await this.delay();
    const newNotification = {
      Id: this.nextId++,
      ...notificationData,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(newNotification);
    return { ...newNotification };
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