import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Home, 
  ChevronRight, 
  FolderOpen,
  Loader,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import TaskForm, { TaskFormData } from '../../components/Tasks/TaskForm';
import toast from 'react-hot-toast';

const EditTaskPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch task data
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

  // Fetch users for assignee selection
  const { data: users = [] } = useQuery(
    'users-for-task-edit',
    userService.getAllUsers,
    {
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        console.error('Error loading users:', error);
      }
    }
  );

  // Update task mutation
  const updateTaskMutation = useMutation(
    (data: TaskFormData) => taskService.updateTask(parseInt(id!), {
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      priority: data.priority,
      assignee_id: data.assignee_id ? parseInt(data.assignee_id) : undefined,
      due_date: data.due_date || undefined,
      is_private: data.is_private
    }),
    {
      onSuccess: () => {
        toast.success('Task updated successfully');
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries(['task', id]);
        queryClient.invalidateQueries('tasks');
        navigate(`/tasks/${id}`);
      },
      onError: (error) => {
        console.error('Error updating task:', error);
        toast.error('Failed to update task');
      }
    }
  );

  // Delete task mutation
  const deleteTaskMutation = useMutation(
    () => taskService.deleteTask(parseInt(id!)),
    {
      onSuccess: () => {
        toast.success('Task deleted successfully');
        // Invalidate tasks list
        queryClient.invalidateQueries('tasks');
        navigate('/tasks');
      },
      onError: (error) => {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
  );

  // Handle form submission
  const handleSubmit = async (data: TaskFormData) => {
    await updateTaskMutation.mutateAsync(data);
  };

  // Handle task deletion
  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task?.title}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      await deleteTaskMutation.mutateAsync();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/tasks/${id}`);
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
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-6 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
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
          The task you're trying to edit doesn't exist or has been deleted.
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

  // Check permissions - only creator, assignee, or admin can edit
  const canEdit = user?.role === 'admin' || 
                  task.created_by === user?.id || 
                  task.assignee_id === user?.id;

  if (!canEdit) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-12 h-12 text-yellow-500" />
        </div>
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Permission Denied</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You don't have permission to edit this task.
        </p>
        <button
          onClick={() => navigate(`/tasks/${id}`)}
          className="px-6 py-3 bg-primary hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
        >
          View Task Details
        </button>
      </motion.div>
    );
  }

  const isLoading = updateTaskMutation.isLoading || deleteTaskMutation.isLoading;

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
        <Link
          to={`/tasks/${id}`}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          {task.title}
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 dark:text-white font-medium">Edit</span>
      </motion.nav>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-4 mb-4">
                <Edit className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl lg:text-4xl font-medium mb-2">Edit Task</h1>
                  <p className="text-orange-100 text-lg">Modify task details and settings</p>
                </div>
              </div>
              <p className="text-orange-100 opacity-90">
                Editing: <span className="font-medium">{task.title}</span>
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Task
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Task Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <TaskForm
          task={task}
          users={users}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onDelete={handleDelete}
          loading={isLoading}
          submitLabel="Update Task"
        />
      </motion.div>
    </div>
  );
};

export default EditTaskPage;
