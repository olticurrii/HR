import React, { useState, useEffect } from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { performanceService } from '../../services/performanceService';

interface TopPerformerBadgeProps {
  userId: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const TopPerformerBadge: React.FC<TopPerformerBadgeProps> = ({
  userId,
  showDetails = false,
  size = 'md'
}) => {
  const [badge, setBadge] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadge();
  }, [userId]);

  const loadBadge = async () => {
    try {
      setLoading(true);
      const data = await performanceService.getTopPerformerBadge(userId);
      setBadge(data);
    } catch (err: any) {
      // Silently fail if module is disabled (403) or other errors
      // Don't show error to user - just don't display badge
      if (err.response?.status !== 403) {
        console.error('Failed to load top performer badge:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || !badge || !badge.has_badge) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (showDetails) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Award className="w-12 h-12 text-yellow-500" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              Top Performer
              <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                {badge.score?.toFixed(1)}%
              </span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Performance score exceeds the {badge.threshold}% threshold
            </p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
              Based on recent review scores
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold rounded-full ${sizeClasses[size]}`}>
      <Award className={iconSizes[size]} />
      Top Performer
    </span>
  );
};

export default TopPerformerBadge;

