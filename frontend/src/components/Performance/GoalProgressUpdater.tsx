import React, { useState } from 'react';
import { TrendingUp, Save, X } from 'lucide-react';
import { performanceService } from '../../services/performanceService';

interface GoalProgressUpdaterProps {
  goalId: number;
  currentProgress: number;
  onProgressUpdated: () => void;
}

const GoalProgressUpdater: React.FC<GoalProgressUpdaterProps> = ({
  goalId,
  currentProgress,
  onProgressUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(currentProgress);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await performanceService.updateGoal(goalId, { progress });
      setIsEditing(false);
      onProgressUpdated();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update progress');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProgress(currentProgress);
    setIsEditing(false);
    setError(null);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium">Progress</span>
            <span className="text-gray-900 font-semibold">{currentProgress.toFixed(0)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(currentProgress, 100)}%` }}
            ></div>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md font-medium"
        >
          Update
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Update Progress: {progress.toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={progress}
          onChange={(e) => setProgress(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-3">
        <div className="bg-white rounded p-2">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || progress === currentProgress}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </>
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GoalProgressUpdater;

