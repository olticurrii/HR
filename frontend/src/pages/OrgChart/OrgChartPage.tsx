import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Users, AlertCircle, Layout, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { OrgChartResponse } from '../../services/orgchartService';
import { Department } from '../../services/departmentService';
import orgchartService from '../../services/orgchartService';
import departmentService from '../../services/departmentService';
import { settingsService, OrganizationSettings } from '../../services/settingsService';
import DraggableOrgChart from '../../components/orgchart/DraggableOrgChart';
import UserProfileModal from '../../components/orgchart/UserProfileModal';
import ZoomControls from '../../components/orgchart/ZoomControls';
import DepartmentFilter from '../../components/orgchart/DepartmentFilter';
import toast from 'react-hot-toast';
import TRAXCIS_COLORS from '../../theme/traxcis';

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
  const [isDark, setIsDark] = useState(false);
  
  // Persistent view state (survives data refresh)
  const [persistentZoom, setPersistentZoom] = useState<number>(0.6);
  const [persistentPan, setPersistentPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Organization settings
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings | null>(null);
  const [isCompactView, setIsCompactView] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

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
      let targetDeptId = newDepartmentId;
      
      if (newManagerId && !newDepartmentId) {
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
      
      await loadData();
      console.log('✅ [OrgChartPage] Data reloaded successfully');
    } catch (error: any) {
      console.error('❌ [OrgChartPage] Error reassigning user:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to reassign user';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDepartmentDrop = async (userId: number, departmentId: number) => {
    try {
      await orgchartService.reassignUser({
        user_id: userId,
        new_manager_id: null,
        new_department_id: departmentId
      });
      
      await loadData();
    } catch (error: any) {
      console.error('Error moving user to department:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to move user to department';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleUserClick = (user: any) => {
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

  const getUserSubtree = (userId: number): Set<string> => {
    const subtree = new Set<string>();
    subtree.add(userId.toString());
    
    const collectDescendants = (users: any[]) => {
      users.forEach(user => {
        subtree.add(user.id);
        if (user.children && user.children.length > 0) {
          collectDescendants(user.children);
        }
      });
    };
    
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

  const canDragNode = (nodeId: string): boolean => {
    if (!orgSettings?.orgchart_manager_subtree_edit) return true;
    if (user?.is_admin || user?.role === 'admin') return true;
    if (user?.role !== 'manager') return false;
    
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

  // Theme colors
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const instructionsBg = isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50];
  const instructionsBorder = isDark ? TRAXCIS_COLORS.primary[700] : TRAXCIS_COLORS.primary[200];
  const instructionsText = isDark ? TRAXCIS_COLORS.primary[100] : TRAXCIS_COLORS.primary[900];

  const canView = user && (user.is_admin || user.job_role?.toLowerCase().includes('manager'));
  const canDrag = user && (user.is_admin || user.job_role?.toLowerCase().includes('manager') || user.job_role?.toLowerCase().includes('ceo'));

  if (!canView) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '500',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Network style={{ width: '28px', height: '28px' }} />
            Organization Chart
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', marginTop: '8px', fontSize: '15px' }}>
            View and manage your organization structure
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: cardBg,
            borderRadius: '16px',
            boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: `1px solid ${cardBorder}`,
            padding: '64px',
          }}
        >
          <div style={{ textAlign: 'center', color: subTextColor }}>
            <AlertCircle style={{ width: '64px', height: '64px', margin: '0 auto 16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: textColor }}>
              Access Denied
            </h3>
            <p style={{ fontSize: '14px' }}>
              You don't have permission to view the organization chart
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '500',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Network style={{ width: '28px', height: '28px' }} />
            Organization Chart
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', marginTop: '8px', fontSize: '15px' }}>
            View and manage your organization structure
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: cardBg,
            borderRadius: '16px',
            boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: `1px solid ${cardBorder}`,
            padding: '64px',
          }}
        >
          <div style={{ textAlign: 'center', color: subTextColor }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block' }}
            >
              <Network style={{ width: '64px', height: '64px', margin: '0 auto 16px', opacity: 0.3 }} />
            </motion.div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: textColor }}>
              Loading organization chart...
            </h3>
            <p style={{ fontSize: '14px' }}>
              Please wait while we load the data
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '500',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Network style={{ width: '28px', height: '28px' }} />
            Organization Chart
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', marginTop: '8px', fontSize: '15px' }}>
            View and manage your organization structure
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: cardBg,
            borderRadius: '16px',
            boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: `1px solid ${cardBorder}`,
            padding: '64px',
          }}
        >
          <div style={{ textAlign: 'center', color: subTextColor }}>
            <AlertCircle style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: TRAXCIS_COLORS.status.error, opacity: 0.6 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: textColor }}>
              Error Loading Data
            </h3>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>{error}</p>
            <button
              onClick={loadData}
              style={{
                padding: '10px 20px',
                backgroundColor: TRAXCIS_COLORS.primary.DEFAULT,
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT}
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '500',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Network style={{ width: '28px', height: '28px' }} />
            Organization Chart
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', marginTop: '8px', fontSize: '15px' }}>
            {canDrag 
              ? "Drag and drop employees to reassign managers or move to departments" 
              : "View your organization structure"
            }
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Department Filter */}
          <DepartmentFilter
            departments={departments}
            selected={selectedDepartment}
            onChange={setSelectedDepartment}
          />
          
          {/* Compact View Toggle */}
          {orgSettings?.orgchart_compact_view && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setIsCompactView(!isCompactView)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${isCompactView ? TRAXCIS_COLORS.primary.DEFAULT : cardBorder}`,
                backgroundColor: isCompactView ? TRAXCIS_COLORS.primary.DEFAULT : cardBg,
                color: isCompactView ? '#FFFFFF' : textColor,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                fontWeight: '500',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={isCompactView ? 'Switch to Detailed View' : 'Switch to Compact View'}
            >
              {isCompactView ? <Layout style={{ width: '16px', height: '16px' }} /> : <LayoutGrid style={{ width: '16px', height: '16px' }} />}
              <span>{isCompactView ? 'Detailed' : 'Compact'}</span>
            </motion.button>
          )}
          
          {/* Zoom Controls */}
          <ZoomControls
            zoom={persistentZoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleResetZoom}
          />
        </div>
      </div>

      {/* Organization Tree */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: cardBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${cardBorder}`,
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Users style={{ width: '20px', height: '20px' }} />
            Organization Structure
            {selectedDepartment !== 'all' && (
              <span style={{ fontSize: '14px', color: subTextColor, fontWeight: '400' }}>
                - {departments.find(d => d.id.toString() === selectedDepartment)?.name}
              </span>
            )}
          </h2>
        </div>
        <div style={{ width: '100%', position: 'relative', height: 'calc(100vh - 350px)', minHeight: '600px' }}>
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
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: instructionsBg,
          border: `1px solid ${instructionsBorder}`,
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: instructionsText,
          marginBottom: '12px',
        }}>
          Navigation & Controls
        </h3>
        <ul style={{
          fontSize: '14px',
          color: instructionsText,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}>
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
      </motion.div>

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
