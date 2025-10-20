import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1/leave';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export interface LeaveType {
  id: number;
  name: string;
  description?: string;
  default_days_per_year: number;
  requires_approval: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  id: number;
  user_id: number;
  leave_type_id: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  year: number;
  leave_type_name?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalanceSummary {
  leave_balances: LeaveBalance[];
  total_allocated: number;
  total_used: number;
  total_remaining: number;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  user_name: string;
  leave_type_id: number;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  status: string;
  reviewed_by?: number;
  reviewer_name?: string;
  reviewed_at?: string;
  review_comments?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeaveRequest {
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface ReviewLeaveRequest {
  status: 'approved' | 'rejected';
  review_comments?: string;
}

export interface LeaveSummary {
  total_leave_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  total_days_taken: number;
}

export const leaveService = {
  // Leave Types
  getLeaveTypes: async (): Promise<LeaveType[]> => {
    const response = await axios.get(`${API_BASE_URL}/types`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Leave Balances
  getMyLeaveBalances: async (year?: number): Promise<LeaveBalanceSummary> => {
    const params = year ? { year } : {};
    const response = await axios.get(`${API_BASE_URL}/balances`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getUserLeaveBalances: async (userId: number, year?: number): Promise<LeaveBalanceSummary> => {
    const params = year ? { year } : {};
    const response = await axios.get(`${API_BASE_URL}/balances/${userId}`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  updateLeaveBalance: async (balanceId: number, totalDays: number): Promise<LeaveBalance> => {
    const response = await axios.put(
      `${API_BASE_URL}/balances/${balanceId}`,
      { total_days: totalDays },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Leave Requests
  createLeaveRequest: async (request: CreateLeaveRequest): Promise<LeaveRequest> => {
    const response = await axios.post(`${API_BASE_URL}/requests`, request, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getMyLeaveRequests: async (statusFilter?: string): Promise<LeaveRequest[]> => {
    const params = statusFilter ? { status_filter: statusFilter } : {};
    const response = await axios.get(`${API_BASE_URL}/requests`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getAllLeaveRequests: async (statusFilter?: string, userId?: number): Promise<LeaveRequest[]> => {
    const params: any = {};
    if (statusFilter) params.status_filter = statusFilter;
    if (userId) params.user_id = userId;
    
    const response = await axios.get(`${API_BASE_URL}/requests/all`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  reviewLeaveRequest: async (requestId: number, review: ReviewLeaveRequest): Promise<LeaveRequest> => {
    const response = await axios.patch(
      `${API_BASE_URL}/requests/${requestId}/review`,
      review,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  cancelLeaveRequest: async (requestId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/requests/${requestId}`, {
      headers: getAuthHeaders(),
    });
  },

  // Summary
  getLeaveSummary: async (): Promise<LeaveSummary> => {
    const response = await axios.get(`${API_BASE_URL}/summary`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

