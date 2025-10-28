import React, { useEffect, useState } from 'react';
import { PerformanceSummary } from '../../services/profileService';

interface PerformanceCardProps {
  onGetPerformance: (windowDays: number) => Promise<PerformanceSummary>;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ onGetPerformance }) => {
  const [performance, setPerformance] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [windowDays, setWindowDays] = useState(180);

  useEffect(() => {
    loadPerformance();
  }, [windowDays]);

  const loadPerformance = async () => {
    setLoading(true);
    try {
      const data = await onGetPerformance(windowDays);
      setPerformance(data);
    } catch (error) {
      console.error('Failed to load performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-accent-100 text-accent-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-medium mb-6">Performance Summary</h2>
        <p className="text-gray-500">Loading performance data...</p>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-medium mb-6">Performance Summary</h2>
        <p className="text-gray-500">Failed to load performance data.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Performance Summary</h2>
        <select
          value={windowDays}
          onChange={(e) => setWindowDays(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={180}>Last 180 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* KPIs Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Key Performance Indicators</h3>
        {performance.kpis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performance.kpis.map((kpi, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">{kpi.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-medium text-gray-900">
                    {kpi.value}
                    {kpi.unit && <span className="text-lg ml-1">{kpi.unit}</span>}
                  </p>
                  {kpi.delta !== null && kpi.delta !== undefined && (
                    <span
                      className={`ml-2 text-sm ${
                        kpi.delta >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {kpi.delta >= 0 ? '↑' : '↓'} {Math.abs(kpi.delta)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No KPIs available</p>
        )}
      </div>

      {/* Goals Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">My Goals</h3>
        {performance.goals.length > 0 ? (
          <div className="space-y-3">
            {performance.goals.map((goal) => (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{goal.title}</h4>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                      goal.status
                    )}`}
                  >
                    {goal.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{goal.progress}% complete</span>
                  {goal.due_date && (
                    <span>Due: {formatDate(goal.due_date)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No active goals</p>
        )}
      </div>

      {/* Last Review Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Last Review</h3>
        {performance.last_review ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-600">
                  Reviewed by:{' '}
                  {performance.last_review.reviewer?.full_name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(performance.last_review.date)}
                </p>
              </div>
              {performance.last_review.rating && (
                <div className="flex items-center">
                  <span className="text-2xl font-medium text-gray-900">
                    {performance.last_review.rating}
                  </span>
                  <span className="text-sm text-gray-600 ml-1">/5</span>
                </div>
              )}
            </div>
            {performance.last_review.comment && (
              <p className="text-sm text-gray-700 mt-2">
                {performance.last_review.comment}
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No reviews yet</p>
        )}
      </div>

      {/* Trend Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Performance Trend</h3>
        {performance.trend.length > 0 ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-end h-32 space-x-1">
              {performance.trend.map((point, index) => {
                const maxScore = 5;
                const heightPercent = (point.score / maxScore) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary-500 rounded-t"
                      style={{ height: `${heightPercent}%` }}
                      title={`${formatDate(point.date)}: ${point.score}`}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>
                {performance.trend.length > 0
                  ? formatDate(performance.trend[0].date)
                  : ''}
              </span>
              <span>
                {performance.trend.length > 0
                  ? formatDate(performance.trend[performance.trend.length - 1].date)
                  : ''}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No trend data available</p>
        )}
      </div>
    </div>
  );
};

export default PerformanceCard;

