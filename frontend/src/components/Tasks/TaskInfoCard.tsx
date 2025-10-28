import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Calendar,
  FolderOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Tag
} from 'lucide-react';
import { Task } from '../../services/taskService';
import { Project } from '../../services/projectService';

interface TaskInfoCardProps {
  task: Task;
  project?: Project | null;
}

const TaskInfoCard: React.FC<TaskInfoCardProps> = ({ task, project }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Add relative time for due dates
    if (task.due_date === dateString) {
      if (diffDays === 0) return `${formattedDate} (Today)`;
      if (diffDays === 1) return `${formattedDate} (Tomorrow)`;
      if (diffDays === -1) return `${formattedDate} (Yesterday)`;
      if (diffDays > 0) return `${formattedDate} (In ${diffDays} days)`;
      if (diffDays < 0) return `${formattedDate} (${Math.abs(diffDays)} days ago)`;
    }
    
    return formattedDate;
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Card Header */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Task Information</h3>
      </div>

      <div className="space-y-6">
        {/* Description */}
        {task.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Description
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          </div>
        )}

        {/* Task Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* People Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              People
            </h4>
            
            {/* Assignee */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Assignee</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Who is responsible</p>
                </div>
              </div>
              <div className="text-right">
                {task.assignee_name ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs text-white font-medium">
                      {task.assignee_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.assignee_name}
                    </span>
                  </div>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg">
                    Unassigned
                  </span>
                )}
              </div>
            </div>

            {/* Creator */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Created by</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Task author</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-xs text-white font-medium">
                    {(task.creator_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.creator_name || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </h4>

            {/* Due Date */}
            {task.due_date && (
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isOverdue 
                      ? 'bg-red-100 dark:bg-red-900/30' 
                      : 'bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                    {isOverdue ? (
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Due Date</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isOverdue ? 'Overdue' : 'Target completion'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    isOverdue 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {formatDate(task.due_date)}
                  </p>
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Created</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Task start date</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(task.created_at)}
                </p>
              </div>
            </div>

            {/* Completed Date */}
            {task.completed_at && (
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Completed</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Task finished</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    {formatDate(task.completed_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Information */}
        {project && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <FolderOpen className="w-4 h-4 mr-2" />
              Project
            </h4>
            <Link
              to={`/projects/${project.id}`}
              className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-primary-200 dark:border-blue-800 rounded-lg hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {project.task_count} tasks • {project.progress_percentage}% complete
                  </p>
                </div>
              </div>
              <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm text-primary dark:text-blue-400">View Project →</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TaskInfoCard;
