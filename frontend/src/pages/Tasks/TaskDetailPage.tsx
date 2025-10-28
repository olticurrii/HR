import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FolderOpen, 
  Home,
  ChevronRight,
  Loader
} from 'lucide-react';
import { useQuery } from 'react-query';
import { taskService, Task } from '../../services/taskService';
import { projectService, Project } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import CommentsSection from '../../components/Tasks/CommentsSection';
import TaskInfoCard from '../../components/Tasks/TaskInfoCard';
import TaskPropertiesCard from '../../components/Tasks/TaskPropertiesCard';
import toast from 'react-hot-toast';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch task with React Query
  const { 
    data: task, 
    isLoading: taskLoading, 
    error: taskError 
  } = useQuery(
    ['task', id],
    () => taskService.getTask(parseInt(id!)),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Error loading task:', error);
        toast.error('Failed to load task details');
        navigate('/tasks');
      }
    }
  );

  // Fetch project if task belongs to one
  const { data: project } = useQuery(
    ['project', task?.project_id],
    () => projectService.getProject(task!.project_id!),
    {
      enabled: !!task?.project_id,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Error loading project:', error);
      }
    }
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'in_progress':
        return <Clock className="w-6 h-6 text-primary dark:text-blue-400" />;
      case 'pending':
        return <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'cancelled':
        return <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      completed: {
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        label: 'Completed'
      },
      in_progress: {
        color: 'text-primary dark:text-blue-400',
        bgColor: 'bg-primary-50 dark:bg-blue-900/20',
        borderColor: 'border-primary-200 dark:border-blue-800',
        label: 'In Progress'
      },
      pending: {
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        label: 'Pending'
      },
      cancelled: {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        label: 'Cancelled'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      urgent: { color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-100 dark:bg-red-900/30', label: 'Urgent', icon: '🔥' },
      high: { color: 'text-orange-700 dark:text-orange-300', bgColor: 'bg-orange-100 dark:bg-orange-900/30', label: 'High', icon: '⬆️' },
      medium: { color: 'text-yellow-700 dark:text-yellow-300', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Medium', icon: '➡️' },
      low: { color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-100 dark:bg-green-900/30', label: 'Low', icon: '⬇️' }
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  };

  // Loading state
  if (taskLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-16">
          <Loader className="w-8 h-8 text-primary animate-spin mr-3" />
          <span className="text-gray-600 dark:text-gray-400">Loading task details...</span>
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (taskError || !task) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Task not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The task you're looking for doesn't exist or has been deleted.
        </p>
        <button
          onClick={() => navigate('/tasks')}
          className="px-6 py-3 bg-primary hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
        >
          Back to Tasks
        </button>
      </motion.div>
    );
  }

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-2 text-sm"
      >
        <Link
          to="/"
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <Link
          to="/tasks"
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Tasks
        </Link>
        {project && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              to={`/projects/${project.id}`}
              className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <FolderOpen className="w-4 h-4 mr-1" />
              {project.title}
            </Link>
          </>
        )}
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 dark:text-white font-medium">{task.title}</span>
      </motion.nav>

      {/* Task Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-4 mb-4">
                {getStatusIcon(task.status)}
                <div>
                  <h1 className="text-3xl lg:text-4xl font-medium mb-2">{task.title}</h1>
                  <p className="text-blue-100 text-lg">Task Details & Information</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Status & Priority Badges */}
              <div className="flex space-x-3">
                <span className={`px-4 py-2 text-sm font-medium rounded-xl bg-white/20 text-white border border-white/30`}>
                  {statusConfig.label}
                </span>
                <span className={`px-4 py-2 text-sm font-medium rounded-xl bg-white/20 text-white border border-white/30 flex items-center space-x-2`}>
                  <span>{priorityConfig.icon}</span>
                  <span>{priorityConfig.label}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => navigate(`/tasks/${task.id}/edit`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-4 py-2 bg-white text-primary font-medium rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Task
                </motion.button>
                {project && (
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex items-center px-4 py-2 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/30"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    View Project
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Task Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Information Card */}
        <TaskInfoCard task={task} project={project} />
        
        {/* Task Properties Card */}
        <TaskPropertiesCard 
          task={task} 
          onEdit={() => navigate(`/tasks/${task.id}/edit`)} 
        />
      </div>

      {/* Comments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <CommentsSection taskId={task.id} />
      </motion.div>
    </div>
  );
};

export default TaskDetailPage;
