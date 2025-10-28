import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Search, Users, Building2, Users2, Loader2 } from 'lucide-react';
import chatService, { ChatRoom } from '../../services/chatService';
import { userService, User } from '../../services/userService';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../config';

interface ChatSidebarProps {
  selectedRoomId: number | null;
  onRoomSelect: (roomId: number) => void;
  currentUserId: number;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ selectedRoomId, onRoomSelect, currentUserId }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [departmentChat, setDepartmentChat] = useState<ChatRoom | null>(null);
  const [companyChat, setCompanyChat] = useState<ChatRoom | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllChats();
  }, []);

  const loadChatRooms = async () => {
    try {
      const rooms = await chatService.getUserChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      toast.error('Failed to load chat rooms');
    }
  };

  const loadDepartmentChat = async () => {
    try {
      const chat = await chatService.getDepartmentChat();
      setDepartmentChat(chat);
    } catch (error) {
      console.error('Error loading department chat:', error);
    }
  };

  const loadCompanyChat = async () => {
    try {
      const chat = await chatService.getCompanyChat();
      setCompanyChat(chat);
    } catch (error) {
      console.error('Error loading company chat:', error);
    }
  };

  const loadAllChats = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadChatRooms(),
        loadDepartmentChat(),
        loadCompanyChat(),
        loadUsers()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await userService.getAllUsers();
      setAllUsers(usersData);
      const filteredUsers = usersData.filter(user => user.id !== currentUserId);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/api/v1/users/for-tasks`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const usersData = await response.json();
          setAllUsers(usersData);
          const filteredUsers = usersData.filter((user: User) => user.id !== currentUserId);
          setUsers(filteredUsers);
        }
      } catch (fallbackError) {
        console.error('Fallback API call failed:', fallbackError);
        toast.error('Failed to load users');
      }
    }
  };

  const handleNewPrivateChat = async (userId: number) => {
    try {
      if (userId === currentUserId) {
        toast.error('Cannot create a chat with yourself');
        return;
      }
      
      const chatRoom = await chatService.getOrCreatePrivateChat(userId);
      onRoomSelect(chatRoom.id);
      setShowNewChatModal(false);
      setSearchQuery('');
      await loadAllChats();
    } catch (error) {
      console.error('Error creating private chat:', error);
      toast.error('Failed to create chat');
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.job_role && user.job_role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getPrivateChatName = (room: ChatRoom) => {
    if (room.type === 'private' && room.participants_ids) {
      const otherUserId = room.participants_ids.find(id => id !== currentUserId);
      const otherUser = allUsers.find(user => user.id === otherUserId);
      return otherUser ? otherUser.full_name : `Chat ${room.id}`;
    }
    return room.name || `Chat ${room.id}`;
  };

  const getPrivateChatInitial = (room: ChatRoom) => {
    if (room.type === 'private' && room.participants_ids) {
      const otherUserId = room.participants_ids.find(id => id !== currentUserId);
      const otherUser = allUsers.find(user => user.id === otherUserId);
      return otherUser ? otherUser.full_name.charAt(0).toUpperCase() : 'U';
    }
    return room.name ? room.name.charAt(0).toUpperCase() : 'U';
  };

  // Filter chats based on search
  const filteredChats = chatRooms.filter(room => {
    const chatName = getPrivateChatName(room).toLowerCase();
    const lastMessage = room.last_message?.text.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return chatName.includes(query) || lastMessage.includes(query);
  });

  if (loading) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <div className="text-gray-500 dark:text-gray-400">Loading chats...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="w-6 h-6 mr-3 text-primary" />
              Messages
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewChatModal(true)}
              className="p-2 bg-primary hover:bg-primary-700 text-white rounded-xl transition-colors shadow-sm"
              title="Start new chat"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search chats or people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-1">
            {/* Company Chat Section */}
            {(companyChat || departmentChat) && (
              <div className="mb-4">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  🏢 Company Chat
                </div>

                {companyChat && (
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onRoomSelect(companyChat.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      selectedRoomId === companyChat.id
                        ? 'bg-primary-50 dark:bg-blue-900/20 border-2 border-primary-200 dark:border-blue-700 shadow-sm'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-medium truncate ${
                            selectedRoomId === companyChat.id 
                              ? 'text-blue-900 dark:text-blue-100' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            Company Chat
                          </h3>
                          {companyChat.last_message && (
                            <span className={`text-xs flex-shrink-0 ml-2 ${
                              selectedRoomId === companyChat.id 
                                ? 'text-primary dark:text-blue-300' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {new Date(companyChat.last_message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        {companyChat.last_message ? (
                          <div className="flex items-center justify-between">
                            <p className={`text-sm truncate ${
                              selectedRoomId === companyChat.id 
                                ? 'text-blue-700 dark:text-blue-200' 
                                : 'text-gray-600 dark:text-gray-300'
                            }`}>
                              <span className="font-medium">
                                {companyChat.last_message.sender_full_name}:
                              </span>{' '}
                              {companyChat.last_message.text.substring(0, 50) + (companyChat.last_message.text.length > 50 ? '...' : '')}
                            </p>
                            {companyChat.unread_count > 0 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex-shrink-0 ml-2"
                              >
                                <div className="bg-green-500 text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                                  {companyChat.unread_count > 99 ? '99+' : companyChat.unread_count}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <p className={`text-sm italic ${
                            selectedRoomId === companyChat.id 
                              ? 'text-primary dark:text-blue-300' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            No messages yet
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                )}

                {departmentChat && (
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onRoomSelect(departmentChat.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      selectedRoomId === departmentChat.id
                        ? 'bg-primary-50 dark:bg-blue-900/20 border-2 border-primary-200 dark:border-blue-700 shadow-sm'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-sm">
                        <Users2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-medium truncate ${
                            selectedRoomId === departmentChat.id 
                              ? 'text-blue-900 dark:text-blue-100' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            Department Chat
                          </h3>
                          {departmentChat.last_message && (
                            <span className={`text-xs flex-shrink-0 ml-2 ${
                              selectedRoomId === departmentChat.id 
                                ? 'text-primary dark:text-blue-300' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {new Date(departmentChat.last_message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        {departmentChat.last_message ? (
                          <div className="flex items-center justify-between">
                            <p className={`text-sm truncate ${
                              selectedRoomId === departmentChat.id 
                                ? 'text-blue-700 dark:text-blue-200' 
                                : 'text-gray-600 dark:text-gray-300'
                            }`}>
                              <span className="font-medium">
                                {departmentChat.last_message.sender_full_name}:
                              </span>{' '}
                              {departmentChat.last_message.text.substring(0, 50) + (departmentChat.last_message.text.length > 50 ? '...' : '')}
                            </p>
                            {departmentChat.unread_count > 0 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex-shrink-0 ml-2"
                              >
                                <div className="bg-purple-500 text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                                  {departmentChat.unread_count > 99 ? '99+' : departmentChat.unread_count}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <p className={`text-sm italic ${
                            selectedRoomId === departmentChat.id 
                              ? 'text-primary dark:text-blue-300' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            No messages yet
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                )}
              </div>
            )}

            {/* Private Chats Section */}
            {filteredChats.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
                  👤 Private Chats
                  <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                    {filteredChats.length}
                  </span>
                </div>

                <AnimatePresence>
                  {filteredChats.map((room, index) => (
                    <motion.button
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onRoomSelect(room.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                        selectedRoomId === room.id
                          ? 'bg-primary-50 dark:bg-blue-900/20 border-2 border-primary-200 dark:border-blue-700 shadow-sm'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">
                            {getPrivateChatInitial(room)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-medium truncate ${
                              selectedRoomId === room.id 
                                ? 'text-blue-900 dark:text-blue-100' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {getPrivateChatName(room)}
                            </h3>
                            {room.last_message && (
                              <span className={`text-xs flex-shrink-0 ml-2 ${
                                selectedRoomId === room.id 
                                  ? 'text-primary dark:text-blue-300' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {new Date(room.last_message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          {room.last_message ? (
                            <div className="flex items-center justify-between">
                              <p className={`text-sm truncate ${
                                selectedRoomId === room.id 
                                  ? 'text-blue-700 dark:text-blue-200' 
                                  : 'text-gray-600 dark:text-gray-300'
                              }`}>
                                <span className="font-medium">
                                  {room.last_message.sender_full_name}:
                                </span>{' '}
                                {room.last_message.text.substring(0, 50) + (room.last_message.text.length > 50 ? '...' : '')}
                              </p>
                              {room.unread_count > 0 && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex-shrink-0 ml-2"
                                >
                                  <div className="bg-primary-500 text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                                    {room.unread_count > 99 ? '99+' : room.unread_count}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          ) : (
                            <p className={`text-sm italic ${
                              selectedRoomId === room.id 
                                ? 'text-primary dark:text-blue-300' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              No messages yet
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Empty State */}
            {!companyChat && !departmentChat && filteredChats.length === 0 && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 text-center text-gray-500 dark:text-gray-400"
              >
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <div className="text-lg font-medium mb-2">No conversations yet</div>
                <div className="text-sm mb-4">Start chatting with your colleagues</div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewChatModal(true)}
                  className="px-4 py-2 bg-primary hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                >
                  Start New Chat
                </motion.button>
              </motion.div>
            )}

            {/* No Search Results */}
            {searchQuery && filteredChats.length === 0 && (!companyChat && !departmentChat) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center text-gray-500 dark:text-gray-400"
              >
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <div className="font-medium mb-1">No results found</div>
                <div className="text-sm">Try searching with different keywords</div>
              </motion.div>
            )}
          </div>
        </div>

        {/* New Chat Button at Bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewChatModal(true)}
            className="w-full flex items-center justify-center px-4 py-3 gradient-primary hover:bg-primary-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Chat
          </motion.button>
        </div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowNewChatModal(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white">Start New Chat</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Choose someone to start chatting with
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNewChatModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xl">×</span>
                </motion.button>
              </div>

              {/* Search Bar */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto p-3">
                {filteredUsers.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 text-gray-500 dark:text-gray-400"
                  >
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <div className="text-lg font-medium mb-2">No users found</div>
                    <div className="text-sm">
                      {searchQuery ? 'Try searching with different keywords' : 'No colleagues available'}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user, index) => (
                      <motion.button
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNewPrivateChat(user.id)}
                        disabled={user.id === currentUserId}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                          user.id === currentUserId
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          {/* Avatar */}
                          <div className="flex-shrink-0 relative">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.full_name}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-700 shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">
                                {user.full_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            
                            {/* Online Status */}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                {user.full_name}
                                {user.id === currentUserId && (
                                  <span className="text-xs text-gray-500 ml-2">(You)</span>
                                )}
                              </h4>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                {user.job_role || 'Employee'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select a colleague to start a private conversation
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatSidebar;
