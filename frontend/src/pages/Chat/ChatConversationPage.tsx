import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import ChatLayout from '../../components/chat/ChatLayout';
import toast from 'react-hot-toast';

const ChatConversationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (id && !isNaN(parseInt(id))) {
      setSelectedRoomId(parseInt(id));
    } else {
      setError('Invalid chat ID');
    }
  }, [id]);

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
    if (roomId === null) {
      // Navigate back to chat overview
      navigate('/chat');
    } else {
      // Navigate to the selected conversation
      navigate(`/chat/${roomId}`);
    }
  };

  const handleBackToChat = () => {
    navigate('/chat');
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
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <button
                    onClick={handleBackToChat}
                    className="p-2 mr-3 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-3xl lg:text-4xl font-medium flex items-center">
                    <MessageSquare className="w-8 h-8 mr-3" />
                    Conversation
                  </h1>
                </div>
                <p className="text-blue-100 text-lg">
                  Loading conversation...
                </p>
              </div>
            </div>
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
              Loading Conversation
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Please wait while we load your messages...
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !currentUserId || !selectedRoomId) {
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
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <button
                    onClick={handleBackToChat}
                    className="p-2 mr-3 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-3xl lg:text-4xl font-medium flex items-center">
                    <MessageSquare className="w-8 h-8 mr-3" />
                    Conversation
                  </h1>
                </div>
                <p className="text-blue-100 text-lg">
                  Unable to load conversation
                </p>
              </div>
            </div>
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
            Unable to load conversation
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-6">
            {error || 'The conversation you are trying to access could not be found.'}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleBackToChat}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
            >
              Back to Messages
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main conversation interface
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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToChat}
                  className="p-2 mr-3 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
                <h1 className="text-3xl lg:text-4xl font-medium flex items-center">
                  <MessageSquare className="w-8 h-8 mr-3" />
                  Conversation
                </h1>
              </div>
              <p className="text-blue-100 text-lg">
                Engage in real-time communication
              </p>
            </div>

            {/* Conversation ID Badge */}
            <div className="bg-white/20 px-4 py-2 rounded-xl">
              <span className="text-sm font-medium">Chat #{selectedRoomId}</span>
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

export default ChatConversationPage;
