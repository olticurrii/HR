import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar, 
  FolderOpen, 
  Home,
  ChevronRight,
  Loader,
  BarChart3,
  ListChecks
} from 'lucide-react';
import { useQuery } from 'react-query';
import { projectService, ProjectWithTasks, Task, TaskCreate } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Import components
import ProjectProgressBar from '../../components/Projects/ProjectProgressBar';
import TaskCard from '../../components/Tasks/TaskCard';
import EmptyProjectState from '../../components/Projects/EmptyProjectState';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  
  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showAttachTaskModal, setShowAttachTaskModal] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [newTaskData, setNewTaskData] = useState<TaskCreate>({
    title: '',
    description: '',
    priority: 'medium',
    is_private: false
  });
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Fetch project with React Query
  const { 
    data: project, 
    isLoading: projectLoading, 
    error: projectError,
    refetch: refetchProject
  } = useQuery(
    ['project', id],
    () => projectService.getProject(parseInt(id!)),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setEditData({ title: data.title, description: data.description || '' });
      },
      onError: (error) => {
        console.error('Error loading project:', error);
        toast.error('Failed to load project details');
        navigate('/projects');
      }
    }
  );

  const handleUpdateProject = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !editData.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    try {
      await projectService.updateProject(project.id, editData);
      toast.success('Project updated successfully');
      setShowEditModal(false);
      refetchProject();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  }, [project, editData, refetchProject]);

  const handleCreateTask = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newTaskData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      await projectService.createTaskInProject(project.id, newTaskData);
      toast.success('Task created successfully');
      setShowCreateTaskModal(false);
      setNewTaskData({ title: '', description: '', priority: 'medium', is_private: false });
      refetchProject();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  }, [project, newTaskData, refetchProject]);

  const loadAvailableTasks = useCallback(async () => {
    try {
      const tasks = await taskService.getAllTasks();
      // Filter out tasks that are already in projects
      const available = tasks.filter(task => !task.project_id);
      setAvailableTasks(available);
    } catch (error) {
      console.error('Error loading available tasks:', error);
      toast.error('Failed to load available tasks');
    }
  }, []);

  const handleAttachTask = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !selectedTaskId) {
      toast.error('Please select a task to attach');
      return;
    }

    try {
      await projectService.attachTaskToProject(project.id, selectedTaskId);
      toast.success('Task attached to project successfully');
      setShowAttachTaskModal(false);
      setSelectedTaskId(null);
      refetchProject();
    } catch (error) {
      console.error('Error attaching task:', error);
      toast.error('Failed to attach task');
    }
  }, [project, selectedTaskId, refetchProject]);

  const handleDetachTask = useCallback(async (taskId: number) => {
    if (!project) return;
    
    if (!window.confirm('Are you sure you want to detach this task from the project?')) return;

    try {
      await projectService.detachTaskFromProject(project.id, taskId);
      toast.success('Task detached from project successfully');
      refetchProject();
    } catch (error) {
      console.error('Error detaching task:', error);
      toast.error('Failed to detach task');
    }
  }, [project, refetchProject]);

  const handleTaskEdit = useCallback((task: Task) => {
    navigate(`/tasks/${task.id}/edit`);
  }, [navigate]);

  const handleTaskDelete = useCallback(async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.deleteTask(taskId);
      toast.success('Task deleted successfully');
      refetchProject();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  }, [refetchProject]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-primary" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-200';
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Loading state
  if (projectLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-16">
          <Loader className="w-8 h-8 text-primary animate-spin mr-3" />
          <span className="text-gray-600 dark:text-gray-400">Loading project details...</span>
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
  if (projectError || !project) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FolderOpen className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Project not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The project you're looking for doesn't exist or has been deleted.
        </p>
        <button
          onClick={() => navigate('/projects')}
          className="px-6 py-3 bg-primary hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
        >
          Back to Projects
        </button>
      </motion.div>
    );
  }

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
          to="/projects"
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Projects
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 dark:text-white font-medium">{project.title}</span>
      </motion.nav>

      {/* Project Header */}
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
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-medium mb-2">{project.title}</h1>
                  <p className="text-blue-100 text-lg">Project Details & Tasks</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Project Stats */}
              <div className="flex space-x-4 text-center">
                <div>
                  <div className="text-2xl font-medium">{project.task_count}</div>
                  <div className="text-xs text-blue-100">Total Tasks</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-green-300">{project.completed_tasks}</div>
                  <div className="text-xs text-blue-100">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-yellow-300">{Math.round(project.progress_percentage)}%</div>
                  <div className="text-xs text-blue-100">Progress</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {hasPermission('projects', 'update') && (
                  <motion.button
                    onClick={() => setShowEditModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center px-4 py-2 bg-white text-primary font-medium rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Project
                  </motion.button>
                )}
                {hasPermission('projects', 'create') && (
                  <motion.button
                    onClick={() => setShowCreateTaskModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center px-4 py-2 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/30"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Project Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Info</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Created by:</span>
              <span className="font-medium text-gray-900 dark:text-white">{project.creator_name}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Created:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatDate(project.created_at)}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <ListChecks className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Tasks:</span>
              <span className="font-medium text-gray-900 dark:text-white">{project.task_count} total</span>
            </div>
          </div>
        </motion.div>

        {/* Description Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Description</h3>
          </div>
          
          <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {project.description ? (
              <p>{project.description}</p>
            ) : (
              <p className="italic text-gray-400 dark:text-gray-500">No description provided</p>
            )}
          </div>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Progress</h3>
          </div>
          
          <ProjectProgressBar
            completed={project.completed_tasks}
            total={project.task_count}
            percentage={project.progress_percentage}
            size="md"
            showDetails={true}
            showIcon={false}
          />
        </motion.div>
      </div>

      {/* Tasks Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Project Tasks ({project.tasks.length})
              </h2>
            </div>
            {hasPermission('projects', 'create') && (
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => setShowCreateTaskModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </motion.button>
                <motion.button
                  onClick={() => {
                    loadAvailableTasks();
                    setShowAttachTaskModal(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-4 py-2 bg-primary hover:bg-primary-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Attach Task
                </motion.button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {project.tasks.length === 0 ? (
            <EmptyProjectState
              title="No tasks yet"
              description="Add tasks to this project to get started with your workflow."
              showCreateButton={hasPermission('projects', 'create')}
              illustration="default"
            />
          ) : (
            <div className="space-y-4">
              {project.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  view="list"
                  onEdit={handleTaskEdit}
                  onDelete={handleTaskDelete}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 max-w-[90vw]"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Project</h3>
            
            <form onSubmit={handleUpdateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Update Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select
                  value={newTaskData.priority}
                  onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_private"
                  checked={newTaskData.is_private}
                  onChange={(e) => setNewTaskData({ ...newTaskData, is_private: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_private" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Private Task
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Attach Task Modal */}
      {showAttachTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Attach Existing Task</h3>
            <form onSubmit={handleAttachTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Task</label>
                <select
                  value={selectedTaskId || ''}
                  onChange={(e) => setSelectedTaskId(parseInt(e.target.value) || null)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Choose a task...</option>
                  {availableTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title} ({task.status})
                    </option>
                  ))}
                </select>
              </div>
              {availableTasks.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No standalone tasks available to attach.</p>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAttachTaskModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedTaskId}
                  className="bg-primary hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Attach Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;