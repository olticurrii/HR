import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { performanceService } from '../../services/performanceService';

interface GoalProgressUpdaterProps {
  goalId: number;
  currentProgress: number;
  onProgressUpdated: () => void;
}

const GoalProgressUpdater: React.FC<GoalProgressUpdaterProps> = ({
  goalId,
  currentProgress,
  onProgressUpdated,
}) => {
  const [progress, setProgress] = useState(currentProgress);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    if (progress === currentProgress) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await performanceService.updateGoal(goalId, { progress });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setIsEditing(false);
      onProgressUpdated();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProgress(currentProgress);
    setIsEditing(false);
    setError(null);
  };

  const getProgressColor = () => {
    if (progress >= 90) return 'bg-green-500 dark:bg-green-400';
    if (progress >= 70) return 'bg-primary-500 dark:bg-blue-400';
    if (progress >= 50) return 'bg-yellow-500 dark:bg-yellow-400';
    return 'bg-red-500 dark:bg-red-400';
  };

  const getProgressTextColor = () => {
    if (progress >= 90) return 'text-green-600 dark:text-green-400';
    if (progress >= 70) return 'text-primary dark:text-blue-400';
    if (progress >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-3">
      {/* Progress Display */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
        <div className="flex items-center space-x-2">
          {success && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-green-500"
            >
              <CheckCircle className="w-4 h-4" />
            </motion.div>
          )}
          <span className={`text-sm font-medium ${getProgressTextColor()}`}>
            {Math.round(progress)}%
          </span>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-primary hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium"
            >
              Update
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full ${getProgressColor()}`}
        />
      </div>

      {/* Editing Interface */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-primary-50 dark:bg-blue-900/20 border border-primary-200 dark:border-blue-800 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Update Progress
            </span>
          </div>

          {/* Progress Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>0%</span>
              <span className="font-medium text-primary dark:text-blue-400">
                {Math.round(progress)}%
              </span>
              <span>100%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, ${
                  progress >= 90 ? '#10b981' :
                  progress >= 70 ? '#3b82f6' :
                  progress >= 50 ? '#f59e0b' : '#ef4444'
                } 0%, ${
                  progress >= 90 ? '#10b981' :
                  progress >= 70 ? '#3b82f6' :
                  progress >= 50 ? '#f59e0b' : '#ef4444'
                } ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
              }}
            />
          </div>

          {/* Quick Progress Buttons */}
          <div className="flex space-x-2">
            {[25, 50, 75, 100].map((value) => (
              <button
                key={value}
                onClick={() => setProgress(value)}
                className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                  progress === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {value}%
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start space-x-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-primary-200 dark:border-blue-700">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading || progress === currentProgress}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GoalProgressUpdater;
