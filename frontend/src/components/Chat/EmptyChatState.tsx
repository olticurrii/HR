import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Plus } from 'lucide-react';

interface EmptyChatStateProps {
  onNewChat: () => void;
}

const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onNewChat }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-md mx-auto"
      >
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="text-3xl font-medium text-gray-900 dark:text-white mb-4">
            💬 Welcome to Chat
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            No conversation selected
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Choose a conversation from the sidebar to start messaging, or create a new chat to connect with your colleagues.
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewChat}
            className="w-full sm:w-auto px-8 py-4 gradient-primary hover:bg-primary-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start New Chat
          </motion.button>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            or select an existing conversation to continue
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmptyChatState;