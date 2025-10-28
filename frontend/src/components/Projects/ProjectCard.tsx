import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  User, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Project } from '../../services/projectService';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: number) => void;
  view?: 'grid' | 'list';
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onEdit, 
  onDelete, 
  view = 'grid' 
}) => {
  // Calculate project status based on progress
  const getProjectStatus = () => {
    if (project.progress_percentage === 100) return 'completed';
    if (project.progress_percentage > 0) return 'active';
    return 'not_started';
  };

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
      active: {
        icon: Clock,
        color: 'text-primary dark:text-blue-400',
        bgColor: 'bg-primary-50 dark:bg-blue-900/20',
        borderColor: 'border-primary-200 dark:border-blue-800',
        label: 'Active'
      },
      not_started: {
        icon: AlertTriangle,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        label: 'Not Started'
      }
    };
    return configs[status as keyof typeof configs] || configs.not_started;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const status = getProjectStatus();
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

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
                  to={`/projects/${project.id}`}
                  className="font-medium text-gray-900 dark:text-white hover:text-primary dark:hover:text-blue-400 transition-colors truncate block"
                >
                  {project.title}
                </Link>
                {project.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-20">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>{project.completed_tasks}/{project.task_count}</span>
                  <span>{Math.round(project.progress_percentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(project.progress_percentage)}`}
                    style={{ width: `${project.progress_percentage}%` }}
                  />
                </div>
              </div>
              
              <span className={`px-2 py-1 text-xs font-medium rounded-lg ${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>

            {/* Meta Info */}
            <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{project.creator_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(project.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Link
              to={`/projects/${project.id}`}
              className="p-2 text-gray-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onEdit(project);
                }}
                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                title="Edit Project"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(project.id);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete Project"
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
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <Link 
              to={`/projects/${project.id}`}
              className="font-medium text-lg text-gray-900 dark:text-white hover:text-primary dark:hover:text-blue-400 transition-colors line-clamp-2"
            >
              {project.title}
            </Link>
            <div className="flex items-center space-x-2 mt-1">
              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
              <span className={`text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
        
        <span className={`px-3 py-1 text-xs font-medium rounded-xl ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor} flex-shrink-0`}>
          {project.task_count} tasks
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Progress</span>
          </div>
          <span className="font-medium">
            {project.completed_tasks} of {project.task_count} tasks ({Math.round(project.progress_percentage)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress_percentage)}`}
            style={{ width: `${project.progress_percentage}%` }}
          />
        </div>
      </div>

      {/* Meta Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 flex-shrink-0" />
            <span>Created by {project.creator_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{formatDate(project.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <Link
          to={`/projects/${project.id}`}
          className="flex items-center space-x-2 text-sm font-medium text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </Link>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <button
              onClick={() => onEdit(project)}
              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
              title="Edit Project"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(project.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
