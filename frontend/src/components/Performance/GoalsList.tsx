import React from 'react';
import { motion } from 'framer-motion';
import { Target, Loader2 } from 'lucide-react';
import GoalCard from './GoalCard';
import EmptyState from './EmptyState';
import type { Goal } from '../../services/performanceService';

interface GoalsListProps {
  goals: Goal[];
  loading?: boolean;
  error?: string;
  onGoalUpdated?: () => void;
  isApprovalView?: boolean;
  onApprove?: (goalId: number) => void;
  onReject?: (goalId: number) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  showCreateButton?: boolean;
  onCreateNewGoal?: () => void;
}

const GoalsList: React.FC<GoalsListProps> = ({
  goals,
  loading = false,
  error,
  onGoalUpdated,
  isApprovalView = false,
  onApprove,
  onReject,
  emptyStateTitle = "No goals yet",
  emptyStateDescription = "Create your first performance goal to start tracking progress.",
  showCreateButton = true,
  onCreateNewGoal,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading goals...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title={emptyStateTitle}
        description={emptyStateDescription}
        actionLabel={showCreateButton ? "Create New Goal" : undefined}
        onAction={showCreateButton ? onCreateNewGoal : undefined}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal) => (
        <motion.div
          key={goal.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GoalCard
            goal={goal}
            onGoalUpdated={onGoalUpdated}
            isApprovalView={isApprovalView}
            onApprove={onApprove}
            onReject={onReject}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default GoalsList;