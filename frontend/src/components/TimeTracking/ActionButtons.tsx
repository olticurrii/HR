import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LogIn, 
  LogOut, 
  Coffee, 
  Play, 
  MapPin, 
  Building2, 
  Loader2,
  Clock
} from 'lucide-react';
import clsx from 'clsx';

interface ActionButtonsProps {
  isActive: boolean;
  isOnBreak: boolean;
  isTerrain: boolean;
  allowBreaks: boolean;
  loading: boolean;
  onClockIn: (isTerrain: boolean) => void;
  onClockOut: () => void;
  onStartBreak: () => void;
  onEndBreak: () => void;
  onToggleTerrain: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isActive,
  isOnBreak,
  isTerrain,
  allowBreaks,
  loading,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak,
  onToggleTerrain
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (action: string, callback: () => void | Promise<void>) => {
    setActionLoading(action);
    try {
      await callback();
    } finally {
      setActionLoading(null);
    }
  };

  const buttonVariants = {
    hover: { scale: 1.02, y: -2 },
    tap: { scale: 0.98 }
  };

  // Clock In/Out Button
  const PrimaryActionButton = () => {
    if (!isActive) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Clock In - Office */}
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => handleAction('clock-in-office', () => onClockIn(false))}
            disabled={loading || actionLoading !== null}
            className={clsx(
              'flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium text-white',
              'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
              'shadow-lg hover:shadow-xl transition-all duration-300',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'border-2 border-transparent focus:border-green-300 focus:outline-none'
            )}
          >
            {actionLoading === 'clock-in-office' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Building2 className="w-5 h-5" />
            )}
            <span>Clock In (Office)</span>
          </motion.button>

          {/* Clock In - Terrain */}
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => handleAction('clock-in-terrain', () => onClockIn(true))}
            disabled={loading || actionLoading !== null}
            className={clsx(
              'flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium text-white',
              'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
              'shadow-lg hover:shadow-xl transition-all duration-300',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'border-2 border-transparent focus:border-blue-300 focus:outline-none'
            )}
          >
            {actionLoading === 'clock-in-terrain' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
            <span>Clock In (Terrain)</span>
          </motion.button>
        </div>
      );
    }

    return (
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => handleAction('clock-out', onClockOut)}
        disabled={loading || actionLoading !== null}
        className={clsx(
          'flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-medium text-white w-full',
          'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
          'shadow-lg hover:shadow-xl transition-all duration-300',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'border-2 border-transparent focus:border-red-300 focus:outline-none'
        )}
      >
        {actionLoading === 'clock-out' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <LogOut className="w-5 h-5" />
        )}
        <span>Clock Out</span>
      </motion.button>
    );
  };

  // Break Control Button
  const BreakButton = () => {
    if (!allowBreaks || !isActive) return null;

    return (
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => handleAction(
          isOnBreak ? 'end-break' : 'start-break',
          isOnBreak ? onEndBreak : onStartBreak
        )}
        disabled={loading || actionLoading !== null}
        className={clsx(
          'flex items-center justify-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300',
          'shadow-md hover:shadow-lg border-2 focus:outline-none',
          isOnBreak
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-transparent focus:border-green-300'
            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-transparent focus:border-amber-300',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {actionLoading === (isOnBreak ? 'end-break' : 'start-break') ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isOnBreak ? (
          <Play className="w-4 h-4" />
        ) : (
          <Coffee className="w-4 h-4" />
        )}
        <span>{isOnBreak ? 'End Break' : 'Start Break'}</span>
      </motion.button>
    );
  };

  // Terrain Mode Toggle
  const TerrainToggle = () => {
    if (!isActive) return null;

    return (
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => handleAction('toggle-terrain', onToggleTerrain)}
        disabled={loading || actionLoading !== null}
        className={clsx(
          'flex items-center justify-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300',
          'shadow-md hover:shadow-lg border-2 focus:outline-none',
          isTerrain
            ? 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-transparent focus:border-purple-300'
            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 focus:border-purple-300',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {actionLoading === 'toggle-terrain' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isTerrain ? (
          <MapPin className="w-4 h-4" />
        ) : (
          <Building2 className="w-4 h-4" />
        )}
        <span>{isTerrain ? 'Switch to Office' : 'Switch to Terrain'}</span>
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
    >
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Time Controls
        </h3>
      </div>

      <div className="space-y-4">
        {/* Primary Action */}
        <PrimaryActionButton />

        {/* Secondary Actions */}
        {(allowBreaks && isActive) || isActive ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <BreakButton />
            <TerrainToggle />
          </div>
        ) : null}

        {/* Quick Actions Info */}
        {!isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-primary-50 dark:bg-blue-900/20 rounded-xl border border-primary-200 dark:border-blue-800"
          >
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Clock className="w-3 h-3 text-primary dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Ready to start working?
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Choose your work location to begin tracking your time. Office mode for desk work, 
                  Terrain mode for field work.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ActionButtons;
