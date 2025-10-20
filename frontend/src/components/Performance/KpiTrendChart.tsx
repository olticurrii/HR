import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { performanceService } from '../../services/performanceService';

interface KpiTrendChartProps {
  userId: number;
  days?: number;
}

const KpiTrendChart: React.FC<KpiTrendChartProps> = ({ userId, days = 90 }) => {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrends();
  }, [userId, days]);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const data = await performanceService.getKpiTrends(userId, days);
      setTrends(data);
    } catch (err) {
      console.error('Failed to load KPI trends:', err);
      setError('Failed to load KPI trends');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (direction?: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'stable':
        return <Minus className="w-5 h-5 text-gray-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendColor = (direction?: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No KPI data available</p>
        <p className="text-sm mt-1">KPI snapshots will appear here as they are recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trends.map((trend, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                {getTrendIcon(trend.trend_direction)}
                <span className="ml-2">{trend.kpi_name}</span>
              </h3>
              {trend.current_value !== null && trend.current_value !== undefined && (
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {trend.current_value.toFixed(1)}
                  {trend.unit && <span className="text-lg ml-1">{trend.unit}</span>}
                </p>
              )}
            </div>
            {trend.trend_direction && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                trend.trend_direction === 'up' ? 'bg-green-100 text-green-700' :
                trend.trend_direction === 'down' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {trend.trend_direction === 'up' ? '↑ Improving' :
                 trend.trend_direction === 'down' ? '↓ Declining' :
                 '→ Stable'}
              </span>
            )}
          </div>

          {/* Simple mini chart visualization */}
          {trend.data_points && trend.data_points.length > 0 && (
            <div className="mt-4">
              <div className="flex items-end h-24 gap-1">
                {trend.data_points.slice(-12).map((point: any, idx: number) => {
                  const maxValue = Math.max(...trend.data_points.map((p: any) => p.value));
                  const height = (point.value / maxValue) * 100;
                  
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 rounded-t transition-all cursor-pointer group relative"
                      style={{ height: `${height}%` }}
                      title={`${new Date(point.date).toLocaleDateString()}: ${point.value}${trend.unit || ''}`}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {point.value.toFixed(1)}{trend.unit}
                        <div className="text-gray-300 text-xs">
                          {new Date(point.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{new Date(trend.data_points[0]?.date).toLocaleDateString()}</span>
                <span>{trend.data_points.length} data points</span>
                <span>{new Date(trend.data_points[trend.data_points.length - 1]?.date).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default KpiTrendChart;

