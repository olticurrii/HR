import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { User, Users, ChevronDown, ChevronRight, GripVertical, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { OrgChartNode } from '../../services/orgchartService';
import toast from 'react-hot-toast';
import { OrgEdges, useOrgEdgesUpdater } from './OrgEdges';

interface DraggableOrgChartProps {
  data: OrgChartNode[];
  unassignedEmployees?: OrgChartNode[];
  onReassign: (userId: number, newManagerId?: number | null) => Promise<void>;
  onUserClick?: (node: OrgChartNode) => void;
  initialZoom?: number;
  initialPan?: { x: number; y: number };
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (pan: { x: number; y: number }) => void;
}

interface EmployeeCardProps {
  node: OrgChartNode;
  isDragging?: boolean;
  isOver?: boolean;
  onExpand?: () => void;
  isExpanded?: boolean;
  onClick?: () => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  node,
  isDragging = false,
  isOver = false,
  onExpand,
  isExpanded,
  onClick,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const initials = node.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`
        employee-card relative w-[220px] rounded-2xl shadow-lg bg-white
        transition-all duration-300 ease-in-out
        ${isDragging ? 'opacity-40 scale-95' : 'hover:shadow-2xl hover:scale-105'}
        ${isOver ? 'ring-4 ring-blue-400 border-2 border-blue-500' : 'border border-gray-200'}
      `}
      style={{
        boxShadow: isOver 
          ? '0 10px 40px rgba(59, 130, 246, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 left-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-500 transition-colors z-10 bg-white rounded p-1 shadow-sm border border-gray-200">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Expand/Collapse Button */}
      {hasChildren && onExpand && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          className="absolute bottom-2 left-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full shadow-sm border border-gray-200"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Presence dot */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full border border-white"></div>

      {/* Team size badge */}
      {hasChildren && (
        <div className="absolute bottom-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full flex items-center">
          <Users className="w-3 h-3 mr-1" />
          {node.children.length}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col items-center justify-center p-5 pt-6 pb-8">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-base font-bold mb-3 shadow-lg ring-2 ring-white">
          {initials}
        </div>

        {/* Name */}
        <div className="text-sm font-bold text-gray-900 text-center leading-tight mb-1 px-2">
          {node.name}
        </div>

        {/* Title */}
        <div className="text-xs text-gray-600 text-center leading-tight px-2 font-medium">
          {node.title}
        </div>

        {/* Department */}
        {node.department && (
          <div className="text-[10px] text-gray-500 mt-2 px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full border border-gray-200">
            {node.department}
          </div>
        )}
      </div>

      {/* Drop indicator */}
      {isOver && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 bg-opacity-90 rounded-2xl flex items-center justify-center pointer-events-none backdrop-blur-sm">
          <div className="text-xs text-blue-700 font-bold bg-white px-4 py-2 rounded-full shadow-lg border-2 border-blue-400">
            Drop here to reassign
          </div>
        </div>
      )}
    </div>
  );
};

interface DraggableEmployeeProps {
  node: OrgChartNode;
  onUserClick?: (node: OrgChartNode) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  activeNodeId?: string | null;
  setCardRef?: (el: HTMLElement | null) => void;
  createNodeRefCallback?: (id: string) => (el: HTMLElement | null) => void;
}

const UnassignedEmployeeCard: React.FC<{ employee: OrgChartNode }> = ({ employee }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `unassigned-${employee.id}`,
    data: { node: employee },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg border-2 border-dashed border-yellow-400 p-3 cursor-grab active:cursor-grabbing
        hover:border-yellow-600 hover:shadow-md transition-all duration-200
        ${isDragging ? 'opacity-40' : ''}
      `}
    >
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-900 truncate">
            {employee.name}
          </div>
          <div className="text-[10px] text-gray-600 truncate">
            {employee.title}
          </div>
        </div>
      </div>
    </div>
  );
};

interface UnassignedPanelProps {
  unassignedEmployees: OrgChartNode[];
}

const UnassignedPanel: React.FC<UnassignedPanelProps> = ({ unassignedEmployees }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'unassigned-drop-zone',
    data: { isUnassignedZone: true },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        w-64 bg-yellow-50 border-l-2 border-yellow-200 overflow-y-auto
        transition-all duration-200
        ${isOver ? 'bg-yellow-100 border-yellow-400 shadow-inner' : ''}
      `}
    >
      <div className={`
        p-4 border-b border-yellow-200 bg-yellow-100 sticky top-0 z-10
        transition-all duration-200
        ${isOver ? 'bg-yellow-200' : ''}
      `}>
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <Users className="w-4 h-4 mr-2 text-yellow-600" />
          Unassigned ({unassignedEmployees.length})
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          {isOver ? '✨ Drop to unassign' : 'Drag to assign to a manager'}
        </p>
      </div>
      
      {/* Drop zone hint when empty and dragging */}
      {unassignedEmployees.length === 0 && (
        <div className={`
          p-8 text-center
          ${isOver ? 'bg-yellow-100' : ''}
        `}>
          <Users className="w-12 h-12 mx-auto mb-2 text-yellow-300" />
          <p className="text-xs text-gray-500">
            {isOver ? 'Drop here to unassign' : 'No unassigned employees'}
          </p>
        </div>
      )}
      
      {/* Unassigned employee cards */}
      <div className={`
        p-3 space-y-2 min-h-[200px]
        ${isOver && unassignedEmployees.length > 0 ? 'bg-yellow-100' : ''}
      `}>
        {unassignedEmployees.map((employee) => (
          <UnassignedEmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};

const DraggableEmployee: React.FC<DraggableEmployeeProps> = ({
  node,
  onUserClick,
  expandedIds,
  onToggleExpand,
  activeNodeId,
  setCardRef,
  createNodeRefCallback,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: node.id,
    data: { node },
  });

  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: `drop-${node.id}`,
    data: { node },
  });

  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isBeingDragged = activeNodeId === node.id;

  // Completely remove the node and its subtree from the DOM while being dragged
  // This prevents stale lines/connectors from showing
  if (isBeingDragged) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <div
        ref={(el) => {
          setNodeRef(el);
          setDropRef(el);
          // Also register this element for OrgEdges position tracking
          if (setCardRef) {
            setCardRef(el);
          }
        }}
        {...attributes}
        {...listeners}
        className="mb-4"
      >
        <EmployeeCard
          node={node}
          isDragging={isDragging}
          isOver={isOver}
          onExpand={hasChildren ? () => onToggleExpand(node.id) : undefined}
          isExpanded={isExpanded}
          onClick={() => onUserClick?.(node)}
        />
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative mt-4">
          {/* Filter out the dragged child to prevent stale lines */}
          {(() => {
            const visibleChildren = node.children.filter(child => child.id !== activeNodeId);
            if (visibleChildren.length === 0) return null;
            
            return (
              <div className="flex justify-center gap-4 mt-6">
                {visibleChildren.map((child) => (
                  <DraggableEmployee
                    key={child.id}
                    node={child}
                    onUserClick={onUserClick}
                    expandedIds={expandedIds}
                    onToggleExpand={onToggleExpand}
                    activeNodeId={activeNodeId}
                    setCardRef={createNodeRefCallback ? createNodeRefCallback(child.id) : undefined}
                    createNodeRefCallback={createNodeRefCallback}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

const DraggableOrgChart: React.FC<DraggableOrgChartProps> = ({
  data,
  unassignedEmployees = [],
  onReassign,
  onUserClick,
  initialZoom = 0.8,
  initialPan = { x: 0, y: 0 },
  onZoomChange,
  onPanChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeNode, setActiveNode] = useState<OrgChartNode | null>(null);
  const draggedNodeRef = useRef<OrgChartNode | null>(null); // Persist dragged node data even when removed from DOM
  const [zoom, setZoom] = useState(initialZoom); // Use initial zoom from parent
  const [pan, setPan] = useState(initialPan); // Use initial pan from parent
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Ref map for OrgEdges to track node positions
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const { updateTrigger, triggerUpdate } = useOrgEdgesUpdater();
  
  const setNodeRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (!el) {
      nodeRefs.current.delete(id);
    } else {
      nodeRefs.current.set(id, el);
    }
  }, []);
  
  const getNodeRef = useCallback((id: string) => {
    return nodeRefs.current.get(id) ?? null;
  }, []);
  
  // Create a ref callback factory for child nodes
  const createNodeRefCallback = useCallback((id: string) => {
    return (el: HTMLElement | null) => {
      if (el) {
        nodeRefs.current.set(id, el);
      } else {
        nodeRefs.current.delete(id);
      }
    };
  }, []);
  
  // Flatten tree structure into list of employees with managerId
  const flattenEmployees = useCallback((nodes: OrgChartNode[], parentId: string | null = null): any[] => {
    let result: any[] = [];
    nodes.forEach((node) => {
      result.push({
        id: node.id,
        name: node.name,
        title: node.title,
        managerId: parentId,
      });
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenEmployees(node.children, node.id));
      }
    });
    return result;
  }, []);
  
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Auto-expand ALL levels so user can see everyone
    const expanded = new Set<string>();
    const expandAll = (nodes: OrgChartNode[]) => {
      nodes.forEach((node) => {
        expanded.add(node.id);
        if (node.children && node.children.length > 0) {
          expandAll(node.children);
        }
      });
    };
    expandAll(data);
    return expanded;
  });

  // Update expanded IDs when new data comes in (after drag-drop refresh)
  useEffect(() => {
    const newExpanded = new Set(expandedIds); // Keep existing expanded state
    const expandAll = (nodes: OrgChartNode[]) => {
      nodes.forEach((node) => {
        newExpanded.add(node.id); // Add any new nodes
        if (node.children && node.children.length > 0) {
          expandAll(node.children);
        }
      });
    };
    expandAll(data);
    setExpandedIds(newExpanded);
  }, [data]); // Re-run when data changes (after refresh)

  // Apply initial zoom from parent on first load
  useEffect(() => {
    if (isFirstLoad && data.length > 0) {
      setZoom(initialZoom);
      onZoomChange?.(initialZoom);
      setIsFirstLoad(false);
    }
  }, [isFirstLoad, initialZoom, data.length, onZoomChange]);

  // Update zoom when parent changes it (for external zoom controls)
  useEffect(() => {
    setZoom(initialZoom);
  }, [initialZoom]);

  // Handle mouse wheel zoom (direct scroll/touchpad - NO Ctrl needed)
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Get mouse position relative to container
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate point in content space before zoom
      const contentX = (mouseX - pan.x) / zoom;
      const contentY = (mouseY - pan.y) / zoom;
      
      // Calculate new zoom
      const delta = e.deltaY * -0.001;
      const newZoom = Math.min(Math.max(0.2, zoom + delta), 2);
      
      // Calculate new pan to keep mouse point stable
      const newPan = {
        x: mouseX - contentX * newZoom,
        y: mouseY - contentY * newZoom
      };
      
      setZoom(newZoom);
      setPan(newPan);
      onZoomChange?.(newZoom);
      onPanChange?.(newPan);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom, pan, onZoomChange, onPanChange]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Don't pan if clicking on:
    // - Employee cards or their children
    // - Buttons (zoom controls, expand/collapse)
    // - Any draggable element
    if (
      target.closest('.employee-card') ||
      target.closest('button') ||
      target.closest('[draggable="true"]') ||
      target.hasAttribute('draggable')
    ) {
      return;
    }
    
    e.preventDefault(); // Prevent text selection
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault(); // Prevent text selection while panning
    const newPan = {
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    };
    setPan(newPan);
    onPanChange?.(newPan); // Notify parent
  }, [isPanning, panStart, onPanChange]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Zoom controls - zoom toward center
  const handleZoomIn = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const contentX = (centerX - pan.x) / zoom;
    const contentY = (centerY - pan.y) / zoom;
    
    const newZoom = Math.min(zoom + 0.1, 2);
    
    const newPan = {
      x: centerX - contentX * newZoom,
      y: centerY - contentY * newZoom
    };
    
    setZoom(newZoom);
    setPan(newPan);
    onZoomChange?.(newZoom);
    onPanChange?.(newPan);
  }, [zoom, pan, onZoomChange, onPanChange]);

  const handleZoomOut = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const contentX = (centerX - pan.x) / zoom;
    const contentY = (centerY - pan.y) / zoom;
    
    const newZoom = Math.max(zoom - 0.1, 0.2);
    
    const newPan = {
      x: centerX - contentX * newZoom,
      y: centerY - contentY * newZoom
    };
    
    setZoom(newZoom);
    setPan(newPan);
    onZoomChange?.(newZoom);
    onPanChange?.(newPan);
  }, [zoom, pan, onZoomChange, onPanChange]);

  const handleResetView = useCallback(() => {
    const resetZoom = 0.6; // Match initial zoom to see everyone
    const resetPan = { x: 0, y: 0 };
    setZoom(resetZoom);
    setPan(resetPan);
    onZoomChange?.(resetZoom);
    onPanChange?.(resetPan);
  }, [onZoomChange, onPanChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const node = event.active.data.current?.node as OrgChartNode;
    console.log('🎯 Drag started, raw data:', event.active.data.current);
    console.log('🎯 Drag started, node:', node);
    setActiveNode(node);
    draggedNodeRef.current = node; // Store in ref so it persists even if DOM element is removed
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      
      // Get source node from active data, or fallback to ref if DOM was removed
      let sourceNode = active.data.current?.node as OrgChartNode;
      if (!sourceNode) {
        console.log('⚠️ Source node not in active.data, trying ref...');
        sourceNode = draggedNodeRef.current as OrgChartNode;
      }
      
      setActiveNode(null);
      draggedNodeRef.current = null; // Clear the ref

      if (!over || active.id === over.id) {
        console.log('❌ Invalid drop');
        return;
      }
      
      if (!sourceNode) {
        console.log('❌ Missing source node in both active.data and ref');
        return;
      }
      
      console.log('✅ Source node found:', sourceNode.name);

      // ✅ CHECK IF DROPPING ON UNASSIGNED ZONE
      const isUnassignedZone = over.data.current?.isUnassignedZone === true;
      
      if (isUnassignedZone) {
        console.log('✅ Unassigning:', sourceNode.name);
        try {
          // Set manager to null to unassign
          await onReassign(parseInt(sourceNode.id), null);
          // Toast handled by parent component
        } catch (error: any) {
          console.error('❌ Unassign failed:', error);
          // Error toast handled by parent component
        }
        return;
      }

      // ✅ DROPPING ON A MANAGER CARD
      const targetId = over.id.toString().replace('drop-', '');
      if (active.id === targetId) {
        console.log('❌ Cannot drop on self');
        toast.error('Cannot assign employee to themselves');
        return;
      }

      const targetNode = over.data.current?.node as OrgChartNode;

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

      if (isDescendant(sourceNode, targetNode.id)) {
        console.log('❌ Would create cycle');
        toast.error('Cannot assign a manager to their own subordinate');
        return;
      }

      console.log('✅ Reassigning:', sourceNode.name, '→', targetNode.name);

      try {
        await onReassign(parseInt(sourceNode.id), parseInt(targetNode.id));
        // Trigger edge update after reassignment settles
        triggerUpdate();
        // Toast handled by parent component
      } catch (error: any) {
        console.error('❌ Reassign failed:', error);
        // Error toast handled by parent component
      }
    },
    [onReassign, triggerUpdate]
  );

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No organization data available</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative w-full h-full bg-gray-50 flex">
        {/* Main Chart Area */}
        <div className="flex-1 relative">
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="text-center text-xs font-medium text-gray-600 py-1">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={handleResetView}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Pan Instructions */}
        {!activeNode && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-black bg-opacity-70 text-white text-xs px-3 py-1.5 rounded-full">
            Click & drag background to pan • Scroll/Touchpad to zoom
          </div>
        )}

        {/* Pannable/Zoomable Container */}
        <div
          ref={containerRef}
          className={`w-full h-full overflow-hidden select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            ref={contentRef}
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="inline-block min-w-max relative">
              {data.map((rootNode) => (
                <DraggableEmployee
                  key={rootNode.id}
                  node={rootNode}
                  onUserClick={onUserClick}
                  expandedIds={expandedIds}
                  onToggleExpand={handleToggleExpand}
                  activeNodeId={activeNode?.id || null}
                  setCardRef={createNodeRefCallback(rootNode.id)}
                  createNodeRefCallback={createNodeRefCallback}
                />
              ))}
            </div>
            
            {/* Render OrgEdges overlay for smooth connector lines - outside inline-block */}
            <OrgEdges
              employees={flattenEmployees(data)}
              getNodeRef={getNodeRef}
              containerRef={contentRef}
              scale={zoom}
              key={updateTrigger}
            />
          </div>
        </div>
      </div>

        {/* Unassigned Employees Sidebar - Always visible, acts as drop zone */}
        <UnassignedPanel unassignedEmployees={unassignedEmployees} />
      </div>

      {/* Drag Overlay - shows the card being dragged */}
      <DragOverlay dropAnimation={null}>
        {activeNode && (
          <div className="rotate-3 scale-110">
            <EmployeeCard node={activeNode} isDragging={false} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default DraggableOrgChart;

