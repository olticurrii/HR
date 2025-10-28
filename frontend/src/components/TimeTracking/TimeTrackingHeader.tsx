import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users } from 'lucide-react';
import clsx from 'clsx';

interface TimeTrackingHeaderProps {
  activeTab: 'my-time' | 'team-view';
  onTabChange: (tab: 'my-time' | 'team-view') => void;
  isManagerOrAdmin?: boolean;
  currentTime: Date;
  userFullName?: string;
}

const TimeTrackingHeader: React.FC<TimeTrackingHeaderProps> = ({
  activeTab,
  onTabChange,
  isManagerOrAdmin = false,
  currentTime,
  userFullName = 'User'
}) => {
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-3xl text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
      
      <div className="relative z-10 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-3xl lg:text-4xl font-medium mb-2 flex items-center">
                <Clock className="w-8 h-8 mr-3" />
                Time Tracking
              </h1>
              <p className="text-blue-100 text-lg">
                Track your working hours and manage your time efficiently
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            {/* Current Time Display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-mono font-medium tracking-wider">
                {formattedTime}
              </div>
              <div className="text-xs text-blue-100 mt-1">
                {formattedDate}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 flex space-x-1 bg-white/10 backdrop-blur-sm rounded-2xl p-1"
        >
          <button
            onClick={() => onTabChange('my-time')}
            className={clsx(
              'flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
              activeTab === 'my-time'
                ? 'bg-white text-primary shadow-lg'
                : 'text-white hover:bg-white/10'
            )}
          >
            <Clock className="w-4 h-4" />
            <span>My Time</span>
          </button>

          {isManagerOrAdmin && (
            <button
              onClick={() => onTabChange('team-view')}
              className={clsx(
                'flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
                activeTab === 'team-view'
                  ? 'bg-white text-primary shadow-lg'
                  : 'text-white hover:bg-white/10'
              )}
            >
              <Users className="w-4 h-4" />
              <span>Team View</span>
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TimeTrackingHeader;
