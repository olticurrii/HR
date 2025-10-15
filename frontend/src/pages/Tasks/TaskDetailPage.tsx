import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, CheckCircle, Clock, AlertCircle, User, Calendar, FolderOpen } from 'lucide-react';
import { taskService, Task } from '../../services/taskService';
import { projectService, Project } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import CommentsSection from '../../components/Tasks/CommentsSection';
import toast from 'react-hot-toast';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      loadTask(parseInt(id));
    }
  }, [id]);

  const loadTask = async (taskId: number) => {
    setLoading(true);
    try {
      const taskData = await taskService.getTask(taskId);
      setTask(taskData);
      
      // If task belongs to a project, load project details
      if (taskData.project_id) {
        try {
          const projectData = await projectService.getProject(taskData.project_id);
          setProject(projectData);
        } catch (error) {
          console.error('Error loading project:', error);
        }
      }
    } catch (error) {
      console.error('Error loading task:', error);
      toast.error('Failed to load task details');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
        <p>Loading task details...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6 text-center text-gray-500">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>Task not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <span>/</span>
        <Link to="/tasks" className="hover:text-gray-900 transition-colors">
          Tasks
        </Link>
        {project && (
          <>
            <span>/</span>
            <Link 
              to={`/projects/${project.id}`} 
              className="flex items-center hover:text-gray-900 transition-colors"
            >
              <FolderOpen className="w-4 h-4 mr-1" />
              {project.title}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium">{task.title}</span>
      </div>

      {/* Task Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {getStatusIcon(task.status)}
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Task Details */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {task.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Task Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="text-gray-600">Assignee: </span>
                  <span className="ml-2 font-medium">
                    {task.assignee_name || 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="text-gray-600">Created by: </span>
                  <span className="ml-2 font-medium">
                    {task.creator_name || 'Unknown'}
                  </span>
                </div>
                {task.project_name && (
                  <div className="flex items-center">
                    <FolderOpen className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-600">Project: </span>
                    <Link 
                      to={`/projects/${task.project_id}`}
                      className="ml-2 font-medium text-blue-600 hover:text-blue-800"
                    >
                      {task.project_name}
                    </Link>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-600">Due date: </span>
                    <span className="ml-2 font-medium">{formatDate(task.due_date)}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="text-gray-600">Created: </span>
                  <span className="ml-2 font-medium">{formatDate(task.created_at)}</span>
                </div>
                {task.completed_at && (
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                    <span className="text-gray-600">Completed: </span>
                    <span className="ml-2 font-medium text-green-600">{formatDate(task.completed_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Task Properties</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Private:</span>
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${task.is_private ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {task.is_private ? 'Yes' : 'No'}
                  </span>
                </div>
                {task.position && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Position in Project:</span>
                    <span className="font-medium">{task.position}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/tasks/${task.id}/edit`)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Task
                </button>
                {project && (
                  <Link
                    to={`/projects/${project.id}`}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    View Project
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <CommentsSection taskId={task.id} />
    </div>
  );
};

export default TaskDetailPage;
