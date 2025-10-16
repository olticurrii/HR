import React, { useState, useEffect } from 'react';
import { Network, Users, AlertCircle, ChevronDown, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { OrgChartResponse } from '../../services/orgchartService';
import { Department } from '../../services/departmentService';
import orgchartService from '../../services/orgchartService';
import departmentService from '../../services/departmentService';
import SimpleOrgTree from '../../components/orgchart/SimpleOrgTree';
import UserProfileModal from '../../components/orgchart/UserProfileModal';
import toast from 'react-hot-toast';

const OrgChartPage: React.FC = () => {
  const { user } = useAuth();
  const [orgData, setOrgData] = useState<OrgChartResponse>({ assigned: [], unassigned: [] });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      loadData();
    }
  }, [selectedDepartment]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const departmentId = selectedDepartment === 'all' ? undefined : parseInt(selectedDepartment);
      
      const [orgChartData, departmentsData] = await Promise.all([
        orgchartService.getOrgChart(departmentId),
        departmentService.getAllDepartments()
      ]);
      setOrgData(orgChartData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading org chart data:', error);
      setError('Failed to load organization data');
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async (userId: number, newManagerId?: number | null, newDepartmentId?: number | null) => {
    try {
      await orgchartService.reassignUser({
        user_id: userId,
        new_manager_id: newManagerId,
        new_department_id: newDepartmentId
      });
      
      // Reload data to reflect changes
      await loadData();
    } catch (error: any) {
      console.error('Error reassigning user:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to reassign user';
      toast.error(errorMessage);
      throw error; // Re-throw to let the component handle optimistic updates
    }
  };

  const handleDepartmentDrop = async (userId: number, departmentId: number) => {
    try {
      await orgchartService.reassignUser({
        user_id: userId,
        new_manager_id: null,
        new_department_id: departmentId
      });
      
      // Reload data to reflect changes
      await loadData();
    } catch (error: any) {
      console.error('Error moving user to department:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to move user to department';
      toast.error(errorMessage);
      throw error; // Re-throw to let the component handle optimistic updates
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const getAllUsers = (): any[] => {
    const allUsers: any[] = [];
    
    const collectUsers = (users: any[]) => {
      users.forEach(user => {
        allUsers.push(user);
        if (user.children && user.children.length > 0) {
          collectUsers(user.children);
        }
      });
    };
    
    collectUsers(orgData.assigned);
    collectUsers(orgData.unassigned);
    
    return allUsers;
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.3));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Permission checks
  const canView = user && (user.is_admin || user.job_role?.toLowerCase().includes('manager'));
  const canDrag = user?.is_admin || false;

  if (!canView) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Network className="w-6 h-6 mr-2" />
            Organization Chart
          </h1>
          <p className="text-gray-600">View and manage your organization structure</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-500">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Access Denied</h3>
            <p className="text-sm">You don't have permission to view the organization chart</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Network className="w-6 h-6 mr-2" />
            Organization Chart
          </h1>
          <p className="text-gray-600">View and manage your organization structure</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-500">
            <Network className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
            <h3 className="text-lg font-medium mb-2">Loading organization chart...</h3>
            <p className="text-sm">Please wait while we load the data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Network className="w-6 h-6 mr-2" />
            Organization Chart
          </h1>
          <p className="text-gray-600">View and manage your organization structure</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-500">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-300" />
            <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Network className="w-6 h-6 mr-2" />
            Organization Chart
          </h1>
          <p className="text-gray-600">
            {canDrag 
              ? "Drag and drop employees to reassign managers or move to departments" 
              : "View your organization structure"
            }
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Department Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={loadData}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Organization Tree - Full Width */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Organization Structure
            {selectedDepartment !== 'all' && (
              <span className="ml-2 text-sm text-gray-500">
                - {departments.find(d => d.id.toString() === selectedDepartment)?.name}
              </span>
            )}
          </h2>
        </div>
        <div className="p-4 h-[600px]">
          <SimpleOrgTree
            data={orgData.assigned}
            onReassign={handleReassign}
            onDepartmentDrop={handleDepartmentDrop}
            onUserClick={handleUserClick}
            zoomLevel={zoomLevel}
          />
        </div>
      </div>
          
      {/* Unassigned Employees Section */}
      {orgData.unassigned.length > 0 && (
        <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
                  Unassigned Employees
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Drag employees from here to assign them to managers
                </p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {orgData.unassigned.map((employee) => (
                    <div
                      key={employee.id}
                      className={`
                        bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-3 cursor-move
                        hover:border-blue-400 hover:bg-blue-50 transition-all duration-200
                        ${canDrag ? 'hover:shadow-md' : 'cursor-not-allowed opacity-70'}
                      `}
                      draggable={canDrag}
                      onDragStart={(e) => {
                        if (!canDrag) {
                          e.preventDefault();
                          return;
                        }
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', JSON.stringify({
                          type: 'user',
                          id: employee.id,
                          name: employee.name
                        }));
                      }}
                      title={canDrag ? `Drag ${employee.name} to assign to a manager` : "You don't have permission to drag employees"}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {employee.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {employee.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
      )}

      {/* Instructions for admins */}
      {canDrag && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Drag & Drop Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Drag an employee card onto another employee to make them the manager</li>
            <li>• Drag an employee card onto a department to move them to that department</li>
            <li>• The entire subtree (direct reports) will move with the employee</li>
            <li>• Invalid moves (cycles, permissions) will be blocked with error messages</li>
            <li>• Click on any employee card to open their profile and make changes</li>
          </ul>
        </div>
      )}

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUser}
        departments={departments}
        onReassign={handleReassign}
        allUsers={getAllUsers()}
      />
    </div>
  );
};

export default OrgChartPage;
