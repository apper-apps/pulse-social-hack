class ConversationService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'conversation';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "participants" } },
          { field: { Name: "lastMessage" } },
          { field: { Name: "lastMessageTime" } },
          { field: { Name: "unreadCount" } },
          { field: { Name: "createdAt" } }
        ],
        orderBy: [
          { fieldName: "lastMessageTime", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      // Parse participants field from string to array
      const conversations = (response.data || []).map(conv => ({
        ...conv,
        participants: conv.participants ? conv.participants.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : []
      }));

      return conversations;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching conversations:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getById(id) {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error('Invalid conversation ID');
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "participants" } },
          { field: { Name: "lastMessage" } },
          { field: { Name: "lastMessageTime" } },
          { field: { Name: "unreadCount" } },
          { field: { Name: "createdAt" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, numericId, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.data) {
        // Parse participants field from string to array
        response.data.participants = response.data.participants ? 
          response.data.participants.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching conversation with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async create(conversationData) {
    try {
      const params = {
        records: [
          {
            Name: conversationData.Name || `Conversation ${Date.now()}`,
            Tags: conversationData.Tags || '',
            participants: Array.isArray(conversationData.participants) 
              ? conversationData.participants.join(',') 
              : (conversationData.participants || ''),
            lastMessage: conversationData.lastMessage || null,
            lastMessageTime: new Date().toISOString(),
            unreadCount: conversationData.unreadCount || 0,
            createdAt: new Date().toISOString()
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
          console.error(`Failed to create conversation ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        const createdConversation = successfulRecords[0]?.data;
        if (createdConversation) {
          // Parse participants field from string to array
          createdConversation.participants = createdConversation.participants ? 
            createdConversation.participants.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
        }
        
        return createdConversation;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating conversation:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error('Invalid conversation ID');
      }

      const updateRecord = {
        Id: numericId
      };

      // Only include fields that are being updated
      if (updateData.participants !== undefined) {
        updateRecord.participants = Array.isArray(updateData.participants) 
          ? updateData.participants.join(',') 
          : updateData.participants;
      }
      if (updateData.lastMessage !== undefined) {
        updateRecord.lastMessage = updateData.lastMessage;
      }
      if (updateData.lastMessageTime !== undefined) {
        updateRecord.lastMessageTime = updateData.lastMessageTime;
      }
      if (updateData.unreadCount !== undefined) {
        updateRecord.unreadCount = updateData.unreadCount;
      }

      const params = {
        records: [updateRecord]
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
          console.error(`Failed to update conversation ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        const updatedConversation = successfulUpdates[0]?.data;
        if (updatedConversation) {
          // Parse participants field from string to array
          updatedConversation.participants = updatedConversation.participants ? 
            updatedConversation.participants.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
        }
        
        return updatedConversation;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating conversation:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error('Invalid conversation ID');
      }

      const params = {
        RecordIds: [numericId]
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
          console.error(`Failed to delete conversation ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting conversation:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async getByParticipants(participantIds) {
    try {
      const allConversations = await this.getAll();
      
      const conversation = allConversations.find(c => 
        c.participants.length === participantIds.length &&
        participantIds.every(id => c.participants.includes(parseInt(id)))
      );
      
      return conversation || null;
    } catch (error) {
      console.error("Error finding conversation by participants:", error);
      return null;
    }
  }
}

// Create instance and export
const conversationService = new ConversationService();

export default conversationService;