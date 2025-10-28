import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, FileText, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { LeaveType } from '../../services/leaveService';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveFormData) => Promise<void>;
  leaveTypes: LeaveType[];
  loading?: boolean;
}

export interface LeaveFormData {
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason: string;
}

interface LeaveFormErrors {
  leave_type_id?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
}

const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  leaveTypes,
  loading = false
}) => {
  const [formData, setFormData] = useState<LeaveFormData>({
    leave_type_id: 0,
    start_date: '',
    end_date: '',
    reason: ''
  });

  const [errors, setErrors] = useState<LeaveFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        leave_type_id: 0,
        start_date: '',
        end_date: '',
        reason: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  // Calculate working days between two dates (excluding weekends)
  const calculateWorkingDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) return 0;
    
    let count = 0;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
  };

  const workingDays = calculateWorkingDays(formData.start_date, formData.end_date);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: LeaveFormErrors = {};

    if (!formData.leave_type_id) {
      newErrors.leave_type_id = 'Please select a leave type';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    } else {
      const startDate = new Date(formData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.start_date = 'Start date cannot be in the past';
      }
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    } else if (formData.start_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    if (workingDays > 365) {
      newErrors.end_date = 'Leave period cannot exceed 365 working days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error submitting leave request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LeaveFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof LeaveFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Get minimum date (today)
  const minDate = new Date().toISOString().split('T')[0];
  
  // Get minimum end date (start date if set)
  const minEndDate = formData.start_date || minDate;

  // Get selected leave type details
  const selectedLeaveType = leaveTypes.find(type => type.id === Number(formData.leave_type_id));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-primary" />
                <span>Request Leave</span>
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Leave Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Leave Type *
                </label>
                <select
                  value={formData.leave_type_id}
                  onChange={(e) => handleInputChange('leave_type_id', parseInt(e.target.value))}
                  className={`
                    w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    transition-colors duration-200
                    ${errors.leave_type_id 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                    }
                  `}
                  disabled={submitting}
                >
                  <option value="">Select leave type</option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.leave_type_id && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.leave_type_id}</span>
                  </p>
                )}
                {selectedLeaveType?.description && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {selectedLeaveType.description}
                  </p>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    min={minDate}
                    className={`
                      w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      transition-colors duration-200
                      ${errors.start_date 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                      }
                    `}
                    disabled={submitting}
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.start_date}</span>
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    min={minEndDate}
                    className={`
                      w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      transition-colors duration-200
                      ${errors.end_date 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                      }
                    `}
                    disabled={submitting}
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.end_date}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Duration Display */}
              {workingDays > 0 && (
                <div className="bg-primary-50 dark:bg-blue-900/20 border border-primary-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Duration: {workingDays} working {workingDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    placeholder="Enter reason for leave..."
                    rows={3}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 resize-none"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Additional Info */}
              {selectedLeaveType?.requires_approval && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2 text-yellow-800 dark:text-yellow-200">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      This leave type requires manager approval. You will be notified once your request is reviewed.
                    </p>
                  </div>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting || !formData.leave_type_id || !formData.start_date || !formData.end_date}
                whileHover={!submitting ? { scale: 1.02 } : {}}
                whileTap={!submitting ? { scale: 0.98 } : {}}
                className="px-6 py-2 bg-primary hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LeaveModal;
