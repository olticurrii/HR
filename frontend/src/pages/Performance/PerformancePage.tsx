import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { useQuery } from 'react-query';
import { performanceService, Goal } from '../../services/performanceService';
import { usePerformanceSettings } from '../../hooks/usePerformanceSettings';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Import our new redesigned components
import PerformanceStats from '../../components/Performance/PerformanceStats';
import PerformanceTabs from '../../components/Performance/PerformanceTabs';
import GoalsList from '../../components/Performance/GoalsList';
import FiltersBar from '../../components/Performance/FiltersBar';
import KPITrends from '../../components/Performance/KPITrends';
import MonthlyReportView from '../../components/Performance/MonthlyReportView';

// Import existing modals (we'll keep the existing ones for now)
import GoalCreationModal from '../../components/Performance/GoalCreationModal';
import GoalProgressUpdater from '../../components/Performance/GoalProgressUpdater';
import KpiRecordModalEnhanced from '../../components/Performance/KpiRecordModalEnhanced';
import TopPerformerBadge from '../../components/Performance/TopPerformerBadge';

interface FilterState {
  search: string;
  status: 'all' | 'active' | 'completed' | 'pending' | 'overdue';
  sortBy: 'created_at' | 'due_date' | 'progress' | 'title';
  sortOrder: 'asc' | 'desc';
}

const PerformancePage: React.FC = () => {
  const { user } = useAuth();
  const perfSettings = usePerformanceSettings();
  const [activeTab, setActiveTab] = useState<'my-goals' | 'pending-approvals' | 'kpi-trends' | 'monthly-reports'>('my-goals');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Fetch goals with React Query
  const {
    data: goals = [],
    isLoading: goalsLoading,
    error: goalsError,
    refetch: refetchGoals
  } = useQuery(
    'performance-goals',
    () => performanceService.getGoals(),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Error loading goals:', error);
        toast.error('Failed to load goals');
      }
    }
  );

  // Fetch pending approvals
  const {
    data: pendingApprovals = [],
    refetch: refetchApprovals
  } = useQuery(
    'performance-approvals',
    performanceService.getPendingApprovals,
    {
      enabled: user?.role === 'admin' || user?.role === 'manager' || user?.is_admin,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // 2 minutes
      onError: (error) => {
        console.error('Error loading pending approvals:', error);
      }
    }
  );

  // Filter and sort goals
  const filteredGoals = useMemo(() => {
    let filtered = [...goals];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(searchLower) ||
        goal.description?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      const now = new Date();
      filtered = filtered.filter(goal => {
        switch (filters.status) {
          case 'active':
            return goal.status === 'active' && goal.approval_status === 'approved';
          case 'completed':
            return goal.status === 'closed' || goal.progress >= 100;
          case 'pending':
            return goal.approval_status === 'pending';
          case 'overdue':
            return goal.due_date && new Date(goal.due_date) < now && goal.status !== 'closed';
          default:
            return true;
        }
      });
    }

    // Sort goals
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Goal];
      let bValue: any = b[filters.sortBy as keyof Goal];

      if (filters.sortBy === 'due_date' || filters.sortBy === 'created_at') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (filters.sortBy === 'progress') {
        aValue = a.progress || 0;
        bValue = b.progress || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [goals, filters]);

  // Performance statistics
  const performanceStats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'closed' || g.progress >= 100).length;
    const averageProgress = total > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / total) : 0;
    const pending = pendingApprovals.length;

    return {
      totalGoals: total,
      completedGoals: completed,
      averageProgress,
      pendingApprovals: pending
    };
  }, [goals, pendingApprovals]);

  const handleApprove = async (goalId: number) => {
    try {
      await performanceService.approveGoal(goalId);
      toast.success('Goal approved successfully');
      refetchApprovals();
      refetchGoals();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to approve goal');
    }
  };

  const handleReject = async (goalId: number) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await performanceService.rejectGoal(goalId, reason);
      toast.success('Goal rejected');
      refetchApprovals();
      refetchGoals();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to reject goal');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const handleGoalUpdate = (goal: Goal) => {
    // Handle goal update - could navigate to edit page or open modal
    console.log('Update goal:', goal);
  };

  if (perfSettings.loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{
          backgroundColor: '#E5E7EB',
          height: '192px',
          borderRadius: '24px',
          marginBottom: '32px',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
        }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#E5E7EB',
                height: '128px',
                borderRadius: '16px',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!perfSettings.isModuleEnabled) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #FDE68A',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
        }}
      >
        <AlertCircle style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 16px',
          color: '#F59E0B',
        }} />
        <h2 style={{
          fontSize: '20px',
          fontWeight: '500',
          color: '#111827',
          marginBottom: '8px',
          fontFamily: "'Outfit', sans-serif",
        }}>
          Performance Module Disabled
        </h2>
        <p style={{
          color: '#6B7280',
          fontFamily: "'Outfit', sans-serif",
        }}>
          The performance module is currently disabled by your administrator.
        </p>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '256px',
      }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '3px solid #E5E7EB',
            borderTopColor: '#2563EB',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
          borderRadius: '24px',
          padding: '32px',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
        }} />
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-24px',
          left: '-24px',
          width: '128px',
          height: '128px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
        }} />
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'Outfit', sans-serif",
              }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp style={{ width: '32px', height: '32px', marginRight: '12px' }} />
                  Performance Management
                </span>
                <span style={{
                  borderBottom: '3px solid #F97316',
                  width: '60px',
                  marginTop: '8px',
                  borderRadius: '2px',
                }} />
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px',
                fontWeight: '400',
                fontFamily: "'Outfit', sans-serif",
              }}>
                Track goals, KPIs, and performance metrics
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {/* Quick Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                textAlign: 'center',
              }}>
                <div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '500',
                    color: '#FFFFFF',
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {performanceStats.totalGoals}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    Total Goals
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '500',
                    color: '#FFFFFF',
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {performanceStats.completedGoals}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    Completed
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '500',
                    color: '#FFFFFF',
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {performanceStats.averageProgress}%
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    Avg Progress
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '500',
                    color: '#FFFFFF',
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {performanceStats.pendingApprovals}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    Pending
                  </div>
                </div>
              </div>

              {/* Top Performer Badge & Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end' }}>
                <TopPerformerBadge userId={user.id} size="md" />
                {perfSettings.allowSelfGoals && (
                  <button
                    onClick={() => setShowGoalModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 24px',
                      backgroundColor: '#F97316',
                      color: '#FFFFFF',
                      fontWeight: '500',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontFamily: "'Outfit', sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#EA580C';
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F97316';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <Plus style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                    New Goal
                  </button>
                )}
              </div>
          </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <PerformanceStats stats={performanceStats} loading={goalsLoading} />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <PerformanceTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={pendingApprovals.length}
          showApprovals={user?.role === 'admin' || user?.role === 'manager' || user?.is_admin}
          showKpiTrends={perfSettings.showKpiTrends}
          showReports={perfSettings.monthlyReports && (user?.is_admin || user?.role === 'admin')}
        />
      </motion.div>

      {/* Filters - Only show for My Goals tab */}
      {activeTab === 'my-goals' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <FiltersBar
            searchQuery={filters.search}
            onSearchChange={(search: string) => setFilters(prev => ({ ...prev, search }))}
            statusFilter={filters.status}
            onStatusFilterChange={(status: 'all' | 'active' | 'completed' | 'pending' | 'overdue') => setFilters(prev => ({ ...prev, status }))}
            sortBy={filters.sortBy}
            onSortByChange={(sortBy: 'created_at' | 'due_date' | 'progress' | 'title') => setFilters(prev => ({ ...prev, sortBy }))}
            sortOrder={filters.sortOrder}
            onSortOrderChange={(sortOrder: 'asc' | 'desc') => setFilters(prev => ({ ...prev, sortOrder }))}
            onClearFilters={clearFilters}
            resultCount={filteredGoals.length}
            totalCount={goals.length}
          />
        </motion.div>
      )}

      {/* Results Summary */}
      {activeTab === 'my-goals' && filteredGoals.length !== goals.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#DBEAFE',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 style={{ width: '20px', height: '20px', color: '#2563EB' }} />
            <span style={{
              color: '#1E40AF',
              fontWeight: '500',
              fontSize: '14px',
              fontFamily: "'Outfit', sans-serif",
            }}>
              Showing {filteredGoals.length} of {goals.length} goals
            </span>
          </div>
          <button
            onClick={clearFilters}
            style={{
              color: '#2563EB',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1D4ED8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}
          >
            Clear filters to see all
          </button>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        {/* My Goals Tab */}
        {activeTab === 'my-goals' && (
          <GoalsList
            goals={filteredGoals}
            loading={goalsLoading}
            onGoalUpdated={() => refetchGoals()}
            emptyStateTitle={
              filters.search || filters.status !== 'all'
                ? "No goals match your filters"
                : "No goals yet"
            }
            emptyStateDescription={
              filters.search || filters.status !== 'all'
                ? "Try adjusting your search criteria or filters to find more goals."
                : "Create your first performance goal to start tracking progress."
            }
            showCreateButton={perfSettings.allowSelfGoals && !(filters.search || filters.status !== 'all')}
            onCreateNewGoal={() => setShowGoalModal(true)}
          />
        )}

        {/* Pending Approvals Tab */}
        {activeTab === 'pending-approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#111827',
              fontFamily: "'Outfit', sans-serif",
            }}>
              Goals Pending Approval
            </h2>
            <GoalsList
              goals={pendingApprovals}
              loading={false}
              emptyStateTitle="No pending approvals"
              emptyStateDescription="All goals have been reviewed. New submissions will appear here."
              showCreateButton={false}
            />
            
            {/* Approval Actions for Pending Goals */}
            {pendingApprovals.length > 0 && (
              <div style={{ display: 'grid', gap: '24px' }}>
                {pendingApprovals.map((goal) => (
                  <motion.div
                    key={`approval-${goal.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      backgroundColor: '#FEF3C7',
                      border: '1px solid #FDE68A',
                      borderRadius: '16px',
                      padding: '24px',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}>
                      <h3 style={{
                        fontWeight: '500',
                        color: '#111827',
                        fontFamily: "'Outfit', sans-serif",
                      }}>
                        {goal.title}
                      </h3>
                      <span style={{
                        padding: '4px 12px',
                        backgroundColor: '#FBBF24',
                        color: '#92400E',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '500',
                        fontFamily: "'Outfit', sans-serif",
                      }}>
                        Pending Review
                      </span>
                    </div>

                    <p style={{
                      color: '#6B7280',
                      fontSize: '14px',
                      marginBottom: '16px',
                      fontFamily: "'Outfit', sans-serif",
                    }}>
                      Created on {new Date(goal.created_at).toLocaleDateString()}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleApprove(goal.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 16px',
                          backgroundColor: '#10B981',
                          color: '#FFFFFF',
                          borderRadius: '12px',
                          fontWeight: '500',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: "'Outfit', sans-serif",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
                      >
                        <Target style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleReject(goal.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 16px',
                          backgroundColor: '#EF4444',
                          color: '#FFFFFF',
                          borderRadius: '12px',
                          fontWeight: '500',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: "'Outfit', sans-serif",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
                      >
                        <AlertCircle style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                        Reject
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KPI Trends Tab */}
        {activeTab === 'kpi-trends' && perfSettings.showKpiTrends && (
          <KPITrends userId={user.id} days={90} />
        )}

        {/* Monthly Reports Tab */}
        {activeTab === 'monthly-reports' && perfSettings.monthlyReports && (
          <MonthlyReportView />
        )}
      </motion.div>

      {/* Goal Creation Modal */}
      {perfSettings.allowSelfGoals && (
        <GoalCreationModal
          isOpen={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          onGoalCreated={() => {
            refetchGoals();
            refetchApprovals();
            toast.success('Goal created successfully!');
          }}
          userId={user.id}
          requireApproval={perfSettings.requireGoalApproval}
        />
      )}

      {/* KPI system is now fully automated - no manual recording modal needed */}
    </div>
  );
};

export default PerformancePage;