import { api } from './authService';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee_id?: number;
  assignee_name?: string;
  created_by: number;
  creator_name?: string;
  project_id?: number;
  project_name?: string;
  position?: number;
  due_date?: string;
  completed_at?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority: string;
  assignee_id?: number;
  project_id?: number;
  position?: number;
  due_date?: string;
  is_private: boolean;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee_id?: number;
  project_id?: number;
  position?: number;
  due_date?: string;
  is_private?: boolean;
}

export const taskService = {
  async getAllTasks(): Promise<Task[]> {
    const response = await api.get('/api/v1/tasks/');
    return response.data;
  },

  async getTask(taskId: number): Promise<Task> {
    const response = await api.get(`/api/v1/tasks/${taskId}`);
    return response.data;
  },

  async createTask(taskData: TaskCreate): Promise<Task> {
    const response = await api.post('/api/v1/tasks/', taskData);
    return response.data;
  },

  async updateTask(taskId: number, taskData: TaskUpdate): Promise<Task> {
    const response = await api.put(`/api/v1/tasks/${taskId}`, taskData);
    return response.data;
  },

  async deleteTask(taskId: number): Promise<void> {
    await api.delete(`/api/v1/tasks/${taskId}`);
  },
};

export default taskService;
