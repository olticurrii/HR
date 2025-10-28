import { useState, useEffect, useMemo, useCallback } from 'react';
import { performanceService, KpiTrend } from '../services/performanceService';
import toast from 'react-hot-toast';

interface KPIOverviewStats {
  totalKpisTracked: number;
  averagePerformance: number;
  kpisImproved: number;
  kpisDeclined: number;
  mostRecentUpdate: string;
  performanceScore?: number;
}

interface UseKPIDataOptions {
  userId: number;
  days?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseKPIDataReturn {
  // Data
  trends: KpiTrend[];
  overviewStats: KPIOverviewStats;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  loadTrends: () => Promise<void>;
  refreshData: () => Promise<void>;
  recordKPI: (data: any) => Promise<void>;
  
  // Computed
  hasData: boolean;
  lastUpdated: Date | null;
}

export const useKPIData = ({
  userId,
  days = 90,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}: UseKPIDataOptions): UseKPIDataReturn => {
  const [trends, setTrends] = useState<KpiTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load KPI trends data (now using auto-calculated endpoint)
  const loadTrends = useCallback(async () => {
    try {
      setError(null);
      // Try to get auto-calculated KPIs first
      const autoData = await performanceService.getAutoCalculatedKpis(userId, days);
      
      // Transform the data to match KpiTrend interface
      const trends: KpiTrend[] = autoData.metrics?.map((metric: any) => ({
        kpi_name: metric.kpi_name,
        current_value: metric.current_value,
        unit: metric.unit,
        data_points: metric.data_points?.map((dp: any) => ({
          date: dp.date,
          value: dp.value
        })) || [],
        trend_direction: metric.trend_direction,
      })) || [];
      
      setTrends(trends);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load KPI trends:', err);
      setError('Failed to load KPI data');
      toast.error('Failed to load KPI data');
    }
  }, [userId, days]);

  // Refresh data (with loading state)
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await loadTrends();
    } finally {
      setLoading(false);
    }
  }, [loadTrends]);

  // Record new KPI
  const recordKPI = useCallback(async (data: any) => {
    try {
      await performanceService.createKpiSnapshot({
        ...data,
        user_id: userId,
        measured_by_id: userId,
      });
      
      // Refresh data after recording
      await loadTrends();
      toast.success('KPI recorded successfully!');
    } catch (err: any) {
      console.error('Error recording KPI:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to record KPI';
      toast.error(errorMessage);
      throw err;
    }
  }, [userId, loadTrends]);

  // Calculate overview statistics
  const overviewStats = useMemo((): KPIOverviewStats => {
    const totalKpisTracked = trends.length;
    const kpisWithData = trends.filter(t => t.data_points.length > 0);
    
    // Calculate average performance (prioritize percentage KPIs)
    const percentageKpis = kpisWithData.filter(t => t.unit === '%');
    const averagePerformance = percentageKpis.length > 0 
      ? percentageKpis.reduce((sum, t) => sum + (t.current_value || 0), 0) / percentageKpis.length
      : kpisWithData.length > 0
      ? kpisWithData.reduce((sum, t) => {
          // Normalize different units to a 0-100 scale for average calculation
          const value = t.current_value || 0;
          if (t.unit === '/10') return sum + (value * 10);
          if (t.unit === 'hours') return sum + Math.min(value, 100); // Cap hours at 100
          if (t.unit === 'count') return sum + Math.min(value * 10, 100); // Scale count
          return sum + Math.min(value, 100);
        }, 0) / kpisWithData.length
      : 0;

    // Calculate improved vs declined KPIs (trend analysis)
    let kpisImproved = 0;
    let kpisDeclined = 0;

    trends.forEach(trend => {
      if (trend.data_points.length >= 4) {
        const recent = trend.data_points.slice(-2); // Last 2 points
        const earlier = trend.data_points.slice(-4, -2); // Previous 2 points
        
        if (recent.length === 2 && earlier.length === 2) {
          const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
          const earlierAvg = earlier.reduce((sum, p) => sum + p.value, 0) / earlier.length;
          
          const changePercent = ((recentAvg - earlierAvg) / earlierAvg) * 100;
          
          if (changePercent > 5) kpisImproved++;
          else if (changePercent < -5) kpisDeclined++;
        }
      }
    });

    // Find most recent update across all KPIs
    const mostRecentUpdate = trends.reduce((latest, trend) => {
      if (trend.data_points.length > 0) {
        const trendLatest = new Date(trend.data_points[trend.data_points.length - 1].date);
        return latest ? (trendLatest > latest ? trendLatest : latest) : trendLatest;
      }
      return latest;
    }, null as Date | null);

    return {
      totalKpisTracked,
      averagePerformance,
      kpisImproved,
      kpisDeclined,
      mostRecentUpdate: mostRecentUpdate 
        ? mostRecentUpdate.toLocaleDateString() 
        : 'Never',
      performanceScore: Math.round(averagePerformance),
    };
  }, [trends]);

  // Computed values
  const hasData = trends.length > 0;

  // Initial load and reload on userId/days change
  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, days]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      loadTrends(); // Use loadTrends (no loading state) for auto-refresh
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadTrends]);

  return {
    // Data
    trends,
    overviewStats,
    
    // State  
    loading,
    error,
    
    // Actions
    loadTrends,
    refreshData,
    recordKPI,
    
    // Computed
    hasData,
    lastUpdated,
  };
};
