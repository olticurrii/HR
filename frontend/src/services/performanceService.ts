import { api } from './authService';

// Interfaces
export interface Goal {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  status: 'active' | 'closed' | 'archived';
  start_date?: string;
  due_date?: string;
  progress: number;
  created_by_id?: number;
  approved_by_id?: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_date?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  key_results: KeyResult[];
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

export interface KpiSnapshot {
  id: number;
  user_id: number;
  kpi_name: string;
  value: number;
  unit?: string;
  snapshot_date: string;
  notes?: string;
  period?: string;
  visibility?: string;
  measured_by_id?: number;
}

export interface KpiTrend {
  kpi_name: string;
  data_points: Array<{ date: string; value: number }>;
  unit?: string;
  current_value?: number;
  trend_direction?: 'up' | 'down' | 'stable';
}

export interface TopPerformerBadge {
  has_badge: boolean;
  score?: number;
  threshold: number;
  rank?: number;
  percentile?: number;
}

export interface MonthlyReport {
  report_period: {
    start: string;
    end: string;
  };
  summary: {
    total_objectives: number;
    active_objectives: number;
    average_progress: number;
    goals_created_last_month: number;
    pending_approvals: number;
    top_performers_count: number;
    top_performer_threshold: number;
  };
  generated_at: string;
}

export interface PeerReview {
  cycle_id: number;
  reviewee_id: number;
  reviewer_type: 'manager' | 'self' | 'peer';
  answers: Array<{
    question_id: number;
    rating?: number;
    comment?: string;
  }>;
  is_anonymous_peer: boolean;
}

export const performanceService = {
  // Goals/Objectives
  createGoal: async (data: {
    user_id: number;
    title: string;
    description?: string;
    status?: string;
    start_date?: string;
    due_date?: string;
    request_approval?: boolean;
  }): Promise<Goal> => {
    const response = await api.post('/api/v1/performance/objectives', data);
    return response.data;
  },

  getGoals: async (params?: {
    user_id?: number;
    status_filter?: string;
    approval_status?: string;
  }): Promise<Goal[]> => {
    const response = await api.get('/api/v1/performance/objectives', { params });
    return response.data;
  },

  getPendingApprovals: async (): Promise<Goal[]> => {
    const response = await api.get('/api/v1/performance/objectives/pending-approval');
    return response.data;
  },

  approveGoal: async (goalId: number): Promise<void> => {
    await api.post('/api/v1/performance/objectives/approve', {
      goal_id: goalId,
      action: 'approve'
    });
  },

  rejectGoal: async (goalId: number, reason?: string): Promise<void> => {
    await api.post('/api/v1/performance/objectives/approve', {
      goal_id: goalId,
      action: 'reject',
      rejection_reason: reason
    });
  },

  updateGoal: async (goalId: number, data: {
    title?: string;
    description?: string;
    status?: string;
    progress?: number;
    start_date?: string;
    due_date?: string;
  }): Promise<Goal> => {
    const response = await api.put(`/api/v1/performance/objectives/${goalId}`, data);
    return response.data;
  },

  deleteGoal: async (goalId: number): Promise<void> => {
    await api.delete(`/api/v1/performance/objectives/${goalId}`);
  },

  // KPI Snapshots
  createKpiSnapshot: async (data: {
    user_id: number;
    kpi_name: string;
    value: number;
    unit?: string;
    notes?: string;
    snapshot_date?: string;
    period?: string;
    visibility?: string;
    measured_by_id?: number;
  }): Promise<KpiSnapshot> => {
    const response = await api.post('/api/v1/performance/kpi-snapshots', data);
    return response.data;
  },

  getKpiTrends: async (userId: number, days: number = 90): Promise<KpiTrend[]> => {
    const response = await api.get('/api/v1/performance/kpi-snapshots/trends', {
      params: { user_id: userId, days }
    });
    return response.data;
  },

  getAutoCalculatedKpis: async (userId: number, days: number = 30): Promise<any> => {
    const response = await api.get(`/api/v1/performance/kpi-snapshots/auto-calculate/${userId}`, {
      params: { days }
    });
    return response.data;
  },

  // Peer Reviews
  submitPeerReview: async (data: PeerReview): Promise<void> => {
    await api.post('/api/v1/performance/peer-review', data);
  },

  // Top Performer Badge
  getTopPerformerBadge: async (userId: number): Promise<TopPerformerBadge> => {
    const response = await api.get(`/api/v1/performance/top-performer-badge/${userId}`);
    return response.data;
  },

  // Monthly Report
  getMonthlyReport: async (): Promise<MonthlyReport> => {
    const response = await api.get('/api/v1/performance/monthly-report');
    return response.data;
  },
};

