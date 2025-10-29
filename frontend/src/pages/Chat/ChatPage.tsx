import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ChatSidebar from '../../components/Chat/ChatSidebar';
import ChatRoom from '../../components/Chat/ChatRoom';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const ChatPage: React.FC = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      // Try to get user ID from localStorage first
      const storedUserId = localStorage.getItem('current_user_id');
      if (storedUserId) {
        setCurrentUserId(parseInt(storedUserId));
        setLoading(false);
        return;
      }

      // If not in localStorage, fetch from API
      console.log('Loading user from API...');
      const userData = await authService.getCurrentUser();
      console.log('User data loaded:', userData);
      
      setCurrentUserId(userData.id);
      localStorage.setItem('current_user_id', userData.id.toString());
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (roomId: number) => {
    setSelectedRoomId(roomId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <div className="text-gray-500">Loading chat...</div>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <div className="text-lg mb-2">Unable to load user data</div>
          <div className="text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm">
      <ChatSidebar
        selectedRoomId={selectedRoomId}
        onRoomSelect={handleRoomSelect}
        currentUserId={currentUserId}
      />
      <ChatRoom
        chatId={selectedRoomId}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default ChatPage;
