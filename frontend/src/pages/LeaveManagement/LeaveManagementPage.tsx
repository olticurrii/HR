import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  X,
  FileText,
  Edit,
  Grid3x3,
  List,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { leaveService, LeaveType, LeaveBalance, LeaveRequest, LeaveBalanceSummary } from '../../services/leaveService';
import toast from 'react-hot-toast';

// Import our new modular components
import LeaveHeader from '../../components/leave-management/LeaveHeader';
import LeaveSummaryCards from '../../components/leave-management/LeaveSummaryCards';
import LeaveTabs from '../../components/leave-management/LeaveTabs';
import LeaveTable from '../../components/leave-management/LeaveTable';
import LeaveModal, { LeaveFormData } from '../../components/leave-management/LeaveModal';
import EmptyState from '../../components/leave-management/EmptyState';
import LeaveBalanceBreakdown from '../../components/leave-management/LeaveBalanceBreakdown';

const LeaveManagementPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-leaves' | 'team-leaves'>('my-leaves');
  
  // State
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalanceSummary | null>(null);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [teamRequests, setTeamRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  
  // View preferences
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditBalanceModal, setShowEditBalanceModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null);

  const [editBalanceData, setEditBalanceData] = useState({
    total_days: 0,
  });

  const isManagerOrAdmin = hasRole(['admin', 'manager']);
  const isAdmin = hasRole(['admin']);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [types, balanceData, requests] = await Promise.all([
        leaveService.getLeaveTypes(),
        leaveService.getMyLeaveBalances(),
        leaveService.getMyLeaveRequests(),
      ]);
      
      setLeaveTypes(types);
      setBalances(balanceData);
      setMyRequests(requests);
      
      if (activeTab === 'team-leaves' && isManagerOrAdmin) {
        const team = await leaveService.getAllLeaveRequests();
        setTeamRequests(team);
      }
    } catch (error: any) {
      console.error('Error fetching leave data:', error);
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (data: LeaveFormData) => {
    try {
      await leaveService.createLeaveRequest({
        leave_type_id: data.leave_type_id,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
      });
      
      toast.success('Leave request submitted successfully!');
      setShowRequestModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit request');
      throw error; // Re-throw to let the modal handle the error state
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      await leaveService.reviewLeaveRequest(requestId, { status: 'approved' });
      toast.success('Request approved successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId: number) => {
    const comments = prompt('Enter rejection reason (optional):');
    if (comments === null) return; // User cancelled
    
    try {
      await leaveService.reviewLeaveRequest(requestId, { status: 'rejected', review_comments: comments });
      toast.success('Request rejected successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to reject request');
    }
  };

  const handleCancel = async (requestId: number) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    
    try {
      await leaveService.cancelLeaveRequest(requestId);
      toast.success('Request cancelled successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to cancel request');
    }
  };

  const handleEditBalance = (balance: LeaveBalance) => {
    setSelectedBalance(balance);
    setEditBalanceData({ total_days: balance.total_days });
    setShowEditBalanceModal(true);
  };

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBalance) return;
    
    try {
      await leaveService.updateLeaveBalance(selectedBalance.id, editBalanceData.total_days);
      toast.success('Leave balance updated successfully!');
      setShowEditBalanceModal(false);
      setSelectedBalance(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update balance');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    
    const icons: Record<string, JSX.Element> = {
      pending: <Clock className="w-4 h-4 mr-1" />,
      approved: <CheckCircle className="w-4 h-4 mr-1" />,
      rejected: <XCircle className="w-4 h-4 mr-1" />,
      cancelled: <AlertCircle className="w-4 h-4 mr-1" />,
    };
    
    return (
      <span className={`flex items-center text-xs px-2 py-1 rounded capitalize ${styles[status] || 'bg-gray-100'}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  // Load view preference
  useEffect(() => {
    const savedView = localStorage.getItem('leave-view') as 'grid' | 'list';
    if (savedView) setView(savedView);
  }, []);

  useEffect(() => {
    localStorage.setItem('leave-view', view);
  }, [view]);

  // Get current requests based on active tab
  const currentRequests = activeTab === 'my-leaves' ? myRequests : teamRequests;

  // Prepare stats for header
  const headerStats = balances ? {
    totalAllocated: balances.total_allocated,
    totalUsed: balances.total_used,
    totalRemaining: balances.total_remaining,
    pendingRequests: myRequests.filter(r => r.status === 'pending').length
  } : undefined;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center py-12"
        >
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your leave management data...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <LeaveHeader
        userFullName={user?.full_name}
        onRequestLeave={() => setShowRequestModal(true)}
        stats={headerStats}
      />

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <LeaveSummaryCards
          loading={loading}
          stats={headerStats}
        />
      </motion.div>

      {/* Balance Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <LeaveBalanceBreakdown
          balances={balances?.leave_balances || []}
          loading={loading}
          onEditBalance={handleEditBalance}
          isAdmin={isAdmin}
        />
      </motion.div>

      {/* Tabs (Manager/Admin only) */}
      {isManagerOrAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <LeaveTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isManagerOrAdmin={isManagerOrAdmin}
            myLeavesCount={myRequests.length}
            teamLeavesCount={teamRequests.length}
            loading={requestsLoading}
          />
        </motion.div>
      )}

      {/* View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>
            {activeTab === 'my-leaves' 
              ? `Your leave requests (${currentRequests.length})`
              : `Team leave requests (${currentRequests.length})`
            }
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-colors ${
              view === 'grid'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
            }`}
            title="Grid View"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors ${
              view === 'list'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Leave Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        {currentRequests.length === 0 ? (
          <EmptyState
            type={activeTab}
            onAction={() => setShowRequestModal(true)}
            showAction={activeTab === 'my-leaves'}
          />
        ) : (
          <LeaveTable
            requests={currentRequests}
            loading={requestsLoading}
            view={view}
            activeTab={activeTab}
            onViewDetails={(request) => {
              setSelectedRequest(request);
              setShowDetailsModal(true);
            }}
            onApprove={handleApprove}
            onReject={handleReject}
            onCancel={handleCancel}
          />
        )}
      </motion.div>

      {/* Request Leave Modal */}
      <LeaveModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleSubmitRequest}
        leaveTypes={leaveTypes}
        loading={loading}
      />

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-6 h-6 text-primary" />
                <span>Leave Request Details</span>
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Employee</div>
                <div className="text-base font-medium text-gray-900 dark:text-white">{selectedRequest.user_name}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Leave Type</div>
                <div className="text-base font-medium text-gray-900 dark:text-white">{selectedRequest.leave_type_name}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Start Date</div>
                  <div className="text-base font-medium text-gray-900 dark:text-white">
                    {new Date(selectedRequest.start_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">End Date</div>
                  <div className="text-base font-medium text-gray-900 dark:text-white">
                    {new Date(selectedRequest.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Days</div>
                <div className="text-base font-medium text-gray-900 dark:text-white">{selectedRequest.total_days} days</div>
              </div>

              {selectedRequest.reason && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Reason</div>
                  <div className="text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    {selectedRequest.reason}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>

              {selectedRequest.reviewer_name && (
                <>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Reviewed By</div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">{selectedRequest.reviewer_name}</div>
                  </div>

                  {selectedRequest.reviewed_at && (
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Reviewed At</div>
                      <div className="text-base text-gray-900 dark:text-white">
                        {new Date(selectedRequest.reviewed_at).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {selectedRequest.review_comments && (
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Review Comments</div>
                      <div className="text-base text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                        {selectedRequest.review_comments}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {showEditBalanceModal && selectedBalance && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <Edit className="w-6 h-6 text-primary" />
                <span>Edit Leave Balance</span>
              </h2>
              <button
                onClick={() => {
                  setShowEditBalanceModal(false);
                  setSelectedBalance(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBalance} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Leave Type
                  </label>
                  <input
                    type="text"
                    value={selectedBalance.leave_type_name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    value={selectedBalance.year}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Used Days
                  </label>
                  <input
                    type="text"
                    value={`${selectedBalance.used_days} days`}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Allocated Days *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editBalanceData.total_days}
                    onChange={(e) => setEditBalanceData({ total_days: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Remaining will be recalculated automatically (Total - Used)
                  </p>
                </div>

                <div className="bg-primary-50 dark:bg-blue-900/20 border border-primary-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Preview:</strong> After update, remaining days will be{' '}
                    <strong>{(editBalanceData.total_days - selectedBalance.used_days).toFixed(1)} days</strong>
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditBalanceModal(false);
                    setSelectedBalance(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Update Balance
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagementPage;

