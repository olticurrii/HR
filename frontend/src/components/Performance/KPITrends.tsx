import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw, Download, Zap, Info } from 'lucide-react';
import { useKPIData } from '../../hooks/useKPIData';
import EmptyState from './EmptyState';
import KPIEmptyState from './KPIEmptyState';
import KPIOverviewCards from './KPIOverviewCards';
import KPIMetricCards from './KPIMetricCards';
import KPIChartSection from './KPIChartSection';
import { performanceService } from '../../services/performanceService';
import toast from 'react-hot-toast';

interface KPITrendsProps {
  userId: number;
  days?: number;
}

const KPITrends: React.FC<KPITrendsProps> = ({ userId, days = 90 }) => {
  const [isCalculating, setIsCalculating] = useState(false);

  // Use the custom hook for KPI data management
  const {
    trends,
    overviewStats,
    loading,
    error,
    loadTrends,
    refreshData,
    recordKPI,
    hasData,
    lastUpdated,
  } = useKPIData({
    userId,
    days,
    autoRefresh: true, // Enable auto-refresh to show latest calculations
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  const handleRecalculateNow = async () => {
    try {
      setIsCalculating(true);
      await performanceService.calculateKpisNow(userId, days);
      toast.success('KPIs recalculated successfully!');
      // Wait a bit then refresh
      setTimeout(() => {
        refreshData();
      }, 1000);
    } catch (error: any) {
      console.error('Error recalculating KPIs:', error);
      toast.error('Failed to recalculate KPIs. Only admins/managers can trigger calculations.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleViewDetails = (kpiName: string) => {
    toast(`Detailed analytics for ${kpiName} coming soon!`, {
      icon: '📊',
      duration: 3000,
    });
  };

  const handleExportData = () => {
    const csvData = trends.map(trend => ({
      kpi: trend.kpi_name,
      current_value: trend.current_value,
      unit: trend.unit,
      data_points: trend.data_points.length,
      last_updated: trend.data_points.length > 0 
        ? trend.data_points[trend.data_points.length - 1].date 
        : 'N/A'
    }));
    
    console.log('Export data:', csvData);
    toast.success('CSV export functionality - Coming soon!');
  };

  const handleLearnMore = () => {
    toast('KPIs are automatically calculated from your Tasks, Projects, and Time Tracking data every 6 hours.', {
      icon: '🤖',
      duration: 5000,
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading skeleton matching the real layout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div>
              <div className="bg-gray-200 dark:bg-gray-700 h-8 w-48 rounded mb-2 animate-pulse"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-5 w-64 rounded animate-pulse"></div>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 h-10 w-32 rounded animate-pulse"></div>
          </div>

          {/* Overview cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-2xl animate-pulse"></div>
            ))}
          </div>

          {/* Chart skeleton */}
          <div className="bg-gray-200 dark:bg-gray-700 h-96 rounded-2xl animate-pulse"></div>
        </motion.div>
      </div>
    );
  }

  // Show enhanced empty state for KPIs
  if (!hasData && !loading) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-primary rounded-2xl p-8 text-white"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Zap className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-medium">Auto-Calculated KPIs</h2>
              <p className="text-primary-100">Metrics calculated automatically from your data</p>
            </div>
          </div>
        </motion.div>

        <KPIEmptyState
          onRecordKPI={handleRecalculateNow}
          onLearnMore={handleLearnMore}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-medium text-gray-900 dark:text-white flex flex-col"
          >
            <span className="flex items-center">
              <Zap className="w-7 h-7 mr-3 text-accent" />
              Auto-Calculated KPI Trends
            </span>
            <span className="accent-line"></span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-2 text-body"
          >
            <Info className="w-4 h-4" />
            <span>Automatically calculated from Tasks, Projects, and Time Tracking • Updates every 6 hours</span>
          </motion.p>
          {lastUpdated && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-gray-500 dark:text-gray-500 mt-1"
            >
              Last updated: {lastUpdated.toLocaleString()}
            </motion.p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
            title="Refresh data from server"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={handleExportData}
            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Export KPI data"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>

          <motion.button
            onClick={handleRecalculateNow}
            disabled={isCalculating || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center px-6 py-3 bg-accent hover:bg-accent-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trigger immediate KPI recalculation (Admin/Manager only)"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Calculating...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Recalculate Now
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <KPIOverviewCards stats={overviewStats} loading={loading} />
      </motion.div>

      {/* Auto-Calculation Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4"
      >
        <div className="flex items-start space-x-3">
          <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-1">
              🤖 Automated Performance Tracking
            </h4>
            <p className="text-sm text-primary-800 dark:text-primary-200 text-body">
              These KPIs are automatically calculated from your existing Tasks, Projects, and Time Tracking data. 
              The system runs calculations every 6 hours (00:00, 06:00, 12:00, 18:00). 
              Click "Recalculate Now" to trigger an immediate update.
            </p>
          </div>
        </div>
      </motion.div>

      {/* KPI Metric Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <KPIMetricCards
          trends={trends}
          loading={loading}
          onViewDetails={handleViewDetails}
          onRecordNew={undefined}  // Disable manual recording - auto-calculated only
        />
      </motion.div>

      {/* Interactive Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <KPIChartSection
          trends={trends}
          loading={loading}
          onRefresh={refreshData}
          onExport={handleExportData}
        />
      </motion.div>

      {/* Error Toast - handled by the hook */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <Info className="w-5 h-5" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};

export default KPITrends;
