import { api } from './authService';

export interface Project {
  id: number;
  title: string;
  description?: string;
  created_by: number;
  created_at: string;
  creator_name?: string;
  task_count: number;
  completed_tasks: number;
  progress_percentage: number;
}

export interface ProjectWithTasks extends Project {
  tasks: Task[];
}

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

export interface ProjectCreate {
  title: string;
  description?: string;
}

export interface ProjectUpdate {
  title?: string;
  description?: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority: string;
  assignee_id?: number;
  due_date?: string;
  is_private: boolean;
}

export interface TaskReorderRequest {
  task_ids: number[];
}

export interface TaskAttachRequest {
  position?: number;
}

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    const response = await api.get('/api/v1/projects/');
    return response.data;
  },

  async getProject(projectId: number): Promise<ProjectWithTasks> {
    const response = await api.get(`/api/v1/projects/${projectId}`);
    return response.data;
  },

  async createProject(projectData: ProjectCreate): Promise<Project> {
    const response = await api.post('/api/v1/projects/', projectData);
    return response.data;
  },

  async updateProject(projectId: number, projectData: ProjectUpdate): Promise<Project> {
    const response = await api.patch(`/api/v1/projects/${projectId}`, projectData);
    return response.data;
  },

  // Project-Task Management
  async createTaskInProject(projectId: number, taskData: TaskCreate): Promise<Task> {
    const response = await api.post(`/api/v1/projects/${projectId}/tasks`, taskData);
    return response.data;
  },

  async attachTaskToProject(projectId: number, taskId: number, attachData?: TaskAttachRequest): Promise<Task> {
    const response = await api.post(`/api/v1/projects/${projectId}/tasks/${taskId}`, attachData || {});
    return response.data;
  },

  async reorderProjectTasks(projectId: number, reorderData: TaskReorderRequest): Promise<void> {
    await api.patch(`/api/v1/projects/${projectId}/tasks/reorder`, reorderData);
  },

  async detachTaskFromProject(projectId: number, taskId: number): Promise<void> {
    await api.delete(`/api/v1/projects/${projectId}/tasks/${taskId}`);
  },
};

export default projectService;
