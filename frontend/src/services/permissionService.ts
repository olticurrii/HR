import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1/admin';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export interface RolePermission {
  id: number;
  role: string;
  resource: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionUpdate {
  can_view?: boolean;
  can_create?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
}

export interface PermissionCheckRequest {
  resource: string;
  action: string;
}

export interface PermissionCheckResponse {
  has_permission: boolean;
  role: string;
  resource: string;
  action: string;
}

export const permissionService = {
  // Get all permissions
  getAllPermissions: async (role?: string): Promise<RolePermission[]> => {
    const params = role ? { role } : {};
    const response = await axios.get(`${API_BASE_URL}/permissions`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get available roles
  getAvailableRoles: async (): Promise<string[]> => {
    const response = await axios.get(`${API_BASE_URL}/permissions/roles`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get available resources
  getAvailableResources: async (): Promise<string[]> => {
    const response = await axios.get(`${API_BASE_URL}/permissions/resources`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get specific permission
  getPermission: async (role: string, resource: string): Promise<RolePermission> => {
    const response = await axios.get(`${API_BASE_URL}/permissions/${role}/${resource}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Update permission
  updatePermission: async (
    role: string,
    resource: string,
    update: PermissionUpdate
  ): Promise<RolePermission> => {
    const response = await axios.patch(`${API_BASE_URL}/permissions/${role}/${resource}`, update, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Check if current user has permission
  checkPermission: async (request: PermissionCheckRequest): Promise<PermissionCheckResponse> => {
    const response = await axios.post(`${API_BASE_URL}/permissions/check`, request, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Bulk update permissions
  bulkUpdatePermissions: async (updates: any[]): Promise<{ message: string; updated_count: number }> => {
    const response = await axios.post(`${API_BASE_URL}/permissions/bulk-update`, updates, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

