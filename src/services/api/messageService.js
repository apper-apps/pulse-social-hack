import messagesData from '@/services/mockData/messages.json';

let messages = [...messagesData];

const messageService = {
  getAll: () => {
    return Promise.resolve([...messages]);
  },

  getByConversationId: (conversationId) => {
    const numericId = parseInt(conversationId);
    if (isNaN(numericId)) {
      return Promise.reject(new Error('Invalid conversation ID'));
    }
    
    const conversationMessages = messages
      .filter(m => m.conversationId === numericId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return Promise.resolve(conversationMessages.map(m => ({ ...m })));
  },

  create: (messageData) => {
    const newId = Math.max(...messages.map(m => m.Id), 0) + 1;
    const newMessage = {
      Id: newId,
      conversationId: messageData.conversationId,
      senderId: messageData.senderId,
      content: messageData.content,
      timestamp: new Date().toISOString(),
      type: messageData.type || 'text',
      readBy: [messageData.senderId],
      ...messageData
    };
    
    messages.push(newMessage);
    return Promise.resolve({ ...newMessage });
  },

  markAsRead: (messageId, userId) => {
    const numericId = parseInt(messageId);
    const numericUserId = parseInt(userId);
    
    if (isNaN(numericId) || isNaN(numericUserId)) {
      return Promise.reject(new Error('Invalid message or user ID'));
    }
    
    const message = messages.find(m => m.Id === numericId);
    if (!message) {
      return Promise.reject(new Error('Message not found'));
    }
    
    if (!message.readBy.includes(numericUserId)) {
      message.readBy.push(numericUserId);
    }
    
    return Promise.resolve({ ...message });
  }
};

export default messageService;