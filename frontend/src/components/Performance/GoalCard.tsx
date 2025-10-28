import React from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, CheckCircle, Edit } from "lucide-react";
import type { Goal } from "../../services/performanceService";

interface GoalCardProps {
  goal: Goal;
  onGoalUpdated?: () => void;
  isApprovalView?: boolean;
  onApprove?: (goalId: number) => void;
  onReject?: (goalId: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onGoalUpdated, isApprovalView = false, onApprove, onReject }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-700 bg-green-100";
      case "pending": return "text-yellow-700 bg-yellow-100";
      case "active": return "text-blue-700 bg-blue-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };
  return (
    <motion.div className="bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(goal.status)}`}>{goal.status}</span>
      </div>
      {goal.description && <p className="text-gray-600 text-sm mb-4">{goal.description}</p>}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-primary">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${goal.progress}%` }} />
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center"><Calendar className="w-3 h-3 mr-1" /><span>Created: {new Date(goal.created_at).toLocaleDateString()}</span></div>
        {goal.due_date && <div className="flex items-center"><Clock className="w-3 h-3 mr-1" /><span>Due: {new Date(goal.due_date).toLocaleDateString()}</span></div>}
      </div>
      <div className="flex gap-2">
        {isApprovalView ? (
          <>
            <button onClick={() => onApprove?.(goal.id)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Approve</button>
            <button onClick={() => onReject?.(goal.id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Reject</button>
          </>
        ) : (
          <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Edit className="w-4 h-4 mr-2" />Update Progress
          </button>
        )}
      </div>
    </motion.div>
  );
};
export default GoalCard;
