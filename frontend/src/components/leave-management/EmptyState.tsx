import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Users, ClipboardList, Plane, Coffee } from 'lucide-react';

interface EmptyStateProps {
  type: 'my-leaves' | 'team-leaves' | 'balance-breakdown';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
  loading?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  showAction = true,
  loading = false
}) => {
  // Default content based on type
  const getDefaultContent = () => {
    switch (type) {
      case 'my-leaves':
        return {
          icon: Calendar,
          title: title || "No leave requests yet",
          description: description || "You haven't made any leave requests this year. Take some time off when you need it!",
          actionLabel: actionLabel || "Request Leave",
          gradient: "from-blue-500 to-purple-600"
        };
      case 'team-leaves':
        return {
          icon: Users,
          title: title || "No team leave requests",
          description: description || "Your team hasn't submitted any leave requests that need your attention.",
          actionLabel: actionLabel || "View All Requests",
          gradient: "from-green-500 to-blue-600"
        };
      case 'balance-breakdown':
        return {
          icon: ClipboardList,
          title: title || "No leave balance data",
          description: description || "Leave balances haven't been set up yet. Contact your HR administrator.",
          actionLabel: actionLabel || "Contact HR",
          gradient: "from-orange-500 to-red-600"
        };
      default:
        return {
          icon: Calendar,
          title: title || "No data available",
          description: description || "There's nothing to show here right now.",
          actionLabel: actionLabel || "Refresh",
          gradient: "from-gray-500 to-gray-600"
        };
    }
  };

  const content = getDefaultContent();
  const IconComponent = content.icon;

  // Decorative icons for different types
  const getDecorativeIcons = () => {
    switch (type) {
      case 'my-leaves':
        return [
          { Icon: Plane, position: 'top-10 right-10', delay: 0.2 },
          { Icon: Coffee, position: 'bottom-10 left-10', delay: 0.4 },
          { Icon: Calendar, position: 'top-20 left-20', delay: 0.6 }
        ];
      case 'team-leaves':
        return [
          { Icon: Users, position: 'top-10 right-10', delay: 0.2 },
          { Icon: ClipboardList, position: 'bottom-10 left-10', delay: 0.4 }
        ];
      default:
        return [
          { Icon: Calendar, position: 'top-10 right-10', delay: 0.2 }
        ];
    }
  };

  const decorativeIcons = getDecorativeIcons();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 min-h-[400px] flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 min-h-[400px] overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute inset-0 bg-gradient-to-br ${content.gradient}`}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
      </div>

      {/* Decorative Icons */}
      {decorativeIcons.map(({ Icon, position, delay }, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 0.1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          className={`absolute ${position} text-gray-400 dark:text-gray-600`}
        >
          <Icon className="w-12 h-12" />
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 space-y-6">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex justify-center"
        >
          <div className={`w-20 h-20 bg-gradient-to-br ${content.gradient} rounded-full flex items-center justify-center shadow-lg`}>
            <IconComponent className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-3"
        >
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {content.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            {content.description}
          </p>
        </motion.div>

        {/* Action Button */}
        {showAction && onAction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.button
              onClick={onAction}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`
                inline-flex items-center space-x-2 px-6 py-3 
                bg-gradient-to-r ${content.gradient} text-white font-medium rounded-xl
                shadow-lg hover:shadow-xl transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                dark:focus:ring-offset-gray-800
              `}
            >
              <Plus className="w-5 h-5" />
              <span>{content.actionLabel}</span>
            </motion.button>
          </motion.div>
        )}

        {/* Additional Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            {type === 'my-leaves' && (
              <>
                <p>💡 <strong>Tip:</strong> Plan your leave in advance to ensure smooth workflow</p>
                <p>📅 Check with your team before booking extended leave periods</p>
              </>
            )}
            {type === 'team-leaves' && (
              <>
                <p>👥 <strong>Note:</strong> Team leave requests will appear here for your review</p>
                <p>✅ You'll receive notifications when new requests are submitted</p>
              </>
            )}
            {type === 'balance-breakdown' && (
              <>
                <p>⚙️ <strong>Setup:</strong> Leave balances are configured by HR administrators</p>
                <p>📊 Balances will automatically update as requests are approved</p>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Animated Background Elements */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full"
      />
      
      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-full"
      />
    </motion.div>
  );
};

export default EmptyState;
