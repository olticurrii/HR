import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useAuth } from '../../contexts/AuthContext';
import { OrgChartResponse, OrgChartNode } from '../../services/orgchartService';
import orgchartService from '../../services/orgchartService';
import departmentService from '../../services/departmentService';
import TopToolbar from '../../components/orgchart/TopToolbar';
import ModernOrgChartCanvas from '../../components/orgchart/ModernOrgChartCanvas';
import ModernUnassignedPanel from '../../components/orgchart/ModernUnassignedPanel';
import EmployeeDrawer, { EmployeeDetails } from '../../components/orgchart/EmployeeDrawer';
import ModernEmployeeCard from '../../components/orgchart/ModernEmployeeCard';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const ModernOrgChartPage: React.FC = () => {
  const { user } = useAuth();
  const [orgData, setOrgData] = useState<OrgChartResponse>({ assigned: [], unassigned: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetails | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Drag and drop state
  const [activeNode, setActiveNode] = useState<any>(null);
  const draggedNodeRef = useRef<any>(null);
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('📥 [ModernOrgChartPage] Loading data...');
    setLoading(true);
    try {
      const [orgChartData, departmentsData] = await Promise.all([
        orgchartService.getOrgChart(),
        departmentService.getAllDepartments()
      ]);
      
      setOrgData(orgChartData);
      
      // Auto-expand first 2 levels
      const autoExpandIds = new Set<string>();
      const expandLevel = (nodes: OrgChartNode[], level: number) => {
        if (level >= 2) return;
        nodes.forEach((node) => {
          autoExpandIds.add(node.id);
          if (node.children) {
            expandLevel(node.children, level + 1);
          }
        });
      };
      expandLevel(orgChartData.assigned, 0);
      setExpandedIds(autoExpandIds);
      
      console.log('✅ [ModernOrgChartPage] Data loaded successfully');
    } catch (error) {
      console.error('❌ [ModernOrgChartPage] Error loading data:', error);
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async (userId: number, newManagerId?: number | null) => {
    console.log('🔄 [ModernOrgChartPage] Reassigning:', { userId, newManagerId });
    try {
      await orgchartService.reassignUser({
        user_id: userId,
        new_manager_id: newManagerId,
      });
      
      toast.success('Employee reassigned successfully');
      await loadData();
    } catch (error: any) {
      console.error('❌ [ModernOrgChartPage] Reassignment failed:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to reassign user';
      toast.error(errorMessage);
    }
  };

  // Drag and drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const node = event.active.data.current?.node;
    console.log('🎯 Drag started:', node);
    setActiveNode(node);
    draggedNodeRef.current = node; // Store in ref so it persists
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      
      // Get source node from active data or fallback to ref
      let sourceNode = active.data.current?.node;
      if (!sourceNode) {
        sourceNode = draggedNodeRef.current;
      }
      
      setActiveNode(null);
      draggedNodeRef.current = null;

      if (!over || active.id === over.id) {
        console.log('❌ Invalid drop');
        return;
      }
      
      if (!sourceNode) {
        console.log('❌ Missing source node');
        return;
      }
      
      console.log('✅ Source node found:', sourceNode.name);

      // ✅ CHECK IF DROPPING ON UNASSIGNED ZONE
      const isUnassignedZone = over.data.current?.isUnassignedZone === true;
      
      if (isUnassignedZone) {
        console.log('✅ Unassigning:', sourceNode.name);
        await handleReassign(parseInt(sourceNode.id), null);
        return;
      }

      // ✅ DROPPING ON A MANAGER CARD
      const targetId = over.id.toString().replace('drop-', '').replace('node-', '');
      if (sourceNode.id === targetId) {
        console.log('❌ Cannot drop on self');
        toast.error('Cannot assign employee to themselves');
        return;
      }

      const targetNode = over.data.current?.node;

      if (!targetNode) {
        console.log('❌ Missing target node');
        return;
      }

      // Check for cycles (prevent assigning a manager to their subordinate)
      const isDescendant = (parent: OrgChartNode, childId: string): boolean => {
        if (parent.id === childId) return true;
        if (!parent.children) return false;
        return parent.children.some((child) => isDescendant(child, childId));
      };

      // Find source node in tree to check if it has children
      const findNodeInTree = (nodes: OrgChartNode[], id: string): OrgChartNode | null => {
        for (const n of nodes) {
          if (n.id === id) return n;
          if (n.children) {
            const found = findNodeInTree(n.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const fullSourceNode = findNodeInTree(orgData.assigned, sourceNode.id);
      if (fullSourceNode && isDescendant(fullSourceNode, targetNode.id)) {
        console.log('❌ Would create cycle');
        toast.error('Cannot assign a manager to their own subordinate');
        return;
      }

      console.log('✅ Reassigning:', sourceNode.name, '→', targetNode.name);
      await handleReassign(parseInt(sourceNode.id), parseInt(targetNode.id));
    },
    [orgData.assigned, handleReassign]
  );

  // Toolbar handlers
  const handleAddEmployee = () => {
    toast('Add Employee feature coming soon!', { icon: '🚀' });
  };

  const handleZoomIn = () => {
    // React Flow handles zoom internally
  };

  const handleZoomOut = () => {
    // React Flow handles zoom internally
  };

  const handleFitView = () => {
    // React Flow handles fit view internally via Controls
  };

  const handleExpandAll = useCallback(() => {
    const allIds = new Set<string>();
    const collectIds = (nodes: OrgChartNode[]) => {
      nodes.forEach((node) => {
        allIds.add(node.id);
        if (node.children) {
          collectIds(node.children);
        }
      });
    };
    collectIds(orgData.assigned);
    setExpandedIds(allIds);
    toast.success('Expanded all nodes');
  }, [orgData.assigned]);

  const handleCollapseAll = useCallback(() => {
    // Keep only first level expanded
    const firstLevelIds = new Set(orgData.assigned.map(n => n.id));
    setExpandedIds(firstLevelIds);
    toast.success('Collapsed all nodes');
  }, [orgData.assigned]);

  const isAllExpanded = useMemo(() => {
    let totalNodes = 0;
    const countNodes = (nodes: OrgChartNode[]) => {
      nodes.forEach((node) => {
        totalNodes++;
        if (node.children) {
          countNodes(node.children);
        }
      });
    };
    countNodes(orgData.assigned);
    return expandedIds.size === totalNodes;
  }, [expandedIds, orgData.assigned]);

  // Employee click handler
  const handleEmployeeClick = (node: OrgChartNode) => {
    console.log('👤 [ModernOrgChartPage] Employee clicked:', node.name);
    
    // Find manager name
    let managerName: string | undefined;
    const findManager = (nodes: OrgChartNode[], targetId: string, parentName?: string): string | undefined => {
      for (const n of nodes) {
        if (n.children) {
          for (const child of n.children) {
            if (child.id === targetId) {
              return n.name;
            }
          }
          const found = findManager(n.children, targetId, n.name);
          if (found) return found;
        }
      }
      return undefined;
    };
    managerName = findManager(orgData.assigned, node.id);
    
    // Count team size
    const countTeam = (n: OrgChartNode): number => {
      if (!n.children || n.children.length === 0) return 0;
      return n.children.reduce((acc, child) => acc + 1 + countTeam(child), 0);
    };
    
    const employeeDetails: EmployeeDetails = {
      id: node.id,
      name: node.name,
      title: node.title,
      department: node.department,
      email: `${node.name.toLowerCase().replace(/\s/g, '.')}@company.com`, // Mock
      phone: '+1 (555) 123-4567', // Mock
      location: 'San Francisco, CA', // Mock
      avatar_url: node.avatar_url,
      joinDate: 'January 2020', // Mock
      teamSize: countTeam(node),
      manager: managerName,
    };
    
    setSelectedEmployee(employeeDetails);
    setIsDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading organization chart...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className="h-screen flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #f7f8fa, #e9ecf1)',
        }}
      >
        {/* Top Toolbar */}
        <TopToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddEmployee={handleAddEmployee}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          isAllExpanded={isAllExpanded}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Org Chart Canvas (75%) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
            style={{ flex: '0 0 75%' }}
          >
            <ModernOrgChartCanvas
              data={orgData.assigned}
              onEmployeeClick={handleEmployeeClick}
              onReassign={handleReassign}
              searchTerm={searchTerm}
              expandedIds={expandedIds}
              activeNodeId={activeNode?.id || null}
            />
          </motion.div>

          {/* Right: Unassigned Panel (25%) */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full"
            style={{ flex: '0 0 25%', maxWidth: '400px' }}
          >
            <ModernUnassignedPanel
              employees={orgData.unassigned.map(emp => ({
                id: emp.id,
                name: emp.name,
                title: emp.title,
                department: emp.department,
                avatar_url: emp.avatar_url,
              }))}
              onEmployeeClick={(emp) => {
                const node = orgData.unassigned.find(n => n.id === emp.id);
                if (node) handleEmployeeClick(node);
              }}
              activeNodeId={activeNode?.id || null}
            />
          </motion.div>
        </div>

        {/* Employee Info Drawer */}
        <EmployeeDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          employee={selectedEmployee}
          onEdit={() => toast('Edit feature coming soon!', { icon: '✏️' })}
        />
      </div>

      {/* Drag Overlay - floating card being dragged */}
      <DragOverlay dropAnimation={null}>
        {activeNode && (
          <div className="rotate-3 scale-110">
            <ModernEmployeeCard
              data={{
                id: activeNode.id,
                name: activeNode.name,
                title: activeNode.title,
                department: activeNode.department,
                avatar_url: activeNode.avatar_url,
                isActive: true,
              }}
              isDragging={false}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default ModernOrgChartPage;

