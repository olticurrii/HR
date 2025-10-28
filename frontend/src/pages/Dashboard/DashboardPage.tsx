import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { Users, CheckSquare, FolderOpen, MessageSquare, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import DashboardCards from '../../components/Dashboard/DashboardCards';
import ActivityTimeline from '../../components/Dashboard/ActivityTimeline';
import { dashboardService } from '../../services/dashboardService';
import type { StatCardProps } from '../../components/Dashboard/DashboardCards';
import type { ActivityItem } from '../../components/Dashboard/ActivityTimeline';

const DashboardPage: React.FC = React.memo(() => {
  const { user } = useAuth();

  // Fetch dashboard data with React Query
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(
    'dashboardData',
    dashboardService.getDashboardData,
    {
      refetchOnWindowFocus: false,
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
      staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
      retry: 2,
      onError: (error) => {
        console.error('Dashboard data fetch error:', error);
      }
    }
  );

  // Memoize stats transformation to prevent unnecessary recalculations
  const stats: StatCardProps[] = useMemo(() => dashboardData ? [
    {
      name: 'Total Tasks',
      value: dashboardData.stats.totalTasks.toString(),
      icon: CheckSquare,
      color: 'bg-primary',
      change: dashboardData.stats.tasksTrend,
      loading: false
    },
    {
      name: 'Active Projects',
      value: dashboardData.stats.activeProjects.toString(),
      icon: FolderOpen,
      color: 'bg-green-500',
      change: dashboardData.stats.projectsTrend,
      loading: false
    },
    {
      name: 'Team Members',
      value: dashboardData.stats.teamMembers.toString(),
      icon: Users,
      color: 'bg-secondary',
      change: dashboardData.stats.membersTrend,
      loading: false
    },
    {
      name: 'Unread Messages',
      value: dashboardData.stats.unreadMessages.toString(),
      icon: MessageSquare,
      color: 'bg-accent',
      change: dashboardData.stats.messagesTrend,
      loading: false
    },
  ] : [
    // Loading state cards
    {
      name: 'Total Tasks',
      value: '0',
      icon: CheckSquare,
      color: 'bg-primary',
      loading: true
    },
    {
      name: 'Active Projects',
      value: '0',
      icon: FolderOpen,
      color: 'bg-green-500',
      loading: true
    },
    {
      name: 'Team Members',
      value: '0',
      icon: Users,
      color: 'bg-secondary',
      loading: true
    },
    {
      name: 'Unread Messages',
      value: '0',
      icon: MessageSquare,
      color: 'bg-accent',
      loading: true
    },
  ], [dashboardData]);

  // Memoize activities transformation
  const recentActivities: ActivityItem[] = useMemo(() => 
    dashboardData?.recentActivities.map(activity => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: activity.timestamp,
      user: activity.user,
      status: activity.status
    })) || [], [dashboardData?.recentActivities]);

  // Memoize productivity trend calculation
  const productivityTrend = useMemo(() => {
    if (!dashboardData) return "Loading productivity data...";
    
    const completedTasks = dashboardData.stats.totalTasks;
    const activeProjects = dashboardData.stats.activeProjects;
    
    if (completedTasks > 0 && activeProjects > 0) {
      return `${Math.floor((completedTasks / Math.max(activeProjects, 1)) * 10)}% completion rate`;
    }
    return "Tracking productivity metrics";
  }, [dashboardData?.stats.totalTasks, dashboardData?.stats.activeProjects]);

  // Memoize formatted date to avoid recalculation on every render
  const formattedDate = useMemo(() => 
    new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), []);

  // Memoize click handlers to prevent unnecessary re-renders
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCreateTask = useCallback(() => {
    window.location.href = '/tasks/create';
  }, []);

  const handleTeamOverview = useCallback(() => {
    window.location.href = '/people/org-chart';
  }, []);

  const handleViewReports = useCallback(() => {
    window.location.href = user?.role === 'admin' ? '/feedback/insights' : '/performance';
  }, [user?.role]);

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-red-900 dark:text-red-100 mb-2">
            Unable to load dashboard data
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">
            There was a problem fetching your dashboard information. Please try again.
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary hover:bg-accent text-white rounded-xl transition-colors font-medium"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="gradient-primary rounded-3xl p-8 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-4xl font-medium mb-2 flex flex-col">
              <span>Welcome back, {user?.full_name}! 👋</span>
              <span className="accent-line mt-2 border-white/50"></span>
            </h1>
            <p className="text-primary-100 text-lg mb-6 font-normal">
              Here's what's happening in your HR system today.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-6 text-sm"
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>{productivityTrend}</span>
            </div>
            {dashboardData?.teamStatus && (
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{dashboardData.teamStatus.totalActive} active team members</span>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <DashboardCards stats={stats} />
      </motion.div>

      {/* Team Status - Admin/Manager Only */}
      {dashboardData?.teamStatus && (user?.role === 'admin' || user?.role === 'manager') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Status</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {dashboardData.teamStatus.totalActive} of {dashboardData.teamStatus.totalUsers} active
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-2xl font-medium text-green-600 dark:text-green-400">
                {dashboardData.teamStatus.totalActive}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Active Now</div>
            </div>
            <div className="text-center p-4 bg-primary-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-2xl font-medium text-primary dark:text-blue-400">
                {dashboardData.teamStatus.averageHoursToday.toFixed(1)}h
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Avg Hours Today</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="text-2xl font-medium text-purple-600 dark:text-purple-400">
                {Math.round((dashboardData.teamStatus.totalActive / dashboardData.teamStatus.totalUsers) * 100)}%
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Attendance Rate</div>
            </div>
          </div>

          {dashboardData.teamStatus.activeUsers.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Currently Active</h4>
              <div className="flex flex-wrap gap-2">
                {dashboardData.teamStatus.activeUsers.slice(0, 8).map((activeUser) => (
                  <div key={activeUser.id} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{activeUser.full_name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.floor(activeUser.current_duration_minutes / 60)}h {activeUser.current_duration_minutes % 60}m
                    </span>
                  </div>
                ))}
                {dashboardData.teamStatus.activeUsers.length > 8 && (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    +{dashboardData.teamStatus.activeUsers.length - 8} more
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Recent Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <ActivityTimeline activities={recentActivities} loading={isLoading} />
      </motion.div>

      {/* Monthly Performance Report - Admin Only */}
      {dashboardData?.monthlyReport && user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Performance Report</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-medium text-indigo-600 dark:text-indigo-400">
                {dashboardData.monthlyReport.summary.total_objectives}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Objectives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-green-600 dark:text-green-400">
                {dashboardData.monthlyReport.summary.average_progress}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-purple-600 dark:text-purple-400">
                {dashboardData.monthlyReport.summary.top_performers_count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Top Performers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-orange-600 dark:text-orange-400">
                {dashboardData.monthlyReport.summary.pending_approvals}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Approvals</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateTask}
          className={clsx(
            'bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm',
            'border border-gray-100 dark:border-gray-700',
            'hover:shadow-lg transition-all duration-300 group text-left'
          )}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Create New Task</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Add a new task to your workflow</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTeamOverview}
          className={clsx(
            'bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm',
            'border border-gray-100 dark:border-gray-700',
            'hover:shadow-lg transition-all duration-300 group text-left'
          )}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Team Overview</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">View your team's performance</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleViewReports}
          className={clsx(
            'bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm',
            'border border-gray-100 dark:border-gray-700',
            'hover:shadow-lg transition-all duration-300 group text-left'
          )}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">View Reports</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Access analytics and insights</p>
        </motion.button>
      </motion.div>
    </div>
  );
});

// Set display name for better debugging
DashboardPage.displayName = 'DashboardPage';

export default DashboardPage;
