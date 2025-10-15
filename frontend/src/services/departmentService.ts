import { api } from './authService';

export interface Department {
  id: number;
  name: string;
  description?: string;
  manager_id?: number;
  parent_department_id?: number;
  created_at: string;
  updated_at: string;
  employee_count?: number;
}

export interface DepartmentCreate {
  name: string;
  description?: string;
  manager_id?: number;
  parent_department_id?: number;
}

export interface DepartmentUpdate {
  name?: string;
  description?: string;
  manager_id?: number;
  parent_department_id?: number;
}

export const departmentService = {
  async getAllDepartments(): Promise<Department[]> {
    const response = await api.get('/api/v1/departments/');
    return response.data;
  },

  async getDepartment(id: number): Promise<Department> {
    const response = await api.get(`/api/v1/departments/${id}`);
    return response.data;
  },

  async createDepartment(department: DepartmentCreate): Promise<Department> {
    const response = await api.post('/api/v1/departments/', department);
    return response.data;
  },

  async updateDepartment(id: number, department: DepartmentUpdate): Promise<Department> {
    const response = await api.patch(`/api/v1/departments/${id}`, department);
    return response.data;
  },

  async deleteDepartment(id: number): Promise<void> {
    await api.delete(`/api/v1/departments/${id}`);
  },
};

export default departmentService;
