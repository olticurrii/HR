import axios from 'axios';
import API_BASE_URL from '../config';

const TIME_API_URL = `${API_BASE_URL}/api/v1/time`;

export interface TimeEntry {
  id: number;
  user_id: number;
  clock_in: string;
  clock_out: string | null;
  break_start: string | null;
  break_end: string | null;
  is_terrain: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeTrackingStatus {
  is_clocked_in: boolean;
  is_on_break: boolean;
  is_terrain: boolean;
  current_entry: TimeEntry | null;
  current_duration_minutes: number | null;
}

export interface ActiveUser {
  id: number;
  full_name: string;
  email: string;
  department_name: string | null;
  clock_in: string;
  is_on_break: boolean;
  is_terrain: boolean;
  current_duration_minutes: number;
}

export interface NotClockedInUser {
  id: number;
  full_name: string;
  email: string;
  department_name: string | null;
}

export interface UserWithStatus {
  id: number;
  full_name: string;
  email: string;
  department_name: string | null;
  job_role: string | null;
  is_clocked_in: boolean;
  is_on_break: boolean;
  is_terrain: boolean;
  clock_in: string | null;
  current_duration_minutes: number | null;
}

export interface TimeEntryRecord {
  id: number;
  user_id: number;
  user_name: string;
  department_name: string | null;
  clock_in: string;
  clock_out: string | null;
  break_start: string | null;
  break_end: string | null;
  is_terrain: boolean;
  total_worked_hours: number | null;
  break_duration_minutes: number | null;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const timeTrackingService = {
  // Clock in
  clockIn: async (isTerrain: boolean = false): Promise<TimeEntry> => {
    const response = await axios.post(
      `${TIME_API_URL}/clock-in`,
      null,
      {
        params: { is_terrain: isTerrain },
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  },

  // Clock out
  clockOut: async (workSummary?: string): Promise<TimeEntry> => {
    const params = new URLSearchParams();
    if (workSummary) {
      params.append('work_summary', workSummary);
    }
    
    const response = await axios.post(
      `${TIME_API_URL}/clock-out?${params.toString()}`,
      null,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Start break
  startBreak: async (): Promise<TimeEntry> => {
    const response = await axios.post(
      `${TIME_API_URL}/start-break`,
      null,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // End break
  endBreak: async (): Promise<TimeEntry> => {
    const response = await axios.post(
      `${TIME_API_URL}/end-break`,
      null,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Toggle terrain work
  toggleTerrain: async (): Promise<TimeEntry> => {
    const response = await axios.post(
      `${TIME_API_URL}/terrain`,
      null,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Get current status
  getStatus: async (): Promise<TimeTrackingStatus> => {
    const response = await axios.get(`${TIME_API_URL}/status`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get active users (admin)
  getActiveUsers: async (): Promise<ActiveUser[]> => {
    const response = await axios.get(`${TIME_API_URL}/active`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get users who haven't clocked in (admin)
  getNotClockedInUsers: async (): Promise<NotClockedInUser[]> => {
    const response = await axios.get(`${TIME_API_URL}/not-clocked-in`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get all users with their time tracking status (admin)
  getAllUsersWithStatus: async (): Promise<UserWithStatus[]> => {
    const response = await axios.get(`${TIME_API_URL}/all-users-status`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get time records (admin)
  getTimeRecords: async (params: {
    start_date?: string;
    end_date?: string;
    user_id?: number;
    department_id?: number;
    is_terrain?: boolean;
  }): Promise<TimeEntryRecord[]> => {
    const response = await axios.get(`${TIME_API_URL}/records`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Export to CSV (admin)
  exportToCSV: async (params: {
    start_date?: string;
    end_date?: string;
    user_id?: number;
    department_id?: number;
    is_terrain?: boolean;
  }): Promise<void> => {
    const response = await axios.get(`${TIME_API_URL}/export`, {
      params,
      headers: getAuthHeaders(),
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `time_tracking_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

