import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import conversationService from "@/services/api/conversationService";
import messageService from "@/services/api/messageService";
import userService from "@/services/api/userService";

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState({});
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);

  // Current user ID (simulated)
  const currentUserId = 1;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [conversationsData, usersData] = await Promise.all([
        conversationService.getAll(),
        userService.getAll()
      ]);

      // Create users lookup
      const usersLookup = {};
      usersData.forEach(user => {
        usersLookup[user.Id] = user;
      });

      setConversations(conversationsData.sort((a, b) => 
        new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      ));
      setUsers(usersLookup);
    } catch (error) {
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    try {
      const allUsers = await userService.getAll();
      const filtered = allUsers.filter(user => 
        user.Id !== currentUserId &&
        (user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         user.username.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(filtered);
    } catch (error) {
      toast.error("Failed to search users");
    }
  };

  const loadConversation = async (conversation) => {
    try {
      setActiveConversation(conversation);
      const messagesData = await messageService.getByConversationId(conversation.Id);
      setMessages(messagesData);

      // Mark messages as read
      const unreadMessages = messagesData.filter(msg => 
        !msg.readBy.includes(currentUserId) && msg.senderId !== currentUserId
      );
      
      for (const message of unreadMessages) {
        await messageService.markAsRead(message.Id, currentUserId);
      }

      // Update conversation unread count
      if (conversation.unreadCount > 0) {
        await conversationService.update(conversation.Id, { unreadCount: 0 });
        loadData(); // Refresh conversations
      }
    } catch (error) {
      toast.error("Failed to load messages");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || sending) return;

    try {
      setSending(true);
      const messageData = {
        conversationId: activeConversation.Id,
        senderId: currentUserId,
        content: newMessage.trim()
      };

      const sentMessage = await messageService.create(messageData);
      setMessages(prev => [...prev, sentMessage]);

      // Update conversation last message
      await conversationService.update(activeConversation.Id, {
        lastMessage: newMessage.trim(),
        lastMessageTime: sentMessage.timestamp
      });

      setNewMessage("");
      loadData(); // Refresh conversations
      toast.success("Message sent!");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const startNewConversation = async (user) => {
    try {
      // Check if conversation already exists
      const existingConversation = await conversationService.getByParticipants([currentUserId, user.Id]);
      
      if (existingConversation) {
        setActiveConversation(existingConversation);
        loadConversation(existingConversation);
      } else {
        // Create new conversation
        const newConversation = await conversationService.create({
          participants: [currentUserId, user.Id]
        });
        setActiveConversation(newConversation);
        setMessages([]);
        loadData(); // Refresh conversations
      }
      
      setShowCompose(false);
      setSearchQuery("");
      toast.success(`Started conversation with ${user.displayName}`);
    } catch (error) {
      toast.error("Failed to start conversation");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherParticipant = (conversation) => {
    const otherUserId = conversation.participants.find(id => id !== currentUserId);
    return users[otherUserId];
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE HH:mm');
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <ApperIcon name="Loader2" className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversations List - 30% width */}
      <div className="w-full md:w-[30%] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-display font-bold text-gray-900">Messages</h1>
            <Button
              size="sm"
              onClick={() => setShowCompose(!showCompose)}
              icon="Plus"
            >
              Compose
            </Button>
          </div>

          {/* Compose Modal */}
          {showCompose && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <ApperIcon name="Search" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {searchResults.map(user => (
                    <button
                      key={user.Id}
                      onClick={() => startNewConversation(user)}
                      className="w-full flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <Avatar src={user.profilePicture} alt={user.displayName} size="sm" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                        <div className="text-xs text-gray-500">@{user.username}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <ApperIcon name="MessageSquare" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400 mt-1">Start a new conversation to get started</p>
            </div>
          ) : (
            conversations.map(conversation => {
              const otherParticipant = getOtherParticipant(conversation);
              if (!otherParticipant) return null;

              return (
                <button
                  key={conversation.Id}
                  onClick={() => loadConversation(conversation)}
                  className={`w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                    activeConversation?.Id === conversation.Id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-transparent'
                  }`}
                >
                  <Avatar src={otherParticipant.profilePicture} alt={otherParticipant.displayName} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{otherParticipant.displayName}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Chat - 70% width */}
      <div className="hidden md:flex md:w-[70%] flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              {(() => {
                const otherParticipant = getOtherParticipant(activeConversation);
                if (!otherParticipant) return null;

                return (
                  <div className="flex items-center space-x-3">
                    <Avatar src={otherParticipant.profilePicture} alt={otherParticipant.displayName} />
                    <div>
                      <h2 className="font-medium text-gray-900">{otherParticipant.displayName}</h2>
                      <p className="text-sm text-gray-500">@{otherParticipant.username}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <ApperIcon name="MessageSquare" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map(message => {
                  const sender = users[message.senderId];
                  const isOwn = message.senderId === currentUserId;

                  return (
                    <div key={message.Id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {!isOwn && (
                          <Avatar src={sender?.profilePicture} alt={sender?.displayName} size="sm" />
                        )}
                        <div>
                          <div className={`px-4 py-2 rounded-2xl ${
                            isOwn 
                              ? 'bg-primary-500 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  loading={sending}
                  icon="Send"
                  className="rounded-full"
                >
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ApperIcon name="MessageSquare" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Show active chat as overlay */}
      {activeConversation && (
        <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
          {/* Mobile Chat Header */}
          <div className="p-4 bg-white border-b border-gray-200 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveConversation(null)}
              icon="ArrowLeft"
              className="mr-3"
            />
            {(() => {
              const otherParticipant = getOtherParticipant(activeConversation);
              if (!otherParticipant) return null;

              return (
                <div className="flex items-center space-x-3">
                  <Avatar src={otherParticipant.profilePicture} alt={otherParticipant.displayName} size="sm" />
                  <div>
                    <h2 className="font-medium text-gray-900">{otherParticipant.displayName}</h2>
                    <p className="text-xs text-gray-500">@{otherParticipant.username}</p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Mobile Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => {
              const sender = users[message.senderId];
              const isOwn = message.senderId === currentUserId;

              return (
                <div key={message.Id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end space-x-2 max-w-xs ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isOwn && (
                      <Avatar src={sender?.profilePicture} alt={sender?.displayName} size="sm" />
                    )}
                    <div>
                      <div className={`px-4 py-2 rounded-2xl ${
                        isOwn 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Mobile Message Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                loading={sending}
                icon="Send"
                className="rounded-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;