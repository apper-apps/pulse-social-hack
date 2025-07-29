class MessageService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'message';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "conversationId" } },
          { field: { Name: "senderId" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } },
          { field: { Name: "readBy" } }
        ],
        orderBy: [
          { fieldName: "timestamp", sorttype: "ASC" }
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
        console.error("Error fetching messages:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getByConversationId(conversationId) {
    try {
      const numericId = parseInt(conversationId);
      if (isNaN(numericId)) {
        throw new Error('Invalid conversation ID');
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "conversationId" } },
          { field: { Name: "senderId" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } },
          { field: { Name: "readBy" } }
        ],
        where: [
          {
            FieldName: "conversationId",
            Operator: "EqualTo",
            Values: [numericId]
          }
        ],
        orderBy: [
          { fieldName: "timestamp", sorttype: "ASC" }
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
        console.error("Error fetching conversation messages:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async create(messageData) {
    try {
      const params = {
        records: [
          {
            Name: messageData.Name || `Message from ${messageData.senderId}`,
            Tags: messageData.Tags || '',
            conversationId: parseInt(messageData.conversationId),
            senderId: parseInt(messageData.senderId),
            content: messageData.content,
            timestamp: new Date().toISOString(),
            type: messageData.type || 'text',
            readBy: messageData.senderId ? messageData.senderId.toString() : ''
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
          console.error(`Failed to create message ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating message:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async markAsRead(messageId, userId) {
    try {
      const numericId = parseInt(messageId);
      const numericUserId = parseInt(userId);
      
      if (isNaN(numericId) || isNaN(numericUserId)) {
        throw new Error('Invalid message or user ID');
      }
      
      // Get the current message to update readBy field
      const message = await this.getById(numericId);
      if (!message) {
        throw new Error('Message not found');
      }
      
      // Parse existing readBy and add new user if not already included
      let readByArray = [];
      if (message.readBy) {
        readByArray = message.readBy.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      }
      
      if (!readByArray.includes(numericUserId)) {
        readByArray.push(numericUserId);
      }

      const params = {
        records: [
          {
            Id: numericId,
            readBy: readByArray.join(',')
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
          console.error(`Failed to mark message as read ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error marking message as read:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "conversationId" } },
          { field: { Name: "senderId" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } },
          { field: { Name: "readBy" } }
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
        console.error(`Error fetching message with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }
}

// Create instance and export
const messageService = new MessageService();

export default messageService;