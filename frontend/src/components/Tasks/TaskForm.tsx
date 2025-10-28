import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  X, 
  Trash2, 
  Calendar, 
  User, 
  FileText, 
  Settings,
  AlertTriangle,
  Clock,
  Loader
} from 'lucide-react';
import { Task } from '../../services/taskService';
import FormField from './FormField';
import SelectField from './SelectField';
import ToggleField from './ToggleField';

export interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee_id: string;
  due_date: string;
  is_private: boolean;
}

interface TaskFormProps {
  task?: Task | null; // For editing existing task
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  users?: Array<{ id: number; full_name: string; email: string }>;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  onDelete,
  loading = false,
  submitLabel = "Save Task",
  users = []
}) => {
  // Form state
  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    assignee_id: task?.assignee_id?.toString() || '',
    due_date: task?.due_date ? task.due_date.slice(0, 16) : '', // Format for datetime-local input
    is_private: task?.is_private || false
  });

  // Form validation errors
  const [errors, setErrors] = useState<Partial<TaskFormData>>({});

  // Auto-save timestamp
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Update form data when task changes (for editing)
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        assignee_id: task.assignee_id?.toString() || '',
        due_date: task.due_date ? task.due_date.slice(0, 16) : '',
        is_private: task.is_private || false
      });
    }
  }, [task]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const now = new Date();
      
      if (dueDate < now && task?.status !== 'completed') {
        newErrors.due_date = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (field: keyof TaskFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: '⏳' },
    { value: 'in_progress', label: 'In Progress', icon: '🔄' },
    { value: 'completed', label: 'Completed', icon: '✅' },
    { value: 'cancelled', label: 'Cancelled', icon: '❌' }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low', icon: '⬇️' },
    { value: 'medium', label: 'Medium', icon: '➡️' },
    { value: 'high', label: 'High', icon: '⬆️' },
    { value: 'urgent', label: 'Urgent', icon: '🔥' }
  ];

  // User options
  const userOptions = [
    { value: '', label: 'Unassigned', icon: '👤' },
    ...users.map(user => ({
      value: user.id.toString(),
      label: user.full_name,
      icon: '👨‍💼'
    }))
  ];

  const isEditing = !!task;

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Form Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                {isEditing ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEditing ? 'Update task details and properties' : 'Fill in the details to create a new task'}
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <FormField
                label="Task Title"
                required
                error={errors.title}
                description="A clear, descriptive title for your task"
              >
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter task title..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  maxLength={200}
                />
              </FormField>
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <FormField
                label="Description"
                error={errors.description}
                description="Optional detailed description of the task"
              >
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe the task in detail..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none"
                  maxLength={1000}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Task Properties */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Task Properties</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configure task settings and assignments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <FormField
              label="Status"
              required
              description="Current state of the task"
            >
              <SelectField
                value={formData.status}
                onChange={(value) => handleChange('status', value)}
                options={statusOptions}
                placeholder="Select status"
              />
            </FormField>

            {/* Priority */}
            <FormField
              label="Priority"
              required
              description="Task importance level"
            >
              <SelectField
                value={formData.priority}
                onChange={(value) => handleChange('priority', value)}
                options={priorityOptions}
                placeholder="Select priority"
              />
            </FormField>

            {/* Assignee */}
            <FormField
              label="Assignee"
              description="Person responsible for this task"
            >
              <SelectField
                value={formData.assignee_id}
                onChange={(value) => handleChange('assignee_id', value)}
                options={userOptions}
                placeholder="Select assignee"
              />
            </FormField>

            {/* Due Date */}
            <FormField
              label="Due Date"
              error={errors.due_date}
              description="Target completion date and time"
            >
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => handleChange('due_date', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </FormField>

            {/* Privacy Toggle */}
            <div className="md:col-span-2">
              <FormField
                label="Privacy Settings"
                description="Private tasks are only visible to the creator and assignee"
              >
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      formData.is_private 
                        ? 'bg-red-100 dark:bg-red-900/30' 
                        : 'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      {formData.is_private ? (
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      ) : (
                        <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formData.is_private ? 'Private Task' : 'Public Task'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.is_private 
                          ? 'Only visible to you and the assignee' 
                          : 'Visible to all team members'
                        }
                      </p>
                    </div>
                  </div>
                  <ToggleField
                    checked={formData.is_private}
                    onChange={(checked) => handleChange('is_private', checked)}
                  />
                </div>
              </FormField>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          {/* Auto-save indicator */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {lastSaved && (
              <>
                <Clock className="w-4 h-4" />
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            {/* Delete Button (only for editing) */}
            {isEditing && onDelete && (
              <motion.button
                type="button"
                onClick={onDelete}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete Task
              </motion.button>
            )}

            {/* Cancel Button */}
            <motion.button
              type="button"
              onClick={onCancel}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-50 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </motion.button>

            {/* Save Button */}
            <motion.button
              type="submit"
              disabled={loading || !formData.title.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Saving...' : submitLabel}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
