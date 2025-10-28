import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import chatService, { Message } from '../../services/chatService';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  chatId: number;
  currentUserId: number;
  onBackToList?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, currentUserId, onBackToList }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatId) {
      loadMessages();
      connectWebSocket();
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [chatId]);

  const loadMessages = async () => {
    if (!chatId) return;
    
    setLoading(true);
    try {
      const messagesData = await chatService.getChatMessages(chatId);
      setMessages(messagesData.reverse()); // Reverse to show oldest first
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (!chatId) return;

    const ws = chatService.createWebSocket(chatId);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          const newMessage: Message = {
            id: data.id || Date.now(),
            text: data.text,
            sender_id: data.sender_id,
            chat_id: data.chat_id,
            timestamp: data.timestamp,
            is_edited: 0,
            sender_full_name: data.sender_full_name,
            sender_avatar_url: data.sender_avatar_url,
          };
          
          setMessages(prev => [...prev, newMessage]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Connection error');
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || !socket || sending) return;

    setSending(true);
    try {
      const messageData = {
        type: 'message',
        text: newMessage.trim(),
      };

      socket.send(JSON.stringify(messageData));
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-neutral-dark/50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="text-lg font-medium mb-2">No messages yet</div>
              <div className="text-sm">Start the conversation!</div>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId;
            return (
              <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {message.sender_full_name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Message Content */}
                  <div className={`ml-3 ${isOwnMessage ? 'mr-3' : ''}`}>
                    <div className={`px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            rows={1}
            disabled={sending || !socket}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending || !socket}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;