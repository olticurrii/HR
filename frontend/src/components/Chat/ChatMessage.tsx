import React from 'react';
import API_BASE_URL from '../../config';

interface ChatMessageProps {
  message: {
    id: number;
    text: string;
    sender_id: number;
    timestamp: string;
    sender_full_name: string;
    sender_avatar_url?: string;
    is_edited: number;
    edited_at?: string;
  };
  currentUserId: number;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUserId }) => {
  const isOwnMessage = message.sender_id === currentUserId;
  const avatarUrl = message.sender_avatar_url 
    ? (message.sender_avatar_url.startsWith('http') 
        ? message.sender_avatar_url 
        : `${API_BASE_URL}${message.sender_avatar_url}`)
    : null;
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={message.sender_full_name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {message.sender_full_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        {/* Message Content */}
        <div className={`ml-3 ${isOwnMessage ? 'mr-3' : ''}`}>
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwnMessage
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            <p className="text-sm">{message.text}</p>
            {message.is_edited && (
              <p className="text-xs opacity-75 mt-1">
                (edited)
              </p>
            )}
          </div>
          <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
