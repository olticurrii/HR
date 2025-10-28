import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Filter, 
  BarChart3, 
  Download, 
  RefreshCw,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { KpiTrend } from '../../services/performanceService';

interface KPIChartSectionProps {
  trends: KpiTrend[];
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
}

const KPIChartSection: React.FC<KPIChartSectionProps> = ({
  trends,
  loading,
  onRefresh,
  onExport,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<30 | 60 | 90>(90);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set());
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize selected metrics with first 3 KPIs
  React.useEffect(() => {
    if (trends.length > 0 && selectedMetrics.size === 0) {
      const initialMetrics = trends.slice(0, Math.min(3, trends.length)).map(t => t.kpi_name);
      console.log('🎨 Auto-selecting metrics for chart:', initialMetrics);
      setSelectedMetrics(new Set(initialMetrics));
    }
  }, [trends, selectedMetrics.size]);

  // Traxcis Brand Color Palette for KPI charts
  const colorPalette = [
    '#2563EB', // Primary - Electric Blue
    '#F97316', // Accent - Citrus Core
    '#10b981', // Green (success)
    '#8b5cf6', // Purple  
    '#ef4444', // Red (warning)
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#84cc16', // Lime
  ];

  // Format chart data
  const chartData = useMemo(() => {
    if (trends.length === 0) return [];

    // Get all unique dates (normalized to date strings) and sort them
    const dateMap = new Map<string, Date>();
    trends.forEach(trend => {
      if (!trend.data_points || trend.data_points.length === 0) return;
      
      trend.data_points.forEach(point => {
        const date = new Date(point.date);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - selectedTimeRange);
        
        if (date >= cutoffDate) {
          const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, date);
          }
        }
      });
    });

    const sortedDates = Array.from(dateMap.entries())
      .sort((a, b) => a[1].getTime() - b[1].getTime());

    // Create chart data for each date
    return sortedDates.map(([dateKey, dateObj]) => {
      const dataPoint: any = {
        date: dateObj.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        fullDate: dateKey,
      };

      trends.forEach(trend => {
        if (selectedMetrics.has(trend.kpi_name)) {
          // Find point for this date (compare by date string)
          const point = trend.data_points.find(p => {
            const pDate = new Date(p.date).toISOString().split('T')[0];
            return pDate === dateKey;
          });
          
          if (point) {
            dataPoint[trend.kpi_name] = point.value;
          }
        }
      });

      return dataPoint;
    });
  }, [trends, selectedTimeRange, selectedMetrics]);

  // Debug log
  React.useEffect(() => {
    console.log('📊 Chart Data:', {
      trends: trends.length,
      selectedMetrics: Array.from(selectedMetrics),
      chartDataPoints: chartData.length,
      sampleData: chartData.slice(0, 3)
    });
  }, [chartData, selectedMetrics, trends.length]);

  // Get available metrics
  const availableMetrics = trends.map(trend => ({
    name: trend.kpi_name,
    unit: trend.unit,
    color: colorPalette[trends.indexOf(trend) % colorPalette.length],
    dataPoints: trend.data_points.length,
  }));

  const toggleMetric = (metricName: string) => {
    const newSelected = new Set(selectedMetrics);
    if (newSelected.has(metricName)) {
      newSelected.delete(metricName);
    } else {
      newSelected.add(metricName);
    }
    setSelectedMetrics(newSelected);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
        >
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4 mb-1">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.dataKey}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {entry.value?.toFixed(1)}
                {trends.find(t => t.kpi_name === entry.dataKey)?.unit || ''}
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 h-8 w-48 rounded mb-4"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-80 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" />
              KPI Trends Chart
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1 font-normal">
              Visualize performance metrics over time
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(Number(e.target.value) as 30 | 60 | 90)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            
            {/* Chart Type Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  chartType === 'line' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  chartType === 'area' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Area
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${showFilters 
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              
              {onExport && (
                <button
                  onClick={onExport}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  title="Export chart"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Select Metrics to Display
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableMetrics.map((metric, index) => (
                  <motion.label
                    key={metric.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedMetrics.has(metric.name)
                        ? 'border-primary-200 dark:border-blue-800 bg-primary-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMetrics.has(metric.name)}
                      onChange={() => toggleMetric(metric.name)}
                      className="sr-only"
                    />
                    
                    <div className="flex items-center space-x-3 flex-1">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: metric.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {metric.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {metric.dataPoints} points • {metric.unit || 'units'}
                        </p>
                      </div>
                      {selectedMetrics.has(metric.name) ? (
                        <Eye className="w-4 h-4 text-primary dark:text-blue-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </motion.label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart */}
      <div className="p-6">
        {chartData.length === 0 || selectedMetrics.size === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {selectedMetrics.size === 0 ? 'Select Metrics' : 'No Data Available'}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              {selectedMetrics.size === 0 
                ? 'Choose one or more KPI metrics from the filters above to display the chart.'
                : `No data available for the last ${selectedTimeRange} days. Record some KPI data to see trends.`
              }
            </p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {availableMetrics
                    .filter(metric => selectedMetrics.has(metric.name))
                    .map((metric, index) => (
                      <Area
                        key={metric.name}
                        type="monotone"
                        dataKey={metric.name}
                        stroke={metric.color}
                        fill={metric.color}
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    ))
                  }
                </AreaChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {availableMetrics
                    .filter(metric => selectedMetrics.has(metric.name))
                    .map((metric, index) => (
                      <Line
                        key={metric.name}
                        type="monotone"
                        dataKey={metric.name}
                        stroke={metric.color}
                        strokeWidth={3}
                        dot={{ fill: metric.color, r: 4 }}
                        activeDot={{ r: 6, stroke: metric.color, strokeWidth: 2 }}
                      />
                    ))
                  }
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KPIChartSection;
