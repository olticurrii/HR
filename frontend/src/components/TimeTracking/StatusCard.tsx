import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Play, Pause, User, Power, Coffee } from 'lucide-react';
import clsx from 'clsx';

interface StatusCardProps {
  isActive: boolean;
  isOnBreak: boolean;
  isTerrain: boolean;
  workingTimeMinutes: number;
  clockInTime?: string;
  currentTime: Date;
  loading?: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({
  isActive,
  isOnBreak,
  isTerrain,
  workingTimeMinutes,
  clockInTime,
  currentTime,
  loading = false
}) => {
  // Format duration from minutes to HH:MM:SS
  const formattedDuration = useMemo(() => {
    const hours = Math.floor(workingTimeMinutes / 60);
    const minutes = Math.floor(workingTimeMinutes % 60);
    const seconds = Math.floor((workingTimeMinutes * 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [workingTimeMinutes]);

  // Format clock in time
  const formattedClockInTime = useMemo(() => {
    if (!clockInTime) return null;
    const clockIn = new Date(clockInTime);
    return clockIn.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }, [clockInTime]);

  // Status configuration
  const statusConfig = useMemo(() => {
    if (!isActive) {
      return {
        label: 'Clocked Out',
        color: 'gray',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        iconColor: 'text-gray-500',
        icon: Power,
        pulseColor: 'bg-gray-400'
      };
    }

    if (isOnBreak) {
      return {
        label: 'On Break',
        color: 'amber',
        bgColor: 'bg-amber-100 dark:bg-amber-900/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        icon: Coffee,
        pulseColor: 'bg-amber-400'
      };
    }

    return {
      label: 'Clocked In',
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      icon: Play,
      pulseColor: 'bg-green-400'
    };
  }, [isActive, isOnBreak]);

  const locationConfig = useMemo(() => {
    if (isTerrain) {
      return {
        label: 'Terrain Work',
        color: 'text-primary dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20'
      };
    }
    return {
      label: 'Office Work',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    };
  }, [isTerrain]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
          <div className="text-center mb-6">
            <div className="w-48 h-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300"
    >
      <div className="p-6">
        {/* Header with Status */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Current Status
          </h3>
          
          <div className="flex items-center space-x-2">
            <div className={clsx(
              'flex items-center space-x-2 px-3 py-2 rounded-full',
              statusConfig.bgColor
            )}>
              <div className="relative">
                <statusConfig.icon className={clsx('w-4 h-4', statusConfig.iconColor)} />
                {isActive && !isOnBreak && (
                  <motion.div
                    className={clsx('absolute -top-1 -right-1 w-2 h-2 rounded-full', statusConfig.pulseColor)}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </div>
              <span className={clsx('text-sm font-medium', statusConfig.iconColor)}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
        
        {/* Digital Timer Display */}
        <div className="text-center mb-6">
          <motion.div
            key={formattedDuration}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
            className="text-4xl md:text-5xl font-mono font-medium text-gray-900 dark:text-white tracking-wider mb-2"
          >
            {formattedDuration}
          </motion.div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isActive ? 'Working Time Today' : 'Total Time Today'}
          </p>
        </div>

        {/* Status Details */}
        <div className="grid grid-cols-2 gap-4">
          {/* Clock In Time */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                Clock In
              </span>
            </div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              {formattedClockInTime || '--:--'}
            </div>
          </div>

          {/* Location */}
          <div className={clsx('rounded-xl p-4', locationConfig.bgColor)}>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                Location
              </span>
            </div>
            <div className={clsx('text-lg font-medium', locationConfig.color)}>
              {locationConfig.label}
            </div>
          </div>
        </div>

        {/* Progress Ring for Active Sessions */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex justify-center"
          >
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className={statusConfig.iconColor}
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: (workingTimeMinutes % 60) / 60,
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <statusConfig.icon className={clsx('w-6 h-6', statusConfig.iconColor)} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StatusCard;
