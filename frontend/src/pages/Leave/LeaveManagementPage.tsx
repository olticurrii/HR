import React, { useState, useEffect } from 'react';
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
  Edit
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { leaveService, LeaveType, LeaveBalance, LeaveRequest, LeaveBalanceSummary } from '../../services/leaveService';
import toast from 'react-hot-toast';

const LeaveManagementPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-leaves' | 'team-leaves'>('my-leaves');
  
  // State
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalanceSummary | null>(null);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [teamRequests, setTeamRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditBalanceModal, setShowEditBalanceModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

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

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leaveService.createLeaveRequest({
        leave_type_id: parseInt(formData.leave_type_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
      });
      
      toast.success('Leave request submitted successfully!');
      setShowRequestModal(false);
      setFormData({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit request');
    }
  };

  const handleReview = async (requestId: number, status: 'approved' | 'rejected', comments?: string) => {
    try {
      await leaveService.reviewLeaveRequest(requestId, { status, review_comments: comments });
      toast.success(`Request ${status} successfully!`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${status} request`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Leave Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your leave requests and view your leave balance
            </p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Request Leave
          </button>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Total Allocated</div>
          <div className="text-3xl font-bold text-blue-600">
            {balances?.total_allocated || 0}
            <span className="text-sm text-gray-500 ml-1">days</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Used</div>
          <div className="text-3xl font-bold text-orange-600">
            {balances?.total_used || 0}
            <span className="text-sm text-gray-500 ml-1">days</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Remaining</div>
          <div className="text-3xl font-bold text-green-600">
            {balances?.total_remaining || 0}
            <span className="text-sm text-gray-500 ml-1">days</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Pending Requests</div>
          <div className="text-3xl font-bold text-yellow-600">
            {myRequests.filter(r => r.status === 'pending').length}
          </div>
        </div>
      </div>

      {/* Balance Details */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Leave Balance Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances?.leave_balances.map((balance) => (
            <div key={balance.id} className="border rounded-lg p-4 relative">
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-gray-900">{balance.leave_type_name}</div>
                {isAdmin && (
                  <button
                    onClick={() => handleEditBalance(balance)}
                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                    title="Edit balance"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">{balance.total_days} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used:</span>
                <span className="font-medium text-orange-600">{balance.used_days} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-medium text-green-600">{balance.remaining_days} days</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      {isManagerOrAdmin && (
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('my-leaves')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'my-leaves'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Leaves
          </button>
          <button
            onClick={() => setActiveTab('team-leaves')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'team-leaves'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Team Leaves
          </button>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {activeTab === 'team-leaves' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leave Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(activeTab === 'my-leaves' ? myRequests : teamRequests).map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                {activeTab === 'team-leaves' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.user_name}</div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.leave_type_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(request.start_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(request.end_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {request.total_days}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {activeTab === 'my-leaves' && request.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(request.id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                        title="Cancel request"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    {activeTab === 'team-leaves' && request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleReview(request.id, 'approved')}
                          className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const comments = prompt('Enter rejection reason (optional):');
                            if (comments !== null) {
                              handleReview(request.id, 'rejected', comments);
                            }
                          }}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Request Leave Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Request Leave</h2>
            <form onSubmit={handleSubmitRequest}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type *
                  </label>
                  <select
                    value={formData.leave_type_id}
                    onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter reason for leave..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setFormData({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Leave Request Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Employee</div>
                <div className="text-base font-medium">{selectedRequest.user_name}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Leave Type</div>
                <div className="text-base font-medium">{selectedRequest.leave_type_name}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Start Date</div>
                  <div className="text-base font-medium">
                    {new Date(selectedRequest.start_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">End Date</div>
                  <div className="text-base font-medium">
                    {new Date(selectedRequest.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Total Days</div>
                <div className="text-base font-medium">{selectedRequest.total_days} days</div>
              </div>

              {selectedRequest.reason && (
                <div>
                  <div className="text-sm text-gray-600">Reason</div>
                  <div className="text-base">{selectedRequest.reason}</div>
                </div>
              )}

              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>

              {selectedRequest.reviewer_name && (
                <>
                  <div>
                    <div className="text-sm text-gray-600">Reviewed By</div>
                    <div className="text-base font-medium">{selectedRequest.reviewer_name}</div>
                  </div>

                  {selectedRequest.reviewed_at && (
                    <div>
                      <div className="text-sm text-gray-600">Reviewed At</div>
                      <div className="text-base">
                        {new Date(selectedRequest.reviewed_at).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {selectedRequest.review_comments && (
                    <div>
                      <div className="text-sm text-gray-600">Review Comments</div>
                      <div className="text-base">{selectedRequest.review_comments}</div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {showEditBalanceModal && selectedBalance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Leave Balance</h2>
              <button
                onClick={() => {
                  setShowEditBalanceModal(false);
                  setSelectedBalance(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBalance}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type
                  </label>
                  <input
                    type="text"
                    value={selectedBalance.leave_type_name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    value={selectedBalance.year}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Used Days
                  </label>
                  <input
                    type="text"
                    value={`${selectedBalance.used_days} days`}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Allocated Days *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editBalanceData.total_days}
                    onChange={(e) => setEditBalanceData({ total_days: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Remaining will be recalculated automatically (Total - Used)
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagementPage;

