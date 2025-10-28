import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, TrendingUp, Trophy } from 'lucide-react';
import { performanceService, TopPerformerBadge as TopPerformerBadgeType } from '../../services/performanceService';

interface TopPerformerBadgeProps {
  userId: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const TopPerformerBadge: React.FC<TopPerformerBadgeProps> = ({ 
  userId, 
  size = 'md', 
  showDetails = false 
}) => {
  const [badgeData, setBadgeData] = useState<TopPerformerBadgeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBadgeData();
  }, [userId]);

  const loadBadgeData = async () => {
    try {
      setLoading(true);
      const data = await performanceService.getTopPerformerBadge(userId);
      setBadgeData(data);
    } catch (err) {
      console.error('Failed to load top performer badge:', err);
      setError('Failed to load badge data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center ${getSizeClasses(size).container}`}>
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full ${getSizeClasses(size).icon}`}></div>
        {showDetails && (
          <div className="ml-2">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded"></div>
          </div>
        )}
      </div>
    );
  }

  if (error || !badgeData) {
    return null;
  }

  if (!badgeData.has_badge) {
    return showDetails ? (
      <div className={`inline-flex items-center ${getSizeClasses(size).container}`}>
        <TrendingUp className={`text-gray-400 ${getSizeClasses(size).icon}`} />
        <div className="ml-2 text-gray-500 dark:text-gray-400">
          <div className={`font-medium ${getSizeClasses(size).text}`}>
            {badgeData.score?.toFixed(1) || 0}% Performance
          </div>
          <div className={`text-xs opacity-75`}>
            Goal: {badgeData.threshold}%
          </div>
        </div>
      </div>
    ) : null;
  }

  const getBadgeIcon = () => {
    if (badgeData.rank && badgeData.rank <= 3) {
      return Trophy;
    }
    if (badgeData.percentile && badgeData.percentile >= 95) {
      return Star;
    }
    return Award;
  };

  const getBadgeColor = () => {
    if (badgeData.rank && badgeData.rank <= 3) {
      switch (badgeData.rank) {
        case 1: return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
        case 2: return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
        case 3: return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
        default: return 'text-primary bg-blue-100 dark:bg-blue-900/30';
      }
    }
    if (badgeData.percentile && badgeData.percentile >= 95) {
      return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
    }
    return 'text-green-600 bg-green-100 dark:bg-green-900/30';
  };

  const BadgeIcon = getBadgeIcon();

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={`inline-flex items-center ${getSizeClasses(size).container}`}
    >
      <motion.div
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut"
        }}
        className={`flex items-center justify-center rounded-full ${getBadgeColor()} ${getSizeClasses(size).badge}`}
      >
        <BadgeIcon className={`${getSizeClasses(size).icon}`} />
      </motion.div>
      
      {showDetails && (
        <div className="ml-2">
          <div className={`font-medium text-gray-900 dark:text-white ${getSizeClasses(size).text}`}>
            Top Performer
          </div>
          <div className={`text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2`}>
            {badgeData.score && (
              <span>{badgeData.score.toFixed(1)}% Score</span>
            )}
            {badgeData.rank && (
              <span>Rank #{badgeData.rank}</span>
            )}
            {badgeData.percentile && (
              <span>{badgeData.percentile}th percentile</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

function getSizeClasses(size: 'sm' | 'md' | 'lg') {
  switch (size) {
    case 'sm':
      return {
        container: 'text-sm',
        badge: 'w-6 h-6',
        icon: 'w-3 h-3',
        text: 'text-sm'
      };
    case 'lg':
      return {
        container: 'text-lg',
        badge: 'w-12 h-12',
        icon: 'w-6 h-6',
        text: 'text-lg'
      };
    default: // md
      return {
        container: 'text-base',
        badge: 'w-8 h-8',
        icon: 'w-4 h-4',
        text: 'text-base'
      };
  }
}

export default TopPerformerBadge;
