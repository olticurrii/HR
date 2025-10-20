import React, { useState, useEffect } from 'react';
import { Network, Users, AlertCircle, ChevronDown, ZoomIn, ZoomOut, RotateCcw, Layout, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { OrgChartResponse } from '../../services/orgchartService';
import { Department } from '../../services/departmentService';
import orgchartService from '../../services/orgchartService';
import departmentService from '../../services/departmentService';
import { settingsService, OrganizationSettings } from '../../services/settingsService';
import DraggableOrgChart from '../../components/orgchart/DraggableOrgChart';
import UserProfileModal from '../../components/orgchart/UserProfileModal';
import toast from 'react-hot-toast';

const OrgChartPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orgData, setOrgData] = useState<OrgChartResponse>({ assigned: [], unassigned: [] });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  
  // Persistent view state (survives data refresh)
  // Start with a reasonable zoom to see the org chart
  const [persistentZoom, setPersistentZoom] = useState<number>(0.6);
  const [persistentPan, setPersistentPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Organization settings
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings | null>(null);
  const [isCompactView, setIsCompactView] = useState(false);

  useEffect(() => {
    loadData();
    loadOrgSettings();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      loadData();
    }
  }, [selectedDepartment]);

  const loadData = async () => {
    console.log('📥 [OrgChartPage] loadData called, fetching from backend...');
    setLoading(true);
    setError(null);
    try {
      const departmentId = selectedDepartment === 'all' ? undefined : parseInt(selectedDepartment);
      
      const [orgChartData, departmentsData] = await Promise.all([
        orgchartService.getOrgChart(departmentId),
        departmentService.getAllDepartments()
      ]);
      
      console.log('📊 [OrgChartPage] Data fetched:', {
        assigned: orgChartData.assigned.length,
        unassigned: orgChartData.unassigned.length,
        departments: departmentsData.length
      });
      
      setOrgData(orgChartData);
      setDepartments(departmentsData);
      console.log('✅ [OrgChartPage] State updated with new data');
    } catch (error) {
      console.error('❌ [OrgChartPage] Error loading org chart data:', error);
      setError('Failed to load organization data');
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const loadOrgSettings = async () => {
    try {
      const settings = await settingsService.getOrgSettings();
      setOrgSettings(settings);
      setIsCompactView(settings.orgchart_compact_view);
    } catch (error) {
      console.error('Failed to load org settings:', error);
    }
  };

  const handleReassign = async (userId: number, newManagerId?: number | null, newDepartmentId?: number | null) => {
    console.log('🔄 [OrgChartPage] handleReassign called:', { userId, newManagerId, newDepartmentId });
    
    try {
      // When assigning to a new manager, also get that manager's department
      let targetDeptId = newDepartmentId;
      
      if (newManagerId && !newDepartmentId) {
        // Find the manager in the org data to get their department
        const findUserInTree = (users: any[]): any => {
          for (const u of users) {
            if (u.id === newManagerId.toString()) return u;
            if (u.children && u.children.length > 0) {
              const found = findUserInTree(u.children);
              if (found) return found;
            }
          }
          return null;
        };
        
        const manager = findUserInTree([...orgData.assigned, ...orgData.unassigned]);
        if (manager && manager.department) {
          // Find the department ID by name
          const dept = departments.find(d => d.name === manager.department);
          if (dept) {
            targetDeptId = dept.id;
          }
        }
      }
      
      console.log('📡 [OrgChartPage] Calling backend reassignUser...');
      await orgchartService.reassignUser({
        user_id: userId,
        new_manager_id: newManagerId,
        new_department_id: targetDeptId
      });
      
      console.log('✅ [OrgChartPage] Backend call successful, reloading data...');
      toast.success('Employee reassigned successfully');
      
      // Reload data to reflect changes
      await loadData();
      console.log('✅ [OrgChartPage] Data reloaded successfully');
    } catch (error: any) {
      console.error('❌ [OrgChartPage] Error reassigning user:', error);
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
    // Navigate to employee profile page
    navigate(`/people/${user.id}`);
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

  // Get user's subtree (for manager permission check)
  const getUserSubtree = (userId: number): Set<string> => {
    const subtree = new Set<string>();
    subtree.add(userId.toString()); // Include self
    
    const collectDescendants = (users: any[]) => {
      users.forEach(user => {
        subtree.add(user.id);
        if (user.children && user.children.length > 0) {
          collectDescendants(user.children);
        }
      });
    };
    
    // Find user's node in the tree
    const findUserNode = (users: any[]): any | null => {
      for (const u of users) {
        if (u.id === userId.toString()) return u;
        if (u.children && u.children.length > 0) {
          const found = findUserNode(u.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const userNode = findUserNode(orgData.assigned);
    if (userNode && userNode.children) {
      collectDescendants(userNode.children);
    }
    
    return subtree;
  };

  // Check if current user can drag a specific node
  const canDragNode = (nodeId: string): boolean => {
    // If manager subtree edit is disabled, allow all (original behavior)
    if (!orgSettings?.orgchart_manager_subtree_edit) return true;
    
    // Admins can drag anyone
    if (user?.is_admin || user?.role === 'admin') return true;
    
    // Non-managers cannot drag
    if (user?.role !== 'manager') return false;
    
    // Managers can only drag nodes in their subtree
    const subtree = getUserSubtree(user.id);
    return subtree.has(nodeId);
  };

  const handleZoomIn = () => {
    setPersistentZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setPersistentZoom(prev => Math.max(prev - 0.1, 0.2));
  };

  const handleResetZoom = () => {
    setPersistentZoom(0.6);
  };

  // Permission checks
  const canView = user && (user.is_admin || user.job_role?.toLowerCase().includes('manager'));
  // Allow admins and managers to drag employees
  const canDrag = user && (user.is_admin || user.job_role?.toLowerCase().includes('manager') || user.job_role?.toLowerCase().includes('ceo'));

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
          
          {/* Compact View Toggle */}
          {orgSettings?.orgchart_compact_view && (
            <button
              onClick={() => setIsCompactView(!isCompactView)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                isCompactView
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
              title={isCompactView ? 'Switch to Detailed View' : 'Switch to Compact View'}
            >
              {isCompactView ? <Layout className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {isCompactView ? 'Detailed' : 'Compact'}
              </span>
            </button>
          )}
          
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
              {Math.round(persistentZoom * 100)}%
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
        </div>
      </div>

      {/* Organization Tree - Full Width with Unassigned Inside */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
        <div className="w-full relative" style={{ height: 'calc(100vh - 350px)', minHeight: '600px' }}>
          <DraggableOrgChart
            data={orgData.assigned}
            unassignedEmployees={orgData.unassigned}
            onReassign={handleReassign}
            onUserClick={handleUserClick}
            initialZoom={persistentZoom}
            initialPan={persistentPan}
            onZoomChange={setPersistentZoom}
            onPanChange={setPersistentPan}
            settings={orgSettings}
            isCompactView={isCompactView}
            canDragNode={canDragNode}
            departments={departments}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Navigation & Controls</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Scroll or use two fingers on touchpad to zoom in/out</li>
          <li>• Click and drag the background to pan around the chart</li>
          <li>• Click on any employee card to view their profile</li>
          {canDrag && (
            <>
              <li>• <strong>Drag the handle icon (⋮⋮)</strong> on the left side of employee cards to move them</li>
              <li>• Drop onto another employee to reassign manager and department</li>
              <li>• The employee and their entire team will move together automatically</li>
            </>
          )}
        </ul>
      </div>

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
