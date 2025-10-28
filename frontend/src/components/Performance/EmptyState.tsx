import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <motion.div className="text-center py-16 px-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
      <div className="w-20 h-20 mx-auto mb-6 gradient-primary rounded-2xl flex items-center justify-center">
        <Icon className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
