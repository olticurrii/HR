/**
 * Insights Service
 * API interactions for admin insights, keywords, and forecasting
 */
import { api } from './authService';

export interface Keyword {
  keyword: string;
  frequency: number;
  sentiment: string | null;
  department: string | null;
  first_seen: string;
  last_seen: string;
}

export interface KeywordsResponse {
  keywords: Keyword[];
  window_days: number;
  total_keywords: number;
  filters: {
    sentiment: string | null;
    department: string | null;
  };
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  change_pct: number;
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface ForecastPoint {
  date: string;
  value: number;
  lower: number;
  upper: number;
}

export interface ForecastResponse {
  metric: string;
  window_days: number;
  forecast_weeks: number;
  historical: DataPoint[];
  forecast: ForecastPoint[];
  trend: TrendAnalysis;
  method: string;
  confidence_level?: number;
}

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

export interface InsightsSummary {
  total_feedback: number;
  avg_daily_feedback: number;
  sentiment_distribution: SentimentDistribution;
  avg_sentiment_score: number;
  anonymous_percentage: number;
  top_keywords: Keyword[];
  trend: TrendAnalysis;
  window_days: number;
}

export interface KeywordsBySentiment {
  window_days: number;
  positive: Keyword[];
  negative: Keyword[];
  neutral: Keyword[];
}

export interface KeywordsByDepartment {
  window_days: number;
  departments: {
    [department: string]: Keyword[];
  };
}

export const insightsService = {
  /**
   * Get top keywords from feedback
   */
  getKeywords: async (
    window: number = 30,
    topN: number = 20,
    sentiment?: string,
    department?: string
  ): Promise<KeywordsResponse> => {
    const params = new URLSearchParams({
      window: window.toString(),
      top_n: topN.toString(),
    });
    
    if (sentiment) params.append('sentiment', sentiment);
    if (department) params.append('department', department);
    
    const response = await api.get(`/api/v1/admin/insights/keywords?${params}`);
    return response.data;
  },

  /**
   * Get forecast for a metric
   */
  getForecast: async (
    metric: 'feedback_count' | 'sentiment_avg' = 'feedback_count',
    window: number = 90,
    weeks: number = 4
  ): Promise<ForecastResponse> => {
    const params = new URLSearchParams({
      metric,
      window: window.toString(),
      weeks: weeks.toString(),
    });
    
    const response = await api.get(`/api/v1/admin/insights/forecast?${params}`);
    return response.data;
  },

  /**
   * Get comprehensive insights summary
   */
  getSummary: async (window: number = 30): Promise<InsightsSummary> => {
    const params = new URLSearchParams({
      window: window.toString(),
    });
    
    const response = await api.get(`/api/v1/admin/insights/summary?${params}`);
    return response.data;
  },

  /**
   * Manually trigger computation of daily aggregates
   */
  computeAggregates: async (daysBack: number = 30): Promise<any> => {
    const params = new URLSearchParams({
      days_back: daysBack.toString(),
    });
    
    const response = await api.post(`/api/v1/admin/insights/compute-aggregates?${params}`);
    return response.data;
  },

  /**
   * Get keywords categorized by sentiment
   */
  getKeywordsBySentiment: async (
    window: number = 30,
    topN: number = 10
  ): Promise<KeywordsBySentiment> => {
    const params = new URLSearchParams({
      window: window.toString(),
      top_n: topN.toString(),
    });
    
    const response = await api.get(`/api/v1/admin/insights/keywords/by-sentiment?${params}`);
    return response.data;
  },

  /**
   * Get keywords categorized by department
   */
  getKeywordsByDepartment: async (
    window: number = 30,
    topN: number = 10
  ): Promise<KeywordsByDepartment> => {
    const params = new URLSearchParams({
      window: window.toString(),
      top_n: topN.toString(),
    });
    
    const response = await api.get(`/api/v1/admin/insights/keywords/by-department?${params}`);
    return response.data;
  },
};

