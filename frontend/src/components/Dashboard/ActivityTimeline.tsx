import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  MessageSquare, 
  FileText, 
  Calendar,
  Briefcase,
  TrendingUp,
  LucideIcon
} from 'lucide-react';
import clsx from 'clsx';

interface ActivityItem {
  id: string;
  type: 'task' | 'project' | 'meeting' | 'message' | 'document' | 'leave' | 'performance';
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  status?: 'completed' | 'in_progress' | 'pending' | 'overdue';
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
  onViewAll?: () => void;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = React.memo(({ 
  activities, 
  loading = false, 
  maxItems = 8,
  onViewAll 
}) => {
  // Memoized icon mapping for better performance
  const activityIconMap: Record<ActivityItem['type'], LucideIcon> = useMemo(() => ({
    task: CheckCircle,
    project: Briefcase,
    meeting: Calendar,
    message: MessageSquare,
    document: FileText,
    leave: Clock,
    performance: TrendingUp
  }), []);

  // Memoized color mapping for activity types and statuses
  const getActivityColorClasses = useCallback((type: ActivityItem['type'], status?: ActivityItem['status']): string => {
    if (status === 'completed') return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (status === 'overdue') return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    
    const colorMap: Record<ActivityItem['type'], string> = {
      task: 'text-primary bg-blue-100 dark:bg-blue-900/20',
      project: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      meeting: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      message: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      document: 'text-gray-600 bg-gray-100 dark:bg-neutral-dark/20',
      leave: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      performance: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20'
    };
    
    return colorMap[type] || 'text-gray-600 bg-gray-100 dark:bg-neutral-dark/20';
  }, []);

  // Optimized time ago calculation with memoization
  const getTimeAgo = useCallback((timestamp: string): string => {
    const now = Date.now();
    const activityTime = new Date(timestamp).getTime();
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }, []);

  // Memoize displayed activities
  const displayedActivities = useMemo(() => 
    activities.slice(0, maxItems),
    [activities, maxItems]
  );

  // Memoize container classes
  const containerClasses = useMemo(() => clsx(
    'bg-white dark:bg-gray-800 rounded-2xl shadow-sm',
    'border border-gray-100 dark:border-gray-700 p-6'
  ), []);

  // Memoize view all handler
  const handleViewAll = useCallback(() => {
    onViewAll?.();
  }, [onViewAll]);

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start space-x-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
        {onViewAll && (
          <button 
            onClick={handleViewAll}
            className="text-sm text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            View all
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-transparent dark:from-gray-600 dark:via-gray-700"></div>
        
        <div className="space-y-6">
          {displayedActivities.map((activity, index) => {
            const Icon = activityIconMap[activity.type] || CheckCircle;
            const colorClasses = getActivityColorClasses(activity.type, activity.status);
            
            // Memoize user initial
            const userInitial = activity.user?.name?.charAt(0).toUpperCase() || '?';
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex items-start space-x-4"
              >
                {/* Icon */}
                <motion.div 
                  className={clsx(
                    'relative z-10 flex items-center justify-center w-10 h-10 rounded-full shadow-lg',
                    colorClasses
                  )}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <motion.div 
                    className={clsx(
                      'bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4',
                      'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group'
                    )}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                        {activity.user && (
                          <div className="flex items-center mt-2 space-x-2">
                            {activity.user.avatar ? (
                              <img
                                src={activity.user.avatar}
                                alt={activity.user.name}
                                className="w-5 h-5 rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs text-white font-medium">
                                {userInitial}
                              </div>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.user.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <time className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {getTimeAgo(activity.timestamp)}
                      </time>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state */}
        {displayedActivities.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Activity will appear here as it happens</p>
          </motion.div>
        )}
      </div>
    </div>
  );
});

// Set display name for better debugging
ActivityTimeline.displayName = 'ActivityTimeline';

export default ActivityTimeline;
export type { ActivityItem };
