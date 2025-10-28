import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, ArrowRight } from 'lucide-react';

interface EmptyProjectStateProps {
  title?: string;
  description?: string;
  showCreateButton?: boolean;
  illustration?: 'default' | 'search' | 'filter';
}

const EmptyProjectState: React.FC<EmptyProjectStateProps> = ({
  title = "No projects yet",
  description = "Create your first project to get started with project management.",
  showCreateButton = true,
  illustration = 'default'
}) => {
  const getIllustration = () => {
    switch (illustration) {
      case 'search':
        return (
          <div className="relative">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <FolderOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-primary dark:text-blue-400 text-lg">🔍</span>
            </div>
          </div>
        );
      case 'filter':
        return (
          <div className="relative">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <FolderOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <span className="text-amber-600 dark:text-amber-400 text-lg">⚡</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-gray-200 dark:border-gray-700">
            <FolderOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center py-16"
    >
      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {getIllustration()}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Actions */}
      {showCreateButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/projects/create"
            className="group flex items-center space-x-2 gradient-primary hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Project</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            or{' '}
            <Link 
              to="/tasks"
              className="text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              browse existing tasks
            </Link>
          </div>
        </motion.div>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-100 dark:bg-purple-900/20 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full opacity-20"></div>
      </div>
    </motion.div>
  );
};

export default EmptyProjectState;
