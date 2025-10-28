import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, BarChart3 } from 'lucide-react';
import { useQuery } from 'react-query';
import { taskService, Task } from '../../services/taskService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Import our new components
import TaskFiltersComponent, { TaskFilters as TaskFiltersType } from '../../components/Tasks/TaskFilters';
import TaskList from '../../components/Tasks/TaskList';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // View state
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  // Filter state
  const [filters, setFilters] = useState<TaskFiltersType>({
    search: '',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Fetch tasks with React Query for caching and automatic refetching
  const { 
    data: tasks = [], 
    isLoading: tasksLoading, 
    error: tasksError,
    refetch: refetchTasks 
  } = useQuery(
    'tasks',
    taskService.getAllTasks,
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Error loading tasks:', error);
        toast.error('Failed to load tasks');
      }
    }
  );

  // Fetch users for assignee filter
  const { data: users = [] } = useQuery(
    'users-for-tasks',
    userService.getAllUsers,
    {
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        console.error('Error loading users:', error);
      }
    }
  );

  // Transform users for assignee filter
  const assignees = useMemo(() => 
    users.map(user => ({
      id: user.id,
      name: user.full_name
    }))
  , [users]);

  // Filter and sort tasks based on current filters
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.assignee_name?.toLowerCase().includes(searchLower) ||
        task.creator_name?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Assignee filter
    if (filters.assignee !== 'all') {
      if (filters.assignee === 'unassigned') {
        filtered = filtered.filter(task => !task.assignee_id);
      } else {
        filtered = filtered.filter(task => task.assignee_id?.toString() === filters.assignee);
      }
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Task];
      let bValue: any = b[filters.sortBy as keyof Task];

      // Handle different data types
      if (filters.sortBy === 'due_date' || filters.sortBy === 'created_at') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (filters.sortBy === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      } else if (filters.sortBy === 'status') {
        const statusOrder = { pending: 1, in_progress: 2, completed: 3, cancelled: 4 };
        aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
        bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tasks, filters]);

  // Task statistics for header
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(t => 
      t.due_date && 
      new Date(t.due_date) < new Date() && 
      t.status !== 'completed'
    ).length;

    return { total, completed, inProgress, pending, overdue };
  }, [tasks]);

  const handleEdit = (task: Task) => {
    navigate(`/tasks/${task.id}/edit`);
  };

  const handleDelete = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.deleteTask(taskId);
      toast.success('Task deleted successfully');
      refetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      assignee: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  // Store view preference
  useEffect(() => {
    const savedView = localStorage.getItem('tasks-view') as 'grid' | 'list';
    if (savedView) setView(savedView);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks-view', view);
  }, [view]);

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="gradient-primary rounded-3xl p-8 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-medium mb-2 flex flex-col">
                <span className="flex items-center">
                  <CheckSquare className="w-8 h-8 mr-3" />
                  Task Management
                </span>
                <span className="accent-line mt-2"></span>
              </h1>
              <p className="text-primary-100 text-lg font-normal">
                Organize, track, and complete your tasks efficiently
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-medium">{taskStats.total}</div>
                  <div className="text-xs text-primary-100">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-green-300">{taskStats.completed}</div>
                  <div className="text-xs text-primary-100">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-yellow-300">{taskStats.inProgress}</div>
                  <div className="text-xs text-primary-100">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-red-300">{taskStats.overdue}</div>
                  <div className="text-xs text-primary-100">Overdue</div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to="/tasks/create"
                className="flex items-center px-6 py-3 bg-white text-primary font-medium rounded-xl hover:bg-accent hover:text-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-accent"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Task
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8"
      >
        <TaskFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          view={view}
          onViewChange={setView}
          onRefresh={refetchTasks}
          assignees={assignees}
          loading={tasksLoading}
        />
      </motion.div>

      {/* Results Summary */}
      {filteredTasks.length !== tasks.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4"
        >
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-primary dark:text-primary-400" />
            <span className="text-primary-800 dark:text-primary-200 font-medium">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </span>
          </div>
          <button
            onClick={clearFilters}
            className="text-primary dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
          >
            Clear filters to see all
          </button>
        </motion.div>
      )}

      {/* Task List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8"
      >
        <TaskList
          tasks={filteredTasks}
          loading={tasksLoading}
          view={view}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyStateTitle={
            filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all'
              ? "No tasks match your filters"
              : "No tasks yet"
          }
          emptyStateDescription={
            filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all'
              ? "Try adjusting your search criteria or filters to find more tasks."
              : "Create your first task to get started with project management."
          }
          showCreateButton={
            !(filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all')
          }
        />
      </motion.div>

      {/* Error State */}
      {tasksError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
            Failed to load tasks
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-6">
            There was a problem loading your tasks. Please try again.
          </p>
          <button
            onClick={() => refetchTasks()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      )}
    </>
  );
};

export default TasksPage;
