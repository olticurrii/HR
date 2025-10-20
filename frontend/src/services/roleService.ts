import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1/admin';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export interface CustomRole {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRoleData {
  name: string;
  display_name: string;
  description?: string;
}

export interface UpdateRoleData {
  display_name?: string;
  description?: string;
}

export interface RoleAssignment {
  user_id: number;
  role_name: string;
}

export const roleService = {
  // Get all roles
  getAllRoles: async (): Promise<CustomRole[]> => {
    const response = await axios.get(`${API_BASE_URL}/roles`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get role by ID
  getRoleById: async (roleId: number): Promise<CustomRole> => {
    const response = await axios.get(`${API_BASE_URL}/roles/${roleId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Create role
  createRole: async (roleData: CreateRoleData): Promise<CustomRole> => {
    const response = await axios.post(`${API_BASE_URL}/roles`, roleData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Update role
  updateRole: async (roleId: number, roleData: UpdateRoleData): Promise<CustomRole> => {
    const response = await axios.put(`${API_BASE_URL}/roles/${roleId}`, roleData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Delete role
  deleteRole: async (roleId: number): Promise<{ message: string }> => {
    const response = await axios.delete(`${API_BASE_URL}/roles/${roleId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Assign role to user
  assignRole: async (assignment: RoleAssignment): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/roles/assign`, assignment, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get users by role
  getUsersByRole: async (roleName: string): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/roles/${roleName}/users`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

