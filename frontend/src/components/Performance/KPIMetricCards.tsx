import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Eye, BarChart3, Calendar } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { KpiTrend } from '../../services/performanceService';

interface KPIMetricCardsProps {
  trends: KpiTrend[];
  loading?: boolean;
  onViewDetails?: (kpiName: string) => void;
  onRecordNew?: (kpiName?: string) => void;
}

const KPIMetricCards: React.FC<KPIMetricCardsProps> = ({
  trends,
  loading,
  onViewDetails,
  onRecordNew,
}) => {
  // Generate sparkline data for each KPI
  const getSparklineData = (dataPoints: Array<{ date: string; value: number }>) => {
    return dataPoints.slice(-30).map((point, index) => ({
      index,
      value: point.value,
    }));
  };

  const getTrendDirection = (dataPoints: Array<{ date: string; value: number }>) => {
    if (dataPoints.length < 2) return 'stable';
    
    const recent = dataPoints.slice(-5);
    const earlier = dataPoints.slice(-10, -5);
    
    if (recent.length === 0 || earlier.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, p) => sum + p.value, 0) / earlier.length;
    
    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    if (Math.abs(change) < 5) return 'stable';
    return change > 0 ? 'up' : 'down';
  };

  const formatValue = (value: number, unit?: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else if (unit === '$' || unit === '€') {
      return `${unit}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    } else if (unit === '/10') {
      return `${value.toFixed(1)}/10`;
    } else if (unit === 'count' || unit === 'hours') {
      return `${value.toFixed(0)} ${unit === 'count' ? '' : unit}`;
    }
    return value.toFixed(1) + (unit ? ` ${unit}` : '');
  };

  const getKpiColor = (kpiName: string, trend: 'up' | 'down' | 'stable') => {
    const colors = {
      productivity: 'blue',
      delivery: 'green',
      innovation: 'orange',
      completion: 'purple',
      satisfaction: 'emerald',
      quality: 'indigo',
      collaboration: 'pink',
      learning: 'teal',
    };

    const key = Object.keys(colors).find(k => 
      kpiName.toLowerCase().includes(k)
    ) as keyof typeof colors;

    const baseColor = colors[key] || 'gray';

    return {
      base: baseColor,
      bg: `bg-${baseColor}-50 dark:bg-${baseColor}-900/20`,
      border: `border-${baseColor}-200 dark:border-${baseColor}-800`,
      text: `text-${baseColor}-600 dark:text-${baseColor}-400`,
      trendBg: trend === 'up' 
        ? 'bg-green-100 dark:bg-green-900/40' 
        : trend === 'down' 
        ? 'bg-red-100 dark:bg-red-900/40'
        : 'bg-gray-100 dark:bg-gray-700',
      trendText: trend === 'up' 
        ? 'text-green-700 dark:text-green-300' 
        : trend === 'down' 
        ? 'text-red-700 dark:text-red-300'
        : 'text-gray-600 dark:text-gray-400',
    };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-2xl"
          ></div>
        ))}
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
      >
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No KPI Data Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start tracking your performance by recording your first KPI data point.
        </p>
        <button
          onClick={() => onRecordNew?.()}
          className="inline-flex items-center px-6 py-3 gradient-primary text-white font-medium rounded-xl hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          Record First KPI
        </button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trends.map((trend, index) => {
        const trendDirection = getTrendDirection(trend.data_points);
        const colors = getKpiColor(trend.kpi_name, trendDirection);
        const sparklineData = getSparklineData(trend.data_points);
        const lastUpdate = trend.data_points.length > 0 
          ? new Date(trend.data_points[trend.data_points.length - 1].date).toLocaleDateString()
          : 'No data';

        return (
          <motion.div
            key={trend.kpi_name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className={`
              bg-white dark:bg-gray-800 rounded-2xl border-2 shadow-sm
              hover:shadow-lg transition-all duration-300 cursor-pointer
              group relative overflow-hidden
              ${colors.border}
            `}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {trend.kpi_name}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{lastUpdate}</span>
                  </div>
                </div>
                
                {/* Trend Indicator */}
                <div className={`
                  flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${colors.trendBg} ${colors.trendText}
                `}>
                  {trendDirection === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                  {trendDirection === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                  {trendDirection === 'stable' && <Minus className="w-3 h-3 mr-1" />}
                  {trendDirection === 'stable' ? 'Stable' : trendDirection === 'up' ? 'Rising' : 'Falling'}
                </div>
              </div>

              {/* Current Value */}
              <div className="mb-4">
                <div className="text-3xl font-medium text-gray-900 dark:text-white mb-1">
                  {formatValue(trend.current_value || 0, trend.unit)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {trend.data_points.length} data points
                </div>
              </div>

              {/* Sparkline Chart */}
              {sparklineData.length > 1 && (
                <div className="h-16 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={trendDirection === 'up' ? '#10b981' : trendDirection === 'down' ? '#ef4444' : '#6b7280'}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 3, stroke: 'none' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => onViewDetails?.(trend.kpi_name)}
                  className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors group"
                >
                  <Eye className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
                  View Details
                </button>
                
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Auto-calculated
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default KPIMetricCards;
