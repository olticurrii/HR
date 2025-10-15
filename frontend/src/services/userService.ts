import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
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

export interface User {
  id: number;
  email: string;
  full_name: string;
  job_role?: string;
  role?: string; // Added role property
  department_id?: number;
  is_admin: boolean;
  avatar_url?: string;
  phone?: string;
  hire_date: string;
  created_at: string;
  updated_at: string;
  department_name?: string;
}

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/api/v1/users/for-tasks');
    return response.data;
  },

  async getUser(userId: number): Promise<User> {
    const response = await api.get(`/api/v1/users/${userId}`);
    return response.data;
  },

  async createUser(userData: Partial<User>): Promise<User> {
    const response = await api.post('/api/v1/users/', userData);
    return response.data;
  },

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    const response = await api.put(`/api/v1/users/${userId}`, userData);
    return response.data;
  },

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/api/v1/users/${userId}`);
  },
};
