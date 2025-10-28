import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Edit, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LeaveBalance } from '../../services/leaveService';

interface LeaveBalanceBreakdownProps {
  balances: LeaveBalance[];
  loading?: boolean;
  onEditBalance?: (balance: LeaveBalance) => void;
  isAdmin?: boolean;
}

const LeaveBalanceBreakdown: React.FC<LeaveBalanceBreakdownProps> = ({
  balances,
  loading = false,
  onEditBalance,
  isAdmin = false
}) => {
  // Calculate usage percentage for each balance
  const getUsagePercentage = (balance: LeaveBalance) => {
    if (balance.total_days === 0) return 0;
    return Math.round((balance.used_days / balance.total_days) * 100);
  };

  // Get usage status color
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 70) return 'text-orange-600 dark:text-orange-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  // Get progress bar color
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get trend icon
  const getTrendIcon = (balance: LeaveBalance) => {
    const percentage = getUsagePercentage(balance);
    if (percentage >= 70) return TrendingUp;
    if (percentage <= 30) return TrendingDown;
    return Minus;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 animate-pulse"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (balances.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Leave Balances
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Leave balances haven't been configured yet. Contact your HR administrator.
        </p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            Leave Balance Breakdown
          </h2>
        </div>
        
        {/* Year indicator */}
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          {new Date().getFullYear()}
        </div>
      </div>

      {/* Balance Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, staggerChildren: 0.1, delayChildren: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {balances.map((balance) => {
          const usagePercentage = getUsagePercentage(balance);
          const usageColor = getUsageColor(usagePercentage);
          const progressColor = getProgressColor(usagePercentage);
          const TrendIcon = getTrendIcon(balance);

          return (
            <motion.div
              key={balance.id}
              variants={cardVariants}
              transition={{ duration: 0.5, ease: "easeOut" }}
              whileHover={{ 
                y: -2, 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="relative border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all duration-300 group bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {balance.leave_type_name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <TrendIcon className={`w-4 h-4 ${usageColor}`} />
                    <span className={`text-sm font-medium ${usageColor}`}>
                      {usagePercentage}% used
                    </span>
                  </div>
                </div>
                
                {/* Edit Button for Admins */}
                {isAdmin && onEditBalance && (
                  <button
                    onClick={() => onEditBalance(balance)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-blue-900/20 rounded-lg"
                    title="Edit balance"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Balance Details */}
              <div className="space-y-3">
                {/* Numbers */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {balance.total_days} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Used:</span>
                    <span className={`font-medium ${usageColor}`}>
                      {balance.used_days} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {balance.remaining_days} days
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Usage Progress</span>
                    <span>{usagePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      className={`h-2.5 rounded-full transition-all duration-300 ${progressColor}`}
                    />
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        usagePercentage >= 90 ? 'bg-red-500' :
                        usagePercentage >= 70 ? 'bg-orange-500' :
                        usagePercentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className={`font-medium ${usageColor}`}>
                        {usagePercentage >= 90 ? 'Critical' :
                         usagePercentage >= 70 ? 'High Usage' :
                         usagePercentage >= 50 ? 'Moderate' : 'Low Usage'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Summary Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Total Types: {balances.length}</span>
            <span>•</span>
            <span>
              Total Days: {balances.reduce((sum, b) => sum + b.total_days, 0)}
            </span>
            <span>•</span>
            <span>
              Used: {balances.reduce((sum, b) => sum + b.used_days, 0)} days
            </span>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaveBalanceBreakdown;
