import { api } from './authService';

export interface FeedbackAuthor {
  id: number;
  full_name: string;
}

export interface Feedback {
  id: number;
  content: string;
  is_anonymous: boolean;
  recipient_type: 'USER' | 'ADMIN' | 'EVERYONE';
  recipient_id?: number;
  parent_id?: number;
  is_flagged: boolean;
  flagged_reason?: string;
  created_at: string;
  sentiment_label?: 'positive' | 'neutral' | 'negative';
  sentiment_score?: number;
  keywords?: string[];
  reply_count: number;
  author?: FeedbackAuthor;
  author_display?: string;
}

export interface FeedbackCreate {
  content: string;
  is_anonymous: boolean;
  recipient_type: 'USER' | 'ADMIN' | 'EVERYONE';
  recipient_id?: number;
  parent_id?: number;
}

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
}

export interface KeywordCount {
  term: string;
  count: number;
}

export interface TrendPoint {
  date: string;
  count: number;
  avg_sentiment?: number;
}

export interface TopRecipient {
  id?: number;
  name: string;
  count: number;
  recipient_type: string;
}

export interface FeedbackInsights {
  sentiment: SentimentDistribution;
  keywords: KeywordCount[];
  trend: TrendPoint[];
  recipients: TopRecipient[];
  total_feedback: number;
  window_days: number;
}

export const feedbackService = {
  // Create new feedback
  createFeedback: async (data: FeedbackCreate): Promise<Feedback> => {
    const response = await api.post('/api/v1/feedback', data);
    return response.data;
  },

  // Get feedback addressed to me
  getMyFeedback: async (skip = 0, limit = 50): Promise<Feedback[]> => {
    const response = await api.get('/api/v1/feedback/my', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Get feedback I sent
  getSentFeedback: async (skip = 0, limit = 50): Promise<Feedback[]> => {
    const response = await api.get('/api/v1/feedback/sent', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Admin: Get all feedback with filters
  getAllFeedback: async (
    filters?: {
      recipient_type?: string;
      recipient_id?: number;
      start_date?: string;
      end_date?: string;
      skip?: number;
      limit?: number;
    }
  ): Promise<Feedback[]> => {
    const response = await api.get('/api/v1/admin/feedback', {
      params: filters,
    });
    return response.data;
  },

  // Admin: Get insights
  getInsights: async (windowDays = 30): Promise<FeedbackInsights> => {
    const response = await api.get('/api/v1/admin/feedback/insights', {
      params: { window_days: windowDays },
    });
    return response.data;
  },

  // Get replies to a specific feedback
  getReplies: async (feedbackId: number): Promise<Feedback[]> => {
    const response = await api.get(`/api/v1/feedback/${feedbackId}/replies`);
    return response.data;
  },

  // Admin: Get weekly digest
  getWeeklyDigest: async (): Promise<any> => {
    const response = await api.get('/api/v1/admin/feedback/weekly-digest');
    return response.data;
  },

  // Admin: Get flagged feedback
  getFlaggedFeedback: async (skip = 0, limit = 50): Promise<Feedback[]> => {
    const response = await api.get('/api/v1/admin/feedback/flagged', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Admin: Unflag feedback
  unflagFeedback: async (feedbackId: number): Promise<{ message: string }> => {
    const response = await api.patch(`/api/v1/admin/feedback/${feedbackId}/unflag`);
    return response.data;
  },
};

