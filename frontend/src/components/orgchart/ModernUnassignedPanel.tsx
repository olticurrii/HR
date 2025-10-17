import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertCircle } from 'lucide-react';
import { useDroppable, useDraggable } from '@dnd-kit/core';

export interface UnassignedEmployee {
  id: string;
  name: string;
  title: string;
  department?: string;
  avatar_url?: string;
}

interface ModernUnassignedPanelProps {
  employees: UnassignedEmployee[];
  onEmployeeClick?: (employee: UnassignedEmployee) => void;
  activeNodeId?: string | null;
}

const ModernUnassignedPanel: React.FC<ModernUnassignedPanelProps> = ({
  employees,
  onEmployeeClick,
  activeNodeId,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'unassigned-drop-zone',
    data: { isUnassignedZone: true },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        h-full flex flex-col
        transition-all duration-300
        ${isOver ? 'bg-blue-50' : 'bg-gradient-to-b from-gray-50 to-white'}
      `}
      style={{
        borderLeft: isOver ? '3px solid #5B8EF1' : '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Header */}
      <motion.div
        className={`
          sticky top-0 z-10 px-6 py-4 border-b
          transition-all duration-300
          ${isOver ? 'bg-blue-100 border-blue-200' : 'bg-white border-gray-100'}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`
              p-2 rounded-xl transition-colors
              ${isOver ? 'bg-blue-200' : 'bg-gray-100'}
            `}>
              <Users className={`w-5 h-5 ${isOver ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Unassigned
              </h3>
              <p className="text-xs text-gray-500">
                {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
              </p>
            </div>
          </div>
        </div>

        {/* Drop Hint */}
        <AnimatePresence>
          {isOver && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 flex items-center gap-2 bg-blue-200 px-3 py-2 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-blue-700" />
              <span className="text-xs text-blue-700 font-medium">
                Drop here to unassign
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Employee List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              No unassigned employees
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isOver ? 'Drop an employee here' : 'All employees are assigned'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {employees.filter(e => e.id !== activeNodeId).map((employee, index) => (
              <DraggableUnassignedCard
                key={employee.id}
                employee={employee}
                index={index}
                onClick={() => onEmployeeClick?.(employee)}
                getInitials={getInitials}
                getAvatarColor={getAvatarColor}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

// Separate component for draggable unassigned cards
const DraggableUnassignedCard: React.FC<{
  employee: UnassignedEmployee;
  index: number;
  onClick: () => void;
  getInitials: (name: string) => string;
  getAvatarColor: (name: string) => string;
}> = ({ employee, index, onClick, getInitials, getAvatarColor }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `unassigned-${employee.id}`,
    data: { node: { id: employee.id, name: employee.name, title: employee.title, department: employee.department, avatar_url: employee.avatar_url } },
  });

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      key={employee.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: isDragging ? 1 : 1.02, x: isDragging ? 0 : 4 }}
      onClick={onClick}
      className={`
        relative p-3 rounded-xl cursor-grab active:cursor-grabbing
        bg-white border border-gray-100
        hover:border-blue-200 hover:shadow-md
        transition-all duration-200
        ${isDragging ? 'opacity-50' : ''}
      `}
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-full
            flex items-center justify-center text-white font-bold text-xs
            bg-gradient-to-br ${getAvatarColor(employee.name)}
            shadow-sm
          `}
        >
          {employee.avatar_url ? (
            <img
              src={employee.avatar_url}
              alt={employee.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(employee.name)
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate">
            {employee.name}
          </h4>
          <p className="text-xs text-gray-500 truncate">
            {employee.title}
          </p>
          {employee.department && (
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {employee.department}
            </p>
          )}
        </div>

        {/* Drag Indicator */}
        <div className="flex-shrink-0 text-gray-300">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <circle cx="4" cy="4" r="1.5" />
            <circle cx="12" cy="4" r="1.5" />
            <circle cx="4" cy="8" r="1.5" />
            <circle cx="12" cy="8" r="1.5" />
            <circle cx="4" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
          </svg>
        </div>
      </div>

      {/* Hover Glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(91, 142, 241, 0.05), transparent)',
        }}
      />
    </motion.div>
  );
};

export default ModernUnassignedPanel;

