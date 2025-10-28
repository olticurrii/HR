import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Loader, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Task } from '../../services/taskService';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  view?: 'grid' | 'list';
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  showCreateButton?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading = false,
  view = 'grid',
  onEdit,
  onDelete,
  emptyStateTitle = "No tasks found",
  emptyStateDescription = "Create your first task to get started with project management.",
  showCreateButton = true
}) => {
  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
      {Array.from({ length: view === 'grid' ? 6 : 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 animate-pulse"
        >
          {view === 'grid' ? (
            // Grid view skeleton
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ) : (
            // List view skeleton
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckSquare className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>
        
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          {emptyStateTitle}
        </h3>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {emptyStateDescription}
        </p>
        
        {showCreateButton && (
          <Link
            to="/tasks/create"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Task
          </Link>
        )}
      </div>
    </motion.div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-8 h-8 text-primary animate-spin mr-3" />
          <span className="text-gray-600 dark:text-gray-400">Loading tasks...</span>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return <EmptyState />;
  }

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid gap-6 ${
        view === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}
    >
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            variants={itemVariants}
            layout
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <TaskCard
              task={task}
              view={view}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskList;
