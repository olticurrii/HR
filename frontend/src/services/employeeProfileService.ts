import { api } from './authService';

// Types
export interface ProfileHeader {
  id: number;
  full_name: string;
  email: string;
  job_role?: string;
  avatar_url?: string;
  phone?: string;
  department_id?: number;
  department_name?: string;
  manager_id?: number;
  manager_name?: string;
  hire_date?: string;
  is_active: boolean;
}

export interface PersonalInfo {
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
}

export interface JobInfo {
  job_role?: string;
  hire_date?: string;
  manager_id?: number;
  manager_name?: string;
  department_id?: number;
  department_name?: string;
}

export interface KeyResult {
  id: number;
  objective_id: number;
  title: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  weight: number;
  status: 'open' | 'in_progress' | 'done';
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Objective {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  status: 'active' | 'closed' | 'archived';
  start_date?: string;
  due_date?: string;
  progress: number;
  created_at: string;
  updated_at: string;
  key_results: KeyResult[];
}

export interface ReviewQuestion {
  question: string;
  rating?: number;
  comment?: string;
  reviewer_name: string;
}

export interface ReviewsByType {
  reviewer_type: 'manager' | 'self' | 'peer';
  questions_and_answers: ReviewQuestion[];
}

export interface CompetencyRadarData {
  competency_id: number;
  competency_name: string;
  self_score?: number;
  manager_score?: number;
  peer_score?: number;
}

export interface WorkflowItem {
  id: number;
  type: 'task' | 'project';
  title: string;
  status: string;
  due_date?: string;
}

export interface Neighbors {
  prev_user_id?: number;
  next_user_id?: number;
}

// API Service
export const employeeProfileService = {
  // Profile Header
  async getProfileHeader(userId: number): Promise<ProfileHeader> {
    const response = await api.get(`/api/v1/employees/${userId}/profile_header`);
    return response.data;
  },

  async getNeighbors(userId: number): Promise<Neighbors> {
    const response = await api.get(`/api/v1/employees/${userId}/neighbors`);
    return response.data;
  },

  // Personal Tab
  async getPersonalInfo(userId: number): Promise<PersonalInfo> {
    const response = await api.get(`/api/v1/employees/${userId}/personal`);
    return response.data;
  },

  async updatePersonalInfo(userId: number, data: Partial<PersonalInfo>): Promise<PersonalInfo> {
    const response = await api.patch(`/api/v1/employees/${userId}/personal`, data);
    return response.data;
  },

  // Job Tab
  async getJobInfo(userId: number): Promise<JobInfo> {
    const response = await api.get(`/api/v1/employees/${userId}/job`);
    return response.data;
  },

  // Objectives & KRs
  async getObjectives(userId: number, status?: string): Promise<Objective[]> {
    const params = status ? { status } : {};
    const response = await api.get(`/api/v1/employees/${userId}/objectives`, { params });
    return response.data;
  },

  async createObjective(data: {
    user_id: number;
    title: string;
    description?: string;
    start_date?: string;
    due_date?: string;
  }): Promise<Objective> {
    const response = await api.post('/api/v1/employees/objectives', data);
    return response.data;
  },

  async updateObjective(objectiveId: number, data: Partial<Objective>): Promise<Objective> {
    const response = await api.patch(`/api/v1/employees/objectives/${objectiveId}`, data);
    return response.data;
  },

  async createKeyResult(data: {
    objective_id: number;
    title: string;
    target_value?: number;
    current_value?: number;
    unit?: string;
  }): Promise<KeyResult> {
    const response = await api.post('/api/v1/employees/key_results', data);
    return response.data;
  },

  async updateKeyResult(krId: number, data: Partial<KeyResult>): Promise<KeyResult> {
    const response = await api.patch(`/api/v1/employees/key_results/${krId}`, data);
    return response.data;
  },

  // Reviews
  async getReviews(userId: number, cycleId?: number): Promise<ReviewsByType[]> {
    const params = cycleId ? { cycle_id: cycleId } : {};
    const response = await api.get(`/api/v1/employees/${userId}/reviews`, { params });
    return response.data;
  },

  async submitReview(data: {
    cycle_id: number;
    reviewee_id: number;
    reviewer_type: 'manager' | 'self' | 'peer';
    answers: Array<{ question_id: number; rating?: number; comment?: string }>;
  }): Promise<void> {
    await api.post('/api/v1/employees/reviews/submit', data);
  },

  // Competencies
  async getCompetencies(userId: number, cycleId?: number): Promise<CompetencyRadarData[]> {
    const params = cycleId ? { cycle_id: cycleId } : {};
    const response = await api.get(`/api/v1/employees/${userId}/competencies`, { params });
    return response.data;
  },

  // Workflows
  async getWorkflows(userId: number): Promise<WorkflowItem[]> {
    const response = await api.get(`/api/v1/employees/${userId}/workflows`);
    return response.data;
  },

  // Performance Metrics (auto-calculated from tasks)
  async getPerformanceMetrics(userId: number, days: number = 30): Promise<any> {
    const response = await api.get(`/api/v1/employees/${userId}/performance_metrics`, {
      params: { days }
    });
    return response.data;
  },

  async linkTaskToObjective(userId: number, taskId: number, objectiveId: number): Promise<void> {
    await api.post(`/api/v1/employees/${userId}/link_task_to_objective`, {
      task_id: taskId,
      objective_id: objectiveId
    });
  },
};

