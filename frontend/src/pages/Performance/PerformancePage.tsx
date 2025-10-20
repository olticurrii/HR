import React, { useState, useEffect } from 'react';
import { Target, Plus, TrendingUp, Award, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { performanceService } from '../../services/performanceService';
import { usePerformanceSettings } from '../../hooks/usePerformanceSettings';
import GoalCreationModal from '../../components/Performance/GoalCreationModal';
import GoalProgressUpdater from '../../components/Performance/GoalProgressUpdater';
import KpiRecordModalEnhanced from '../../components/Performance/KpiRecordModalEnhanced';
import KpiTrendChart from '../../components/Performance/KpiTrendChart';
import AutoCalculatedKpis from '../../components/Performance/AutoCalculatedKpis';
import TopPerformerBadge from '../../components/Performance/TopPerformerBadge';
import MonthlyReportView from '../../components/Performance/MonthlyReportView';
import { authService } from '../../services/authService';

const PerformancePage: React.FC = () => {
  const perfSettings = usePerformanceSettings();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showKpiModal, setShowKpiModal] = useState(false);
  const [kpiRefreshKey, setKpiRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'my-goals' | 'approvals' | 'kpi' | 'reports'>('my-goals');

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadGoals();
      loadPendingApprovals();
    }
  }, [currentUser]);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await performanceService.getGoals();
      setGoals(data);
    } catch (err) {
      console.error('Failed to load goals:', err);
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingApprovals = async () => {
    try {
      const data = await performanceService.getPendingApprovals();
      setPendingApprovals(data);
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    }
  };

  const handleApprove = async (goalId: number) => {
    try {
      await performanceService.approveGoal(goalId);
      await loadPendingApprovals();
      await loadGoals();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve goal');
    }
  };

  const handleReject = async (goalId: number) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await performanceService.rejectGoal(goalId, reason);
      await loadPendingApprovals();
      await loadGoals();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reject goal');
    }
  };

  const getStatusBadge = (goal: any) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      active: 'bg-blue-100 text-blue-700',
      closed: 'bg-gray-100 text-gray-700',
      archived: 'bg-gray-50 text-gray-500',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[goal.approval_status] || statusColors[goal.status] || 'bg-gray-100 text-gray-700'}`}>
        {goal.approval_status !== 'approved' ? goal.approval_status : goal.status}
      </span>
    );
  };

  if (perfSettings.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!perfSettings.isModuleEnabled) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-900">Performance Module Disabled</h2>
          <p className="text-gray-600 mt-2">
            The performance module is currently disabled by your administrator.
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-blue-600" />
              Performance Management
            </h1>
            <p className="text-gray-600 mt-1">Track goals, KPIs, and performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <TopPerformerBadge userId={currentUser.id} size="md" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('my-goals')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-goals'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            My Goals
          </button>
          
          {(currentUser.is_admin || currentUser.role === 'admin' || currentUser.role === 'manager') && (
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-3 px-1 border-b-2 font-medium text-sm relative ${
                activeTab === 'approvals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Pending Approvals
              {pendingApprovals.length > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
          )}

          {perfSettings.showKpiTrends && (
            <button
              onClick={() => setActiveTab('kpi')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'kpi'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              KPI Trends
            </button>
          )}

          {perfSettings.monthlyReports && (currentUser.is_admin || currentUser.role === 'admin') && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Monthly Reports
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      <div>
        {/* My Goals Tab */}
        {activeTab === 'my-goals' && (
          <div>
            {/* Header with Create Button */}
            {perfSettings.allowSelfGoals && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Goal
                </button>
              </div>
            )}

            {/* Goals List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 text-lg font-medium">No goals yet</p>
                {perfSettings.allowSelfGoals && (
                  <p className="text-gray-500 text-sm mt-2">Create your first performance goal to get started</p>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                          {getStatusBadge(goal)}
                        </div>
                        {goal.description && (
                          <p className="text-gray-600 text-sm mt-2">{goal.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Progress Updater */}
                    <div className="mb-3">
                      {goal.approval_status === 'approved' && goal.status === 'active' ? (
                        <GoalProgressUpdater
                          goalId={goal.id}
                          currentProgress={goal.progress || 0}
                          onProgressUpdated={loadGoals}
                        />
                      ) : (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 font-medium">Progress</span>
                            <span className="text-gray-900 font-semibold">{goal.progress.toFixed(0)}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(goal.progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {goal.due_date && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Due: {new Date(goal.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span>
                        Created: {new Date(goal.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Approval Info */}
                    {goal.approval_status === 'pending' && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                        <p className="text-sm text-yellow-800">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Waiting for manager approval
                        </p>
                      </div>
                    )}

                    {goal.approval_status === 'rejected' && goal.rejection_reason && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded px-3 py-2">
                        <p className="text-sm text-red-800 font-medium">
                          <XCircle className="w-4 h-4 inline mr-1" />
                          Rejected
                        </p>
                        <p className="text-sm text-red-700 mt-1">{goal.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending Approvals Tab */}
        {activeTab === 'approvals' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Goals Pending Approval</h2>
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">No pending approvals</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingApprovals.map((goal) => (
                  <div key={goal.id} className="bg-white border border-yellow-200 rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        </div>
                        {goal.description && (
                          <p className="text-gray-600 text-sm mt-2">{goal.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Goal Owner Info */}
                    <div className="text-sm text-gray-600 mb-3">
                      Created by employee on {new Date(goal.created_at).toLocaleDateString()}
                    </div>

                    {/* Approval Actions */}
                    <div className="flex gap-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleApprove(goal.id)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(goal.id)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KPI Trends Tab */}
        {activeTab === 'kpi' && perfSettings.showKpiTrends && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">KPI Tracking</h2>
              <button
                onClick={() => setShowKpiModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record Custom KPI
              </button>
            </div>

            {/* Auto-Calculated KPIs Section */}
            <div className="mb-8">
              <AutoCalculatedKpis
                userId={currentUser.id}
                onRecordKpi={() => setKpiRefreshKey(prev => prev + 1)}
              />
            </div>

            {/* Historical Trends Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Historical Trends</h3>
                <p className="text-sm text-gray-600">Track your KPIs over time</p>
              </div>
              <KpiTrendChart key={kpiRefreshKey} userId={currentUser.id} days={90} />
            </div>
          </div>
        )}

        {/* Monthly Reports Tab */}
        {activeTab === 'reports' && perfSettings.monthlyReports && (
          <div>
            <MonthlyReportView />
          </div>
        )}
      </div>

      {/* Goal Creation Modal */}
      {perfSettings.allowSelfGoals && (
        <GoalCreationModal
          isOpen={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          onGoalCreated={() => {
            loadGoals();
            loadPendingApprovals();
          }}
          userId={currentUser.id}
          requireApproval={perfSettings.requireGoalApproval}
        />
      )}

      {/* KPI Recording Modal */}
      {perfSettings.showKpiTrends && (
        <KpiRecordModalEnhanced
          isOpen={showKpiModal}
          onClose={() => setShowKpiModal(false)}
          onKpiRecorded={() => {
            setKpiRefreshKey(prev => prev + 1); // Force refresh of chart
          }}
          userId={currentUser.id}
        />
      )}
    </div>
  );
};

export default PerformancePage;

