import conversationsData from '@/services/mockData/conversations.json';

let conversations = [...conversationsData];

const conversationService = {
  getAll: () => {
    return Promise.resolve([...conversations]);
  },

  getById: (id) => {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return Promise.reject(new Error('Invalid conversation ID'));
    }
    
    const conversation = conversations.find(c => c.Id === numericId);
    if (!conversation) {
      return Promise.reject(new Error('Conversation not found'));
    }
    
    return Promise.resolve({ ...conversation });
  },

  create: (conversationData) => {
    const newId = Math.max(...conversations.map(c => c.Id), 0) + 1;
    const newConversation = {
      Id: newId,
      participants: conversationData.participants || [],
      lastMessage: null,
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      ...conversationData
    };
    
    conversations.push(newConversation);
    return Promise.resolve({ ...newConversation });
  },

  update: (id, updateData) => {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return Promise.reject(new Error('Invalid conversation ID'));
    }
    
    const index = conversations.findIndex(c => c.Id === numericId);
    if (index === -1) {
      return Promise.reject(new Error('Conversation not found'));
    }
    
    conversations[index] = {
      ...conversations[index],
      ...updateData,
      Id: numericId
    };
    
    return Promise.resolve({ ...conversations[index] });
  },

  delete: (id) => {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return Promise.reject(new Error('Invalid conversation ID'));
    }
    
    const index = conversations.findIndex(c => c.Id === numericId);
    if (index === -1) {
      return Promise.reject(new Error('Conversation not found'));
    }
    
    const deletedConversation = conversations[index];
    conversations.splice(index, 1);
    return Promise.resolve({ ...deletedConversation });
  },

  getByParticipants: (participantIds) => {
    const conversation = conversations.find(c => 
      c.participants.length === participantIds.length &&
      participantIds.every(id => c.participants.includes(id))
    );
    
    return Promise.resolve(conversation ? { ...conversation } : null);
  }
};

export default conversationService;