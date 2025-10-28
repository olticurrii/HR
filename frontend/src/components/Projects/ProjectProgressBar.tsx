import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface ProjectProgressBarProps {
  completed: number;
  total: number;
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  showIcon?: boolean;
  className?: string;
}

const ProjectProgressBar: React.FC<ProjectProgressBarProps> = ({
  completed,
  total,
  percentage,
  size = 'md',
  showDetails = true,
  showIcon = false,
  className = ''
}) => {
  const getProgressColor = (percent: number) => {
    if (percent === 0) return {
      bg: 'bg-gray-200 dark:bg-gray-700',
      fill: 'bg-gray-400 dark:bg-gray-600',
      text: 'text-gray-600 dark:text-gray-400'
    };
    if (percent === 100) return {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      fill: 'bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400'
    };
    if (percent >= 75) return {
      bg: 'bg-green-100 dark:bg-green-900/30',
      fill: 'bg-green-500',
      text: 'text-green-600 dark:text-green-400'
    };
    if (percent >= 50) return {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      fill: 'bg-primary-500',
      text: 'text-primary dark:text-blue-400'
    };
    if (percent >= 25) return {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      fill: 'bg-yellow-500',
      text: 'text-yellow-600 dark:text-yellow-400'
    };
    return {
      bg: 'bg-red-100 dark:bg-red-900/30',
      fill: 'bg-red-500',
      text: 'text-red-600 dark:text-red-400'
    };
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          height: 'h-1',
          text: 'text-xs',
          spacing: 'space-y-1'
        };
      case 'lg':
        return {
          height: 'h-3',
          text: 'text-sm',
          spacing: 'space-y-3'
        };
      default:
        return {
          height: 'h-2',
          text: 'text-sm',
          spacing: 'space-y-2'
        };
    }
  };

  const getStatusIcon = () => {
    if (percentage === 100) return <CheckCircle className="w-4 h-4" />;
    if (percentage > 0) return <Clock className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const colors = getProgressColor(percentage);
  const sizeClasses = getSizeClasses();

  return (
    <div className={`${sizeClasses.spacing} ${className}`}>
      {/* Progress Details */}
      {showDetails && (
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-2 ${sizeClasses.text} font-medium ${colors.text}`}>
            {showIcon && getStatusIcon()}
            <span>Progress</span>
          </div>
          <div className={`${sizeClasses.text} font-medium ${colors.text}`}>
            {completed} of {total} tasks ({Math.round(percentage)}%)
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className={`relative w-full ${colors.bg} rounded-full ${sizeClasses.height} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 0.8, 
            delay: 0.2, 
            ease: [0.4, 0, 0.2, 1] 
          }}
          className={`${sizeClasses.height} ${colors.fill} rounded-full transition-all duration-300`}
        />
        
        {/* Shimmer effect for active progress */}
        {percentage > 0 && percentage < 100 && (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
          </div>
        )}
      </div>

      {/* Status Message */}
      {showDetails && size !== 'sm' && (
        <div className={`${sizeClasses.text} text-gray-500 dark:text-gray-400`}>
          {percentage === 100 
            ? '🎉 Project completed!'
            : percentage === 0
            ? '🚀 Ready to start'
            : `${total - completed} tasks remaining`
          }
        </div>
      )}
    </div>
  );
};

export default ProjectProgressBar;
