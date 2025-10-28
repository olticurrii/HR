import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Flag, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  Hash,
  Edit
} from 'lucide-react';
import { Task } from '../../services/taskService';

interface TaskPropertiesCardProps {
  task: Task;
  onEdit?: () => void;
}

const TaskPropertiesCard: React.FC<TaskPropertiesCardProps> = ({ task, onEdit }) => {
  // Status configuration with modern colors and icons
  const getStatusConfig = (status: string) => {
    const configs = {
      completed: {
        icon: CheckCircle,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        label: 'Completed',
        description: 'Task has been finished successfully'
      },
      in_progress: {
        icon: Clock,
        color: 'text-primary dark:text-blue-400',
        bgColor: 'bg-primary-50 dark:bg-blue-900/20',
        borderColor: 'border-primary-200 dark:border-blue-800',
        label: 'In Progress',
        description: 'Currently being worked on'
      },
      pending: {
        icon: AlertCircle,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        label: 'Pending',
        description: 'Waiting to be started'
      },
      cancelled: {
        icon: AlertCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        label: 'Cancelled',
        description: 'Task has been cancelled'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  // Priority configuration
  const getPriorityConfig = (priority: string) => {
    const configs = {
      urgent: {
        color: 'text-red-700 dark:text-red-300',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-red-300 dark:border-red-700',
        label: 'Urgent',
        icon: '🔥',
        description: 'Needs immediate attention'
      },
      high: {
        color: 'text-orange-700 dark:text-orange-300',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        borderColor: 'border-orange-300 dark:border-orange-700',
        label: 'High',
        icon: '⬆️',
        description: 'Should be completed soon'
      },
      medium: {
        color: 'text-yellow-700 dark:text-yellow-300',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        borderColor: 'border-yellow-300 dark:border-yellow-700',
        label: 'Medium',
        icon: '➡️',
        description: 'Normal priority level'
      },
      low: {
        color: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        borderColor: 'border-green-300 dark:border-green-700',
        label: 'Low',
        icon: '⬇️',
        description: 'Can wait if necessary'
      }
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  };

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);
  const StatusIcon = statusConfig.icon;

  const properties = [
    {
      icon: StatusIcon,
      iconColor: statusConfig.color,
      iconBg: statusConfig.bgColor,
      label: 'Status',
      value: statusConfig.label,
      description: statusConfig.description,
      badgeColor: `${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`
    },
    {
      icon: Flag,
      iconColor: priorityConfig.color,
      iconBg: priorityConfig.bgColor,
      label: 'Priority',
      value: `${priorityConfig.icon} ${priorityConfig.label}`,
      description: priorityConfig.description,
      badgeColor: `${priorityConfig.bgColor} ${priorityConfig.color} border ${priorityConfig.borderColor}`
    },
    {
      icon: task.is_private ? Lock : Unlock,
      iconColor: task.is_private ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
      iconBg: task.is_private ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20',
      label: 'Visibility',
      value: task.is_private ? 'Private' : 'Public',
      description: task.is_private ? 'Only visible to assignee and creator' : 'Visible to all team members',
      badgeColor: task.is_private 
        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
    },
    ...(task.position ? [{
      icon: Hash,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      label: 'Position in Project',
      value: `#${task.position}`,
      description: 'Order within the project task list',
      badgeColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
    }] : [])
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Task Properties</h3>
        </div>
        
        {onEdit && (
          <motion.button
            onClick={onEdit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 hover:bg-primary-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </motion.button>
        )}
      </div>

      {/* Properties List */}
      <div className="space-y-4">
        {properties.map((property, index) => {
          const Icon = property.icon;
          
          return (
            <motion.div
              key={property.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between py-4 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {/* Property Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${property.iconBg}`}>
                  <Icon className={`w-5 h-5 ${property.iconColor}`} />
                </div>
                
                {/* Property Info */}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {property.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {property.description}
                  </p>
                </div>
              </div>
              
              {/* Property Value Badge */}
              <div className={`px-3 py-2 text-sm font-medium rounded-lg ${property.badgeColor}`}>
                {property.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Last updated: {new Date(task.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p>Task ID: {task.id}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskPropertiesCard;
