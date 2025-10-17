import React, { useState, useEffect } from 'react';
import { employeeProfileService, WorkflowItem } from '../../services/employeeProfileService';
import { useNavigate } from 'react-router-dom';

interface WorkflowsTabProps {
  userId: number;
}

export const WorkflowsTab: React.FC<WorkflowsTabProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, [userId]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await employeeProfileService.getWorkflows(userId);
      setWorkflows(data);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('done')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (statusLower.includes('progress') || statusLower.includes('active')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (statusLower.includes('awaiting') || statusLower.includes('pending')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleItemClick = (item: WorkflowItem) => {
    if (item.type === 'task') {
      navigate(`/tasks/${item.id}`);
    } else if (item.type === 'project') {
      navigate(`/projects/${item.id}`);
    }
  };

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">Loading workflows...</div>;
  }

  const tasks = workflows.filter(w => w.type === 'task');
  const projects = workflows.filter(w => w.type === 'project');

  return (
    <div className="space-y-6">
      {/* Tasks Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            Assigned Tasks ({tasks.length})
          </h3>
        </div>
        <div className="p-6">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tasks assigned</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleItemClick(task)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition text-left"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{task.title}</h4>
                    {task.due_date && (
                      <p className="text-sm text-gray-500 mt-1">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            Projects ({projects.length})
          </h3>
        </div>
        <div className="p-6">
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No projects</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleItemClick(project)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition text-left"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{project.title}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

