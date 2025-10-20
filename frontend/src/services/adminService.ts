import axios from 'axios';
import API_BASE_URL from '../config';

const ADMIN_API_URL = `${API_BASE_URL}/api/v1/admin`;

interface User {
  id: number;
  email: string;
  full_name: string;
  job_role?: string;
  department_id?: number;
  role: string; // System role
  custom_roles?: string[]; // Custom roles
  is_active: boolean;
  is_admin: boolean;
}

interface CreateUserData {
  email: string;
  full_name: string;
  password: string;
  role: string; // System role
  custom_roles?: string[]; // Custom roles
  job_role?: string;
  department_id?: number;
  phone?: string;
}

interface UpdateUserData {
  full_name?: string;
  job_role?: string;
  department_id?: number;
  role?: string; // System role
  custom_roles?: string[]; // Custom roles
  is_active?: boolean;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const adminService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await axios.get(`${ADMIN_API_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: number): Promise<User> => {
    const response = await axios.get(`${ADMIN_API_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Create user
  createUser: async (userData: CreateUserData): Promise<User> => {
    const response = await axios.post(`${ADMIN_API_URL}/users`, userData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Update user
  updateUser: async (userId: number, userData: UpdateUserData): Promise<User> => {
    const response = await axios.put(`${ADMIN_API_URL}/users/${userId}`, userData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId: number, role: string): Promise<User> => {
    const response = await axios.patch(
      `${ADMIN_API_URL}/users/${userId}/role`,
      { role },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: number): Promise<void> => {
    await axios.delete(`${ADMIN_API_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
  },

  // Get available system roles
  getAvailableRoles: async (): Promise<any> => {
    const response = await axios.get(`${ADMIN_API_URL}/role-options`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get available custom roles
  getCustomRoles: async (): Promise<any> => {
    const response = await axios.get(`${ADMIN_API_URL}/custom-roles`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

