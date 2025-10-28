import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import ChatLayout from '../../components/chat/ChatLayout';
import toast from 'react-hot-toast';

const ModernChatPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      // Try to get user ID from auth context first
      if (user?.id) {
        setCurrentUserId(user.id);
        setLoading(false);
        return;
      }

      // Try localStorage as fallback
      const storedUserId = localStorage.getItem('current_user_id');
      if (storedUserId) {
        setCurrentUserId(parseInt(storedUserId));
        setLoading(false);
        return;
      }

      // If not available, fetch from API
      const userData = await authService.getCurrentUser();
      setCurrentUserId(userData.id);
      localStorage.setItem('current_user_id', userData.id.toString());
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (roomId: number | null) => {
    setSelectedRoomId(roomId);
  };

  const handleRetry = () => {
    setError(null);
    loadCurrentUser();
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl lg:text-4xl font-medium mb-2 flex items-center">
              <MessageSquare className="w-8 h-8 mr-3" />
              Messages
            </h1>
            <p className="text-blue-100 text-lg">
              Connect and collaborate with your team
            </p>
          </div>
        </motion.div>

        {/* Loading Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <div className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Loading Messages
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Setting up your chat experience...
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !currentUserId) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl lg:text-4xl font-medium mb-2 flex items-center">
              <MessageSquare className="w-8 h-8 mr-3" />
              Messages
            </h1>
            <p className="text-blue-100 text-lg">
              Connect and collaborate with your team
            </p>
          </div>
        </motion.div>

        {/* Error State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-red-900 dark:text-red-100 mb-2">
            Unable to load chat
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-6">
            {error || 'Unable to load user data. Please try refreshing the page.'}
          </p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // Main chat interface
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-medium mb-2 flex items-center">
                <MessageSquare className="w-8 h-8 mr-3" />
                Messages
              </h1>
              <p className="text-blue-100 text-lg">
                Connect and collaborate with your team in real-time
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-medium">💬</div>
                <div className="text-xs text-blue-100">Chat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium">👥</div>
                <div className="text-xs text-blue-100">Teams</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium">⚡</div>
                <div className="text-xs text-blue-100">Real-time</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ChatLayout
          selectedRoomId={selectedRoomId}
          onRoomSelect={handleRoomSelect}
        />
      </motion.div>
    </div>
  );
};

export default ModernChatPage;
