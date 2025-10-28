import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar, 
  FolderOpen, 
  Eye, 
  Edit, 
  Trash2,
  Flag,
  Lock
} from 'lucide-react';
import { Task } from '../../services/taskService';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  view?: 'grid' | 'list';
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  view = 'grid' 
}) => {
  // Status configuration with modern colors and icons
  const getStatusConfig = (status: string) => {
    const configs = {
      completed: {
        icon: CheckCircle,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        label: 'Completed'
      },
      in_progress: {
        icon: Clock,
        color: 'text-primary dark:text-blue-400', 
        bgColor: 'bg-primary-50 dark:bg-blue-900/20',
        borderColor: 'border-primary-200 dark:border-blue-800',
        label: 'In Progress'
      },
      pending: {
        icon: AlertCircle,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20', 
        borderColor: 'border-amber-200 dark:border-amber-800',
        label: 'Pending'
      },
      cancelled: {
        icon: AlertCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800', 
        label: 'Cancelled'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  // Priority configuration with modern colors
  const getPriorityConfig = (priority: string) => {
    const configs = {
      urgent: {
        color: 'text-red-700 dark:text-red-300',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        label: 'Urgent',
        icon: '🔥'
      },
      high: {
        color: 'text-orange-700 dark:text-orange-300', 
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        label: 'High',
        icon: '⬆️'
      },
      medium: {
        color: 'text-yellow-700 dark:text-yellow-300',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', 
        label: 'Medium',
        icon: '➡️'
      },
      low: {
        color: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        label: 'Low', 
        icon: '⬇️'
      }
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  };

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow'; 
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Status & Title */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <StatusIcon className={`w-5 h-5 flex-shrink-0 ${statusConfig.color}`} />
              <div className="min-w-0 flex-1">
                <Link 
                  to={`/tasks/${task.id}`}
                  className="font-medium text-gray-900 dark:text-white hover:text-primary dark:hover:text-blue-400 transition-colors truncate block"
                >
                  {task.title}
                </Link>
                {task.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className={`px-2 py-1 text-xs font-medium rounded-lg ${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-lg ${priorityConfig.bgColor} ${priorityConfig.color} flex items-center space-x-1`}>
                <span>{priorityConfig.icon}</span>
                <span>{priorityConfig.label}</span>
              </span>
            </div>

            {/* Meta Info */}
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
              {task.assignee_name && (
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{task.assignee_name}</span>
                </div>
              )}
              {task.due_date && (
                <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-500 dark:text-red-400' : ''}`}>
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(task.due_date)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Link
              to={`/tasks/${task.id}`}
              className="p-2 text-gray-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                title="Edit Task"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <StatusIcon className={`w-5 h-5 flex-shrink-0 ${statusConfig.color}`} />
          <div className="min-w-0 flex-1">
            <Link 
              to={`/tasks/${task.id}`}
              className="font-medium text-lg text-gray-900 dark:text-white hover:text-primary dark:hover:text-blue-400 transition-colors line-clamp-2"
            >
              {task.title}
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          {task.is_private && (
            <div title="Private Task">
              <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
          )}
          {isOverdue && (
            <div title="Overdue">
              <Flag className="w-4 h-4 text-red-500" />
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-3 py-1 text-xs font-medium rounded-xl ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
          {statusConfig.label}
        </span>
        <span className={`px-3 py-1 text-xs font-medium rounded-xl ${priorityConfig.bgColor} ${priorityConfig.color} flex items-center space-x-1`}>
          <span>{priorityConfig.icon}</span>
          <span>{priorityConfig.label}</span>
        </span>
      </div>

      {/* Meta Information */}
      <div className="space-y-2 mb-4">
        {task.assignee_name && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4 flex-shrink-0" />
            <span>Assigned to {task.assignee_name}</span>
          </div>
        )}
        
        {task.project_name && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
            <Link 
              to={`/projects/${task.project_id}`}
              className="hover:text-primary dark:hover:text-blue-400 transition-colors truncate"
            >
              {task.project_name}
            </Link>
          </div>
        )}

        {task.due_date && (
          <div className={`flex items-center space-x-2 text-sm ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>Due {formatDate(task.due_date)}</span>
            {isOverdue && <span className="text-xs">(Overdue)</span>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-gray-400 dark:text-gray-500">
          Created {formatDate(task.created_at)}
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link
            to={`/tasks/${task.id}`}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
              title="Edit Task"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
