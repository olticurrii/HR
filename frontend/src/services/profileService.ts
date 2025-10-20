import { api } from './authService';

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  department_id?: number;
  department_name?: string;
  job_role?: string;
  avatar_url?: string;
  role: string;
  timezone?: string;
  locale?: string;
  theme?: string;
  email_notifications?: boolean;
}

export interface ProfileUpdate {
  full_name?: string;
  phone?: string;
  job_role?: string;
  avatar_url?: string;
  timezone?: string;
  locale?: string;
  theme?: string;
  email_notifications?: boolean;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface UserSession {
  id: number;
  device_info?: string;
  ip_address?: string;
  created_at: string;
  last_seen: string;
  is_current: boolean;
}

export interface SessionRevokePayload {
  session_id?: number;
  revoke_all?: boolean;
}

export interface Goal {
  id: number;
  title: string;
  status: string;
  progress: number;
  due_date?: string;
}

export interface KPI {
  name: string;
  value: number;
  unit?: string;
  delta?: number;
}

export interface Review {
  date: string;
  reviewer?: {
    id: number;
    full_name: string;
  };
  rating?: number;
  comment?: string;
}

export interface PerformanceSummary {
  goals: Goal[];
  kpis: KPI[];
  last_review?: Review;
  trend: Array<{ date: string; score: number }>;
}

class ProfileService {
  async getMyProfile(): Promise<UserProfile> {
    const response = await api.get('/api/v1/me');
    return response.data;
  }

  async updateMyProfile(data: ProfileUpdate): Promise<UserProfile> {
    const response = await api.patch('/api/v1/me', data);
    return response.data;
  }

  async uploadAvatar(file: File): Promise<{ avatar_url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/v1/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async changePassword(data: ChangePasswordPayload): Promise<{ message: string }> {
    const response = await api.post('/api/v1/me/change-password', data);
    return response.data;
  }

  async getMySessions(): Promise<UserSession[]> {
    const response = await api.get('/api/v1/me/sessions');
    return response.data;
  }

  async revokeSessions(data: SessionRevokePayload): Promise<{ message: string }> {
    const response = await api.post('/api/v1/me/sessions/revoke', data);
    return response.data;
  }

  async toggle2FA(): Promise<{ enabled: boolean; message: string }> {
    const response = await api.post('/api/v1/me/2fa/toggle', {});
    return response.data;
  }

  async getPerformanceSummary(windowDays: number = 180): Promise<PerformanceSummary> {
    const response = await api.get('/api/v1/me/performance/summary', {
      params: { window_days: windowDays },
    });
    return response.data;
  }
}

export default new ProfileService();

