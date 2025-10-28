import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  User,
  FileText,
  Grid3x3,
  List,
  Filter
} from 'lucide-react';
import { LeaveRequest } from '../../services/leaveService';

interface LeaveTableProps {
  requests: LeaveRequest[];
  loading?: boolean;
  view?: 'grid' | 'list';
  activeTab: 'my-leaves' | 'team-leaves';
  onViewDetails: (request: LeaveRequest) => void;
  onApprove?: (requestId: number) => void;
  onReject?: (requestId: number) => void;
  onCancel?: (requestId: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

const LeaveTable: React.FC<LeaveTableProps> = ({
  requests,
  loading = false,
  view = 'grid',
  activeTab,
  onViewDetails,
  onApprove,
  onReject,
  onCancel,
  emptyTitle = "No leave requests found",
  emptyDescription = "You haven't made any leave requests yet."
}) => {
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);

  // Status configuration with consistent styling
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        icon: Clock,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        label: 'Pending'
      },
      approved: {
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        label: 'Approved'
      },
      rejected: {
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        label: 'Rejected'
      },
      cancelled: {
        icon: AlertCircle,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-neutral-dark/20',
        borderColor: 'border-gray-200 dark:border-gray-800',
        label: 'Cancelled'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (requests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700"
      >
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {emptyTitle}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {emptyDescription}
        </p>
      </motion.div>
    );
  }

  // Grid view
  if (view === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {requests.map((request, index) => {
          const statusConfig = getStatusConfig(request.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {request.leave_type_name}
                    </h3>
                    {activeTab === 'team-leaves' && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.user_name}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-xl ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                  {statusConfig.label}
                </span>
              </div>

              {/* Dates */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDateRange(request.start_date, request.end_date)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {request.total_days} {request.total_days === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>

              {/* Reason */}
              {request.reason && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {request.reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-400">
                  {formatDate(request.created_at)}
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => onViewDetails(request)}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {activeTab === 'my-leaves' && request.status === 'pending' && onCancel && (
                    <button
                      onClick={() => onCancel(request.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Cancel Request"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  
                  {activeTab === 'team-leaves' && request.status === 'pending' && (
                    <>
                      {onApprove && (
                        <button
                          onClick={() => onApprove(request.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {onReject && (
                        <button
                          onClick={() => onReject(request.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  }

  // List view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Table Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          {activeTab === 'team-leaves' && (
            <div className="col-span-2">Employee</div>
          )}
          <div className={activeTab === 'team-leaves' ? 'col-span-2' : 'col-span-3'}>Leave Type</div>
          <div className="col-span-2">Dates</div>
          <div className="col-span-1">Days</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {requests.map((request, index) => {
          const statusConfig = getStatusConfig(request.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Employee (Team view only) */}
                {activeTab === 'team-leaves' && (
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {request.user_name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Leave Type */}
                <div className={activeTab === 'team-leaves' ? 'col-span-2' : 'col-span-3'}>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {request.leave_type_name}
                  </span>
                  {request.reason && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                      {request.reason}
                    </p>
                  )}
                </div>

                {/* Dates */}
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDateRange(request.start_date, request.end_date)}
                  </div>
                </div>

                {/* Days */}
                <div className="col-span-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {request.total_days}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onViewDetails(request)}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {activeTab === 'my-leaves' && request.status === 'pending' && onCancel && (
                      <button
                        onClick={() => onCancel(request.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Cancel Request"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    {activeTab === 'team-leaves' && request.status === 'pending' && (
                      <>
                        {onApprove && (
                          <button
                            onClick={() => onApprove(request.id)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {onReject && (
                          <button
                            onClick={() => onReject(request.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default LeaveTable;
