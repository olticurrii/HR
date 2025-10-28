import React, { useState, useEffect } from 'react';
import { employeeProfileService, Objective } from '../../../services/employeeProfileService';
import { useAuth } from '../../../contexts/AuthContext';

interface ObjectivesPanelProps {
  userId: number;
}

export const ObjectivesPanel: React.FC<ObjectivesPanelProps> = ({ userId }) => {
  const { user: currentUser } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'closed' | 'archived' | 'all'>('active');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadObjectives();
  }, [userId, filter]);

  const loadObjectives = async () => {
    try {
      setLoading(true);
      const data = await employeeProfileService.getObjectives(userId, filter === 'all' ? undefined : filter);
      setObjectives(data);
      // Auto-expand all by default
      setExpandedIds(new Set(data.map(obj => obj.id)));
    } catch (error) {
      console.error('Error loading objectives:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (objId: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(objId)) {
      newExpanded.delete(objId);
    } else {
      newExpanded.add(objId);
    }
    setExpandedIds(newExpanded);
  };

  const updateKRProgress = async (krId: number, newValue: number) => {
    try {
      await employeeProfileService.updateKeyResult(krId, { current_value: newValue });
      await loadObjectives();
    } catch (error) {
      console.error('Error updating key result:', error);
      alert('Failed to update progress');
    }
  };

  const totalProgress = objectives.length > 0
    ? Math.round(objectives.reduce((sum, obj) => sum + obj.progress, 0) / objectives.length)
    : 0;

  const canEdit = currentUser?.is_admin || currentUser?.id === userId;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-primary-200';
      case 'open': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">Loading objectives...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Total Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900">Total Progress</h3>
          <span className="text-2xl font-medium text-primary">{totalProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          {(['active', 'closed', 'archived', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Objectives List */}
      {objectives.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No objectives found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {objectives.map((objective) => (
            <div key={objective.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Objective Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-medium text-gray-900">{objective.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(objective.status)}`}>
                        {objective.status.toUpperCase()}
                      </span>
                    </div>
                    {objective.description && (
                      <p className="text-gray-600">{objective.description}</p>
                    )}
                    {objective.due_date && (
                      <p className="text-sm text-gray-500 mt-2">
                        Due: {new Date(objective.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleExpand(objective.id)}
                    className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${expandedIds.has(objective.id) ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Objective Progress */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all duration-500"
                      style={{ width: `${objective.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 min-w-[50px] text-right">
                    {Math.round(objective.progress)}%
                  </span>
                </div>
              </div>

              {/* Key Results (Expandable) */}
              {expandedIds.has(objective.id) && objective.key_results.length > 0 && (
                <div className="p-6 space-y-3 bg-gray-50">
                  <h5 className="font-medium text-gray-700 mb-4">Key Results</h5>
                  {objective.key_results.map((kr) => (
                    <div key={kr.id} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(kr.status)}`}>
                              KR
                            </span>
                            <span className="font-medium text-gray-900">{kr.title}</span>
                          </div>
                          {kr.target_value && (
                            <p className="text-sm text-gray-600">
                              Target: {kr.target_value} {kr.unit || ''} | Current: {kr.current_value} {kr.unit || ''}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-medium text-primary ml-4">
                          {Math.round(kr.progress)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary-500 h-full transition-all duration-300"
                            style={{ width: `${kr.progress}%` }}
                          />
                        </div>
                        {canEdit && kr.target_value && (
                          <input
                            type="number"
                            value={kr.current_value}
                            onChange={(e) => updateKRProgress(kr.id, parseFloat(e.target.value) || 0)}
                            className="w-24 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary"
                            step="0.1"
                            min="0"
                            max={kr.target_value}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

