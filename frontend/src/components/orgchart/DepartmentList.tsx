import React, { useState, useCallback } from 'react';
import { Building2, Users } from 'lucide-react';
import { Department } from '../../services/departmentService';
import toast from 'react-hot-toast';

interface DepartmentListProps {
  departments: Department[];
  onDepartmentDrop: (userId: number, departmentId: number) => Promise<void>;
  canDrop: boolean;
}

interface DepartmentItemProps {
  department: Department;
  onDrop: (e: React.DragEvent, department: Department) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  isDragOver: boolean;
  canDrop: boolean;
}

const DepartmentItem: React.FC<DepartmentItemProps> = ({
  department,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  isDragOver,
  canDrop
}) => {
  return (
    <div
      className={`
        p-4 border rounded-lg cursor-pointer transition-all duration-200
        ${isDragOver 
          ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-300' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
        ${canDrop ? 'hover:bg-gray-50' : 'opacity-60 cursor-not-allowed'}
      `}
      onDrop={(e) => onDrop(e, department)}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <Building2 className="w-8 h-8 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {department.name}
          </h3>
          {department.description && (
            <p className="text-xs text-gray-500 truncate mt-1">
              {department.description}
            </p>
          )}
          <div className="flex items-center text-xs text-gray-400 mt-1">
            <Users className="w-3 h-3 mr-1" />
            <span>{department.employee_count || 0} employees</span>
          </div>
        </div>
      </div>
      
      {/* Drop indicator */}
      {isDragOver && (
        <div className="mt-2 text-xs text-blue-600 font-medium bg-white px-2 py-1 rounded shadow">
          Move to {department.name}
        </div>
      )}
    </div>
  );
};

const DepartmentList: React.FC<DepartmentListProps> = ({ 
  departments, 
  onDepartmentDrop, 
  canDrop 
}) => {
  const [dragOverDepartmentId, setDragOverDepartmentId] = useState<number | null>(null);

  const handleDrop = useCallback(async (e: React.DragEvent, department: Department) => {
    e.preventDefault();
    
    if (!canDrop) return;
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (dragData.type === 'user') {
        await onDepartmentDrop(parseInt(dragData.id), department.id);
        toast.success(`Moved ${dragData.name} to ${department.name}`);
      }
    } catch (error) {
      console.error('Error moving user to department:', error);
      toast.error('Failed to move user to department');
    } finally {
      setDragOverDepartmentId(null);
    }
  }, [canDrop, onDepartmentDrop]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (canDrop) {
      e.dataTransfer.dropEffect = 'move';
    }
  }, [canDrop]);

  const handleDragEnter = useCallback((e: React.DragEvent, department: Department) => {
    e.preventDefault();
    if (canDrop) {
      setDragOverDepartmentId(department.id);
    }
  }, [canDrop]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if we're leaving the department item
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverDepartmentId(null);
    }
  }, []);

  if (!departments || departments.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No departments available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700 mb-3">
        Drop employees onto departments to move them:
      </div>
      {departments.map((department) => (
        <DepartmentItem
          key={department.id}
          department={department}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, department)}
          onDragLeave={handleDragLeave}
          isDragOver={dragOverDepartmentId === department.id}
          canDrop={canDrop}
        />
      ))}
    </div>
  );
};

export default DepartmentList;
