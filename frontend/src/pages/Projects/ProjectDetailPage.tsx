import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, CheckCircle, Clock, AlertCircle, User, Calendar, GripVertical, Unlink } from 'lucide-react';
import { projectService, ProjectWithTasks, Task, TaskCreate } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectWithTasks | null>(null);
  const [loading, setLoading] = useState(true);
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
  const { user, hasPermission } = useAuth();

  useEffect(() => {
    if (id) {
      loadProject(parseInt(id));
    }
  }, [id]);

  const loadProject = async (projectId: number) => {
    try {
      const data = await projectService.getProject(projectId);
      setProject(data);
      setEditData({ title: data.title, description: data.description || '' });
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !editData.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    try {
      await projectService.updateProject(project.id, editData);
      toast.success('Project updated successfully');
      setShowEditModal(false);
      loadProject(project.id);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
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
      loadProject(project.id);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const loadAvailableTasks = async () => {
    try {
      const tasks = await taskService.getAllTasks();
      // Filter out tasks that are already in projects
      const available = tasks.filter(task => !task.project_id);
      setAvailableTasks(available);
    } catch (error) {
      console.error('Error loading available tasks:', error);
      toast.error('Failed to load available tasks');
    }
  };

  const handleAttachTask = async (e: React.FormEvent) => {
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
      loadProject(project.id);
    } catch (error) {
      console.error('Error attaching task:', error);
      toast.error('Failed to attach task');
    }
  };

  const handleDetachTask = async (taskId: number) => {
    if (!project) return;

    try {
      await projectService.detachTaskFromProject(project.id, taskId);
      toast.success('Task detached from project successfully');
      loadProject(project.id);
    } catch (error) {
      console.error('Error detaching task:', error);
      toast.error('Failed to detach task');
    }
  };

  const handleReorderTasks = async (taskIds: number[]) => {
    if (!project) return;

    try {
      await projectService.reorderProjectTasks(project.id, { task_ids: taskIds });
      toast.success('Tasks reordered successfully');
      loadProject(project.id);
    } catch (error) {
      console.error('Error reordering tasks:', error);
      toast.error('Failed to reorder tasks');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Project not found</h2>
          <Link to="/projects" className="text-blue-500 hover:text-blue-600">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            to="/projects"
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
            <p className="text-gray-600 mt-1">Project Details & Tasks</p>
          </div>
        </div>

        {hasPermission('projects', 'update') && (
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit Project
          </button>
        )}
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-800">
              {project.description || 'No description provided'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Progress</h3>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>{project.completed_tasks} of {project.task_count} tasks</span>
                  <span>{Math.round(project.progress_percentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress_percentage)}`}
                    style={{ width: `${project.progress_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Project Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Created by: </span>
                <span className="ml-1 font-medium">{project.creator_name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Created: </span>
                <span className="ml-1 font-medium">{formatDate(project.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
            {hasPermission('projects', 'create') && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Task
                </button>
                <button
                  onClick={() => {
                    loadAvailableTasks();
                    setShowAttachTaskModal(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Attach Task
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {project.tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No tasks yet</h3>
              <p className="text-gray-400 mb-4">Add tasks to this project to get started</p>
              <Link
                to={`/tasks/create?project_id=${project.id}`}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Task
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {project.tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {hasPermission('projects', 'create') && (
                        <div className="flex flex-col space-y-1 mt-1">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <span className="text-xs text-gray-400">{index + 1}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(task.status)}
                          <h3 className="text-lg font-medium text-gray-800">{task.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                      {task.description && (
                        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {task.assignee_name && (
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {task.assignee_name}
                          </div>
                        )}
                        {task.due_date && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Due: {formatDate(task.due_date)}
                          </div>
                        )}
                        {task.completed_at && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completed: {formatDate(task.completed_at)}
                          </div>
                        )}
                      </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                      >
                        View Details
                      </Link>
                      {hasPermission('projects', 'create') && (
                        <button
                          onClick={() => handleDetachTask(task.id)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center"
                          title="Detach from project"
                        >
                          <Unlink className="w-4 h-4 mr-1" />
                          Detach
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
            
            <form onSubmit={handleUpdateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Update Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newTaskData.priority}
                  onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_private" className="ml-2 block text-sm text-gray-900">
                  Private Task
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach Task Modal */}
      {showAttachTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Attach Existing Task</h3>
            <form onSubmit={handleAttachTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Task</label>
                <select
                  value={selectedTaskId || ''}
                  onChange={(e) => setSelectedTaskId(parseInt(e.target.value) || null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <p className="text-sm text-gray-500">No standalone tasks available to attach.</p>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAttachTaskModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedTaskId}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Attach Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;