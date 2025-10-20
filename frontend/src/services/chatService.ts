import axios from 'axios';
import API_BASE_URL from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Message {
  id: number;
  text: string;
  sender_id: number;
  chat_id: number;
  timestamp: string;
  is_edited: number;
  edited_at?: string;
  sender_full_name: string;
  sender_avatar_url?: string;
}

export interface ChatRoom {
  id: number;
  name?: string;
  type: string;
  department_id?: number;
  participants_ids: number[];
  last_message?: Message;
  unread_count: number;
}

export interface ChatRoomWithMessages extends ChatRoom {
  messages: Message[];
}

export const chatService = {
  async getUserChatRooms(): Promise<ChatRoom[]> {
    const response = await api.get('/api/v1/chat/rooms');
    return response.data;
  },

  async getChatMessages(chatId: number): Promise<Message[]> {
    const response = await api.get(`/api/v1/chat/${chatId}/messages`);
    return response.data;
  },

  async getOrCreatePrivateChat(userId: number): Promise<ChatRoom> {
    const response = await api.get(`/api/v1/chat/private/${userId}`);
    return response.data;
  },

  async getDepartmentChat(): Promise<ChatRoom> {
    const response = await api.get('/api/v1/chat/department');
    return response.data;
  },

  async getCompanyChat(): Promise<ChatRoom> {
    const response = await api.get('/api/v1/chat/company');
    return response.data;
  },

  async createMessage(chatId: number, text: string): Promise<Message> {
    const response = await api.post(`/api/v1/chat/${chatId}/messages`, { text });
    return response.data;
  },

  createWebSocket(roomId: number): WebSocket {
    const token = localStorage.getItem('access_token');
    const wsUrl = API_BASE_URL.replace('http', 'ws') + `/api/v1/chat/ws/${roomId}?token=${token}`;
    return new WebSocket(wsUrl);
  },
};

export default chatService;
