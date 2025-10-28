import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  PlayCircle, 
  Coffee, 
  Timer, 
  MapPin, 
  Building2,
  Pause
} from 'lucide-react';
import clsx from 'clsx';

interface SessionCardProps {
  isActive: boolean;
  clockInTime?: string;
  clockOutTime?: string;
  breakStart?: string;
  breakEnd?: string;
  isOnBreak: boolean;
  isTerrain: boolean;
  totalWorkingMinutes: number;
  breakDurationMinutes?: number;
  currentTime: Date;
  loading?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({
  isActive,
  clockInTime,
  clockOutTime,
  breakStart,
  breakEnd,
  isOnBreak,
  isTerrain,
  totalWorkingMinutes,
  breakDurationMinutes = 0,
  currentTime,
  loading = false
}) => {
  // Format times
  const formattedClockIn = useMemo(() => {
    if (!clockInTime) return null;
    const date = new Date(clockInTime);
    return {
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    };
  }, [clockInTime]);

  const formattedBreakStart = useMemo(() => {
    if (!breakStart) return null;
    const date = new Date(breakStart);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }, [breakStart]);

  const formattedBreakEnd = useMemo(() => {
    if (!breakEnd) return null;
    const date = new Date(breakEnd);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }, [breakEnd]);

  // Calculate session duration
  const sessionDuration = useMemo(() => {
    const hours = Math.floor(totalWorkingMinutes / 60);
    const minutes = totalWorkingMinutes % 60;
    return `${hours}h ${minutes}m`;
  }, [totalWorkingMinutes]);

  // Calculate break duration
  const breakDuration = useMemo(() => {
    if (!breakDurationMinutes) return '0m';
    const hours = Math.floor(breakDurationMinutes / 60);
    const minutes = breakDurationMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }, [breakDurationMinutes]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="animate-pulse">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isActive && !clockInTime) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Session Details
          </h3>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No active session. Clock in to see session details.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Session Details
          </h3>
          {isActive && (
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          )}
        </div>

        <div className="space-y-4">
          {/* Clock In Time */}
          {formattedClockIn && (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Clock In
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formattedClockIn.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-green-600 dark:text-green-400">
                  {formattedClockIn.time}
                </p>
              </div>
            </div>
          )}

          {/* Work Location */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className={clsx(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                isTerrain 
                  ? 'bg-blue-100 dark:bg-blue-900/40' 
                  : 'bg-purple-100 dark:bg-purple-900/40'
              )}>
                {isTerrain ? (
                  <MapPin className="w-4 h-4 text-primary dark:text-blue-400" />
                ) : (
                  <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Work Location
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={clsx(
                'text-lg font-medium',
                isTerrain 
                  ? 'text-primary dark:text-blue-400' 
                  : 'text-purple-600 dark:text-purple-400'
              )}>
                {isTerrain ? 'Terrain' : 'Office'}
              </p>
            </div>
          </div>

          {/* Break Status */}
          {(isOnBreak || breakStart) && (
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                  {isOnBreak ? (
                    <Pause className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {isOnBreak ? 'On Break Since' : 'Last Break'}
                  </p>
                  {breakDurationMinutes > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Duration: {breakDuration}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-amber-600 dark:text-amber-400">
                  {formattedBreakStart || '--:--'}
                </p>
                {formattedBreakEnd && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Until {formattedBreakEnd}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Total Working Time */}
          <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
                <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Total Working Time
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Today's session
                </p>
              </div>
            </div>
            <div className="text-right">
              <motion.p
                key={sessionDuration}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="text-lg font-medium text-indigo-600 dark:text-indigo-400"
              >
                {sessionDuration}
              </motion.p>
            </div>
          </div>

          {/* Session Status Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Session Status
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {isActive 
                    ? isOnBreak 
                      ? 'Currently on break' 
                      : 'Active and working'
                    : 'Session completed'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  isActive
                    ? isOnBreak
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                )}>
                  {isActive
                    ? isOnBreak
                      ? 'On Break'
                      : 'Working'
                    : 'Completed'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SessionCard;
