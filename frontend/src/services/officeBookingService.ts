/**
 * Office Booking & Meeting Scheduler Service
 * Handles all API calls for office management and meeting bookings
 */
import axios from 'axios';
import API_BASE_URL from '../config';

const OFFICE_API_URL = `${API_BASE_URL}/api/v1/office-booking`;

// ==================== Interfaces ====================

export interface Office {
  id: number;
  name: string;
  location: string | null;
  floor: string | null;
  capacity: number;
  description: string | null;
  amenities: string[] | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  current_booking?: {
    id: number;
    title: string;
    end_time: string;
  } | null;
}

export interface MeetingBooking {
  id: number;
  office_id: number;
  title: string;
  description: string | null;
  organizer_id: number;
  organizer_name: string;
  office_name: string;
  start_time: string;
  end_time: string;
  participant_ids: number[];
  participant_names: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface MeetingParticipant {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export interface MeetingDetails {
  id: number;
  title: string;
  description: string | null;
  office: Office;
  organizer: MeetingParticipant;
  participants: MeetingParticipant[];
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BookingSummary {
  total_offices: number;
  available_offices: number;
  booked_offices: number;
  total_bookings: number;
  upcoming_bookings: number;
  ongoing_bookings: number;
  completed_bookings: number;
  my_upcoming_meetings: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  office_name: string;
  organizer_name: string;
  start_time: string;
  end_time: string;
  status: string;
  participant_count: number;
  is_organizer: boolean;
  is_participant: boolean;
}

export interface OfficeAvailability {
  office_id: number;
  office_name: string;
  is_available: boolean;
  current_booking: {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
  } | null;
  next_available: string | null;
}

// ==================== API Functions ====================

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const officeBookingService = {
  // ========== Office Management ==========
  
  getAllOffices: async (includeInactive: boolean = false): Promise<Office[]> => {
    const response = await axios.get(`${OFFICE_API_URL}/offices`, {
      params: { include_inactive: includeInactive },
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getOffice: async (officeId: number): Promise<Office> => {
    const response = await axios.get(`${OFFICE_API_URL}/offices/${officeId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  createOffice: async (officeData: Partial<Office>): Promise<Office> => {
    const response = await axios.post(`${OFFICE_API_URL}/offices`, officeData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  updateOffice: async (officeId: number, officeData: Partial<Office>): Promise<Office> => {
    const response = await axios.put(`${OFFICE_API_URL}/offices/${officeId}`, officeData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  deleteOffice: async (officeId: number): Promise<void> => {
    await axios.delete(`${OFFICE_API_URL}/offices/${officeId}`, {
      headers: getAuthHeaders(),
    });
  },

  checkAvailability: async (
    officeId: number,
    startTime: string,
    endTime: string
  ): Promise<OfficeAvailability> => {
    const response = await axios.get(`${OFFICE_API_URL}/offices/${officeId}/availability`, {
      params: { start_time: startTime, end_time: endTime },
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // ========== Meeting Bookings ==========

  getBookings: async (params?: {
    office_id?: number;
    status_filter?: string;
    start_date?: string;
    end_date?: string;
    my_meetings_only?: boolean;
  }): Promise<MeetingBooking[]> => {
    const response = await axios.get(`${OFFICE_API_URL}/bookings`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getBookingDetails: async (bookingId: number): Promise<MeetingDetails> => {
    const response = await axios.get(`${OFFICE_API_URL}/bookings/${bookingId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  createBooking: async (bookingData: {
    office_id: number;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    participant_ids?: number[];
  }): Promise<MeetingBooking> => {
    const response = await axios.post(`${OFFICE_API_URL}/bookings`, bookingData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  updateBooking: async (
    bookingId: number,
    bookingData: Partial<MeetingBooking>
  ): Promise<MeetingBooking> => {
    const response = await axios.put(`${OFFICE_API_URL}/bookings/${bookingId}`, bookingData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  cancelBooking: async (bookingId: number): Promise<void> => {
    await axios.delete(`${OFFICE_API_URL}/bookings/${bookingId}`, {
      headers: getAuthHeaders(),
    });
  },

  // ========== Calendar & Summary ==========

  getCalendarEvents: async (
    startDate: string,
    endDate: string,
    officeId?: number
  ): Promise<CalendarEvent[]> => {
    const response = await axios.get(`${OFFICE_API_URL}/calendar`, {
      params: {
        start_date: startDate,
        end_date: endDate,
        office_id: officeId,
      },
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getSummary: async (): Promise<BookingSummary> => {
    const response = await axios.get(`${OFFICE_API_URL}/summary`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  updateStatuses: async (): Promise<void> => {
    await axios.post(`${OFFICE_API_URL}/update-statuses`, null, {
      headers: getAuthHeaders(),
    });
  },
};

