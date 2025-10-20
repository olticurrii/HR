import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Search, Users, Building2, Users2 } from 'lucide-react';
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
  console.log('🚀 ChatSidebar component loaded - FORCE RELOAD TEST');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [departmentChat, setDepartmentChat] = useState<ChatRoom | null>(null);
  const [companyChat, setCompanyChat] = useState<ChatRoom | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // Store all users for name resolution
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
      console.log('All users loaded:', usersData);
      console.log('Current user ID:', currentUserId);
      
      // Store all users for name resolution
      setAllUsers(usersData);
      
      // Filter out current user for new chat modal
      const filteredUsers = usersData.filter(user => user.id !== currentUserId);
      console.log('Filtered users:', filteredUsers);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to direct API call
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
          console.log('Fallback users loaded:', usersData);
          
          // Store all users for name resolution
          setAllUsers(usersData);
          
          // Filter out current user for new chat modal
          const filteredUsers = usersData.filter((user: User) => user.id !== currentUserId);
          console.log('Fallback filtered users:', filteredUsers);
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
      console.log('Creating private chat with user:', userId, 'Current user:', currentUserId);
      
      // Prevent creating chat with self
      if (userId === currentUserId) {
        toast.error('Cannot create a chat with yourself');
        return;
      }
      
      const chatRoom = await chatService.getOrCreatePrivateChat(userId);
      onRoomSelect(chatRoom.id);
      setShowNewChatModal(false);
      setSearchQuery('');
      // Refresh all chats to show the new one immediately
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
      
      // FORCE BROWSER RELOAD - DEBUG: Clear logging for name resolution
      console.log(`🔍 DEBUG: Room ${room.id} - Participants: [${room.participants_ids.join(', ')}], Current User: ${currentUserId}, Other User ID: ${otherUserId}, Other User Name: ${otherUser?.full_name || 'NOT FOUND'}`);
      console.log(`🔍 DEBUG: All users: [${allUsers.map(u => `${u.id}:${u.full_name}`).join(', ')}]`);
      
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

  if (loading) {
    return (
      <div className="w-80 bg-gray-50 border-r flex items-center justify-center">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-80 bg-gray-50 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Chats
            </h2>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="Start new chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Rooms List */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 p-2">
            {/* Company Chat */}
            {companyChat && (
              <button
                onClick={() => onRoomSelect(companyChat.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedRoomId === companyChat.id
                    ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">Company Chat</div>
                    {companyChat.last_message && (
                      <div className="text-sm text-gray-500 truncate">
                        {companyChat.last_message.sender_full_name}: {companyChat.last_message.text}
                      </div>
                    )}
                  </div>
                  {companyChat.unread_count > 0 && (
                    <div className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {companyChat.unread_count}
                    </div>
                  )}
                </div>
              </button>
            )}

            {/* Department Chat */}
            {departmentChat && (
              <button
                onClick={() => onRoomSelect(departmentChat.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedRoomId === departmentChat.id
                    ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    <Users2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">Department Chat</div>
                    {departmentChat.last_message && (
                      <div className="text-sm text-gray-500 truncate">
                        {departmentChat.last_message.sender_full_name}: {departmentChat.last_message.text}
                      </div>
                    )}
                  </div>
                  {departmentChat.unread_count > 0 && (
                    <div className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {departmentChat.unread_count}
                    </div>
                  )}
                </div>
              </button>
            )}

            {/* Private Chats */}
            {chatRooms.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Private Chats
                </div>
                {chatRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => onRoomSelect(room.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedRoomId === room.id
                        ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {getPrivateChatInitial(room)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {getPrivateChatName(room)}
                        </div>
                        {room.last_message && (
                          <div className="text-sm text-gray-500 truncate">
                            {room.last_message.sender_full_name}: {room.last_message.text}
                          </div>
                        )}
                      </div>
                      {room.unread_count > 0 && (
                        <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {room.unread_count}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* No chats message */}
            {!companyChat && !departmentChat && chatRooms.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <div className="text-sm">No chats yet</div>
                <div className="text-xs text-gray-400 mt-1">Start a conversation!</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Start New Chat</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <div className="text-sm">No users found</div>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleNewPrivateChat(user.id)}
                    className="w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-800">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.job_role || 'Employee'}</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatSidebar;
