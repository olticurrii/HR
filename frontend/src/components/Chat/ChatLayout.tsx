import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Menu, X } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import EmptyChatState from './EmptyChatState';
import { useAuth } from '../../contexts/AuthContext';

interface ChatLayoutProps {
  selectedRoomId: number | null;
  onRoomSelect: (roomId: number | null) => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ selectedRoomId, onRoomSelect }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserId] = useState<number>(user?.id || 0);

  const handleBackToList = () => {
    onRoomSelect(null);
    setIsSidebarOpen(false);
  };

  const handleRoomSelect = (roomId: number) => {
    onRoomSelect(roomId);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Desktop Sidebar - Always visible on desktop */}
      <div className="hidden lg:block">
        <ChatSidebar
          selectedRoomId={selectedRoomId}
          onRoomSelect={handleRoomSelect}
          currentUserId={currentUserId}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <div className="relative h-full">
                <ChatSidebar
                  selectedRoomId={selectedRoomId}
                  onRoomSelect={handleRoomSelect}
                  currentUserId={currentUserId}
                />
                
                {/* Mobile Close Button */}
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile Header - Only show when no room is selected or on mobile */}
        <div className="lg:hidden">
          {!selectedRoomId ? (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h1 className="text-xl font-medium text-gray-900 dark:text-white">Messages</h1>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <button
                onClick={handleBackToList}
                className="p-2 mr-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-medium text-gray-900 dark:text-white">Chat</h1>
            </div>
          )}
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedRoomId ? (
            <ChatWindow
              chatId={selectedRoomId}
              currentUserId={currentUserId}
              onBackToList={handleBackToList}
            />
          ) : (
            <EmptyChatState onNewChat={() => setIsSidebarOpen(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;