import React, { useState, useEffect } from 'react';
import { employeeProfileService } from '../../../services/employeeProfileService';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface PerformanceSummaryProps {
  userId: number;
}

export const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ userId }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    loadMetrics();
  }, [userId, period]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await employeeProfileService.getPerformanceMetrics(userId, period);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading performance summary...</div>;
  }

  if (!metrics) {
    return <div className="p-6 text-red-500">Failed to load performance metrics</div>;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Overall Performance Score */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Overall Performance Score</h3>
            <div className="mt-2">
              <span className="text-5xl font-bold">{metrics.overall_score}</span>
              <span className="text-2xl ml-1 opacity-75">/100</span>
            </div>
            <p className="mt-2 text-sm opacity-75">
              Based on {period} days of task and project activity
            </p>
          </div>
          {metrics.overall_score >= 70 ? (
            <TrendingUp className="w-16 h-16 opacity-50" />
          ) : (
            <TrendingDown className="w-16 h-16 opacity-50" />
          )}
        </div>
      </div>

      {/* Task Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Task Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{metrics.task_metrics.total_tasks}</div>
            <div className="text-sm text-gray-600 mt-1">Total Tasks</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-3xl font-bold text-green-600">{metrics.task_metrics.completed}</div>
            <div className="text-sm text-gray-600 mt-1">Completed</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{metrics.task_metrics.in_progress}</div>
            <div className="text-sm text-gray-600 mt-1">In Progress</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-3xl font-bold text-red-600">{metrics.task_metrics.overdue}</div>
            <div className="text-sm text-gray-600 mt-1">Overdue</div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Completion Rate</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full border ${getScoreColor(metrics.task_metrics.completion_rate)}`}>
              {metrics.task_metrics.completion_rate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${metrics.task_metrics.completion_rate}%` }}
            />
          </div>
        </div>

        {/* On-Time Completion */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">On-Time Completion</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full border ${getScoreColor(metrics.task_metrics.on_time_completion_rate)}`}>
              {metrics.task_metrics.on_time_completion_rate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${metrics.task_metrics.on_time_completion_rate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Project Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Project Involvement</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-3xl font-bold text-purple-600">{metrics.project_metrics.total_projects}</div>
            <div className="text-sm text-gray-600 mt-1">Total Projects</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-3xl font-bold text-green-600">{metrics.project_metrics.completed}</div>
            <div className="text-sm text-gray-600 mt-1">Completed</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{metrics.project_metrics.active}</div>
            <div className="text-sm text-gray-600 mt-1">Active</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {metrics.insights && metrics.insights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Insights</h3>
          <div className="space-y-3">
            {metrics.insights.map((insight: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div>
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
        <strong>Note:</strong> Performance metrics are automatically calculated from your task and project activity. 
        Complete tasks on time and stay involved in projects to improve your score!
      </div>
    </div>
  );
};

