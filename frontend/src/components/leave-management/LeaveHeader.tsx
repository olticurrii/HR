import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Users, TrendingUp } from 'lucide-react';

interface LeaveHeaderProps {
  userFullName?: string;
  onRequestLeave: () => void;
  stats?: {
    totalAllocated: number;
    totalUsed: number;
    totalRemaining: number;
    pendingRequests: number;
  };
}

const LeaveHeader: React.FC<LeaveHeaderProps> = ({
  userFullName = 'User',
  onRequestLeave,
  stats
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getUsagePercentage = () => {
    if (!stats || stats.totalAllocated === 0) return 0;
    return Math.round((stats.totalUsed / stats.totalAllocated) * 100);
  };

  const getStatusMessage = () => {
    const usage = getUsagePercentage();
    if (usage < 30) return "You're doing great managing your leave balance!";
    if (usage < 70) return "Keep track of your remaining leave days.";
    return "You've used most of your leave allocation this year.";
  };

  return (
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-3xl lg:text-4xl font-medium mb-2 flex flex-col">
                <span className="flex items-center">
                  <Calendar className="w-8 h-8 mr-3" />
                  Leave Management
                </span>
                <span className="accent-line mt-2 border-white/50"></span>
              </h1>
              <p className="text-primary-100 text-lg font-normal">
                Track your leave balances, view requests, and manage team leaves.
              </p>
            </motion.div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Quick Stats */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center"
              >
                <div>
                  <div className="text-2xl font-medium">{stats.totalAllocated}</div>
                  <div className="text-xs text-blue-100">Allocated</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-orange-300">{stats.totalUsed}</div>
                  <div className="text-xs text-blue-100">Used</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-green-300">{stats.totalRemaining}</div>
                  <div className="text-xs text-blue-100">Remaining</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-yellow-300">{stats.pendingRequests}</div>
                  <div className="text-xs text-blue-100">Pending</div>
                </div>
              </motion.div>
            )}

            {/* Action Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRequestLeave}
              className="flex items-center px-6 py-3 bg-white text-primary font-medium rounded-xl hover:bg-accent hover:text-white transform transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-accent"
            >
              <Plus className="w-5 h-5 mr-2" />
              Request Leave
            </motion.button>
          </div>
        </div>

        {/* Additional Info Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center gap-6 text-sm mt-6 pt-6 border-t border-white/20"
        >
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{currentDate}</span>
          </div>
          {stats && (
            <>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>{getUsagePercentage()}% usage rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{getStatusMessage()}</span>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LeaveHeader;
