import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Tree } from 'react-d3-tree';
import { User, Users, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { OrgChartNode } from '../../services/orgchartService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SimpleOrgTreeProps {
  data: OrgChartNode[];
  onReassign: (userId: number, newManagerId?: number | null, newDepartmentId?: number | null) => Promise<void>;
  onDepartmentDrop?: (userId: number, departmentId: number) => Promise<void>;
  onUserClick?: (user: OrgChartNode) => void;
  zoomLevel?: number;
}

interface CustomNodeProps {
  nodeDatum: OrgChartNode;
  toggleNode: () => void;
  onNodeClick: (nodeDatum: OrgChartNode) => void;
  onDragStart: (e: React.DragEvent, nodeDatum: OrgChartNode) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, nodeDatum: OrgChartNode) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, nodeDatum: OrgChartNode) => void;
  isDragging: boolean;
  dragOverNodeId: string | null;
  canDrag: boolean;
}

const CustomNode: React.FC<CustomNodeProps> = ({
  nodeDatum,
  toggleNode,
  onNodeClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging,
  dragOverNodeId,
  canDrag
}) => {
  const isDragOver = dragOverNodeId === nodeDatum.id;
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
  const teamSize = nodeDatum.children ? nodeDatum.children.length : 0;

    const getAvatar = (name: string, avatarUrl?: string) => {
      if (avatarUrl) {
        return <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover" />;
      }
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      return (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
          {initials}
        </div>
      );
    };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    toggleNode();
  };

  return (
    <g>
      <foreignObject 
        width="180" 
        height="100" 
        x="-90" 
        y="-50"
        style={{ overflow: 'visible' }}
      >
        <div
          className={`
            relative w-[180px] h-[100px] rounded-lg border border-gray-200 shadow-sm bg-white
            transition-all duration-200 hover:shadow-md
            ${isDragOver ? 'border-blue-400 ring-2 ring-blue-300' : ''}
            ${isDragging ? 'opacity-60 scale-95' : ''}
          `}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDragOver(e, nodeDatum);
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            onDragLeave(e);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDrop(e, nodeDatum);
          }}
        >
          {/* Drag Handle - MUST BE FIRST for proper z-index */}
          {canDrag && (
            <div
              className="absolute top-1 left-1 cursor-grab active:cursor-grabbing text-gray-500 hover:text-primary transition-colors z-50 bg-white rounded p-1 shadow-md border-2 border-gray-300 select-none touch-none"
              draggable={true}
              unselectable="on"
              onMouseDown={(e) => {
                // CRITICAL: Mark this as a drag handle interaction
                (e.target as HTMLElement).dataset.dragHandle = 'true';
                e.stopPropagation();
              }}
              onDragStart={(e) => {
                e.stopPropagation();
                console.log('✅ Drag handle started:', nodeDatum.name);
                e.dataTransfer.effectAllowed = 'move';
                onDragStart(e, nodeDatum);
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                console.log('✅ Drag handle ended');
                onDragEnd(e);
              }}
              title="✋ Drag to reassign employee"
            >
              <GripVertical className="w-4 h-4 pointer-events-none" />
            </div>
          )}
          
          {/* Chevron expand/collapse button */}
          {hasChildren && (
            <button
              onClick={handleToggle}
              className="absolute bottom-1 left-1 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full shadow-sm"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          
          {/* Presence dot */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
          
          {/* Team size badge */}
          {teamSize > 0 && (
            <div className="absolute bottom-2 right-2 bg-blue-100 text-primary text-xs px-2 py-0.5 rounded-full flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {teamSize}
            </div>
          )}
          
          {/* Main content - clickable */}
          <div 
            className="flex flex-col items-center justify-center h-full px-3 py-2 cursor-pointer"
            onClick={() => onNodeClick(nodeDatum)}
          >
            <div className="mb-2">
              {getAvatar(nodeDatum.name, nodeDatum.avatar_url)}
            </div>
            <div className="text-xs font-medium text-gray-900 truncate w-full text-center px-1 leading-tight">
              {nodeDatum.name}
            </div>
            <div className="text-[11px] text-gray-500 truncate w-full text-center px-1 mt-0.5 leading-tight">
              {nodeDatum.title}
            </div>
          </div>
          
          {/* Drop target indicator */}
          {isDragOver && (
            <div className="absolute inset-0 bg-primary-50 bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="text-xs text-primary font-medium bg-white px-2 py-1 rounded shadow">
                Make manager
              </div>
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
};

const SimpleOrgTree: React.FC<SimpleOrgTreeProps> = ({ data, onReassign, onDepartmentDrop, onUserClick, zoomLevel = 1 }) => {
  const { user } = useAuth();
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<OrgChartNode | null>(null);
  const [internalZoom, setInternalZoom] = useState(0.7);
  
  // Custom panning state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  
  // Drag preview state
  const [dragPreview, setDragPreview] = useState<{ node: OrgChartNode; x: number; y: number } | null>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);

  const canDrag = user?.is_admin || false;

  useEffect(() => {
    if (treeContainerRef.current) {
      const { width, height } = treeContainerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      setTranslate({ x: width / 2, y: 50 });
    }
  }, []);

  // Handle mouse wheel zoom
  useEffect(() => {
    const container = treeContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent default scroll behavior to enable zoom
      e.preventDefault();
      
      // Calculate zoom delta based on scroll direction
      const delta = e.deltaY * -0.001;
      setInternalZoom(prev => Math.min(Math.max(0.3, prev + delta), 3));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleNodeClick = useCallback((nodeDatum: OrgChartNode) => {
    if (onUserClick) {
      onUserClick(nodeDatum);
    }
  }, [onUserClick]);

  const handleDragStart = useCallback((e: React.DragEvent, node: OrgChartNode) => {
    console.log('✅ Drag start:', node.name);
    
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    
    setIsDragging(true);
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'user',
      id: node.id,
      name: node.name
    }));
    
    // Create a custom drag image (empty/transparent)
    const dragImage = document.createElement('div');
    dragImage.style.opacity = '0';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
    
    // Show preview at cursor position
    setDragPreview({ node, x: e.clientX, y: e.clientY });
    
    // Track mouse movement
    const handleDrag = (dragEvent: DragEvent) => {
      if (dragEvent.clientX === 0 && dragEvent.clientY === 0) return; // Ignore end event
      setDragPreview(prev => prev ? { ...prev, x: dragEvent.clientX, y: dragEvent.clientY } : null);
    };
    
    document.addEventListener('drag', handleDrag);
    (e.target as HTMLElement).addEventListener('dragend', () => {
      document.removeEventListener('drag', handleDrag);
    }, { once: true });
  }, [canDrag]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    console.log('✅ Drag end');
    setIsDragging(false);
    setDraggedNode(null);
    setDragOverNodeId(null);
    setDragPreview(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetNode: OrgChartNode) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverNodeId(targetNode.id);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if we're leaving the node completely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverNodeId(null);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetNode: OrgChartNode) => {
    e.preventDefault();
    
    if (!canDrag) {
      console.log('Drop cancelled: no permission');
      setDragOverNodeId(null);
      return;
    }
    
    // Get drag data from either draggedNode state or from dataTransfer
    let sourceNode = draggedNode;
    if (!sourceNode) {
      try {
        const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (dragData.type === 'user') {
          sourceNode = {
            id: dragData.id,
            name: dragData.name,
            title: '',
            children: []
          };
        }
      } catch (error) {
        console.error('Failed to parse drag data:', error);
      }
    }
    
    console.log('Drop event:', { sourceNode, targetNode, canDrag });
    
    if (!sourceNode) {
      console.log('Drop cancelled: no source node');
      setDragOverNodeId(null);
      return;
    }
    
    // Don't allow dropping on self
    if (sourceNode.id === targetNode.id) {
      console.log('Drop cancelled: cannot drop on self');
      toast.error('Cannot assign employee to themselves');
      setDragOverNodeId(null);
      return;
    }
    
    try {
      console.log('Attempting to reassign:', { userId: parseInt(sourceNode.id), newManagerId: parseInt(targetNode.id) });
      await onReassign(parseInt(sourceNode.id), parseInt(targetNode.id));
      toast.success(`Moved ${sourceNode.name} under ${targetNode.name}`);
    } catch (error: any) {
      console.error('Error reassigning user:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to move user';
      toast.error(errorMsg);
    } finally {
      setDragOverNodeId(null);
    }
  }, [draggedNode, canDrag, onReassign]);

  const renderCustomNodeElement = useCallback((rd3tProps: any) => (
    <CustomNode
      {...rd3tProps}
      onNodeClick={handleNodeClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      isDragging={isDragging}
      dragOverNodeId={dragOverNodeId}
      canDrag={canDrag}
    />
  ), [handleNodeClick, handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop, isDragging, dragOverNodeId, canDrag]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No organization data available</p>
        </div>
      </div>
    );
  }

  // Custom pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking on background (not on a node or drag handle)
    const target = e.target as HTMLElement;
    if (target.closest('foreignObject') || target.dataset.dragHandle) {
      return; // Don't pan if clicking on a node or drag handle
    }
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const newOffset = {
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    };
    setPanOffset(newOffset);
    setTranslate({
      x: translate.x + newOffset.x,
      y: translate.y + newOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden">
      <div
        ref={treeContainerRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ minHeight: '400px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {dimensions.width > 0 && dimensions.height > 0 && (
          <Tree
            data={data}
            orientation="vertical"
            pathFunc="step"
            translate={translate}
            scaleExtent={{ min: 0.1, max: 2 }}
            nodeSize={{ x: 200, y: 130 }}
            separation={{ siblings: 1.2, nonSiblings: 1.5 }}
            renderCustomNodeElement={renderCustomNodeElement}
            enableLegacyTransitions={false}
            transitionDuration={200}
            zoom={internalZoom}
            zoomable={true}
            draggable={false}
            shouldCollapseNeighborNodes={false}
            onUpdate={(updateData) => {
              setTranslate(updateData.translate);
              if (updateData.zoom !== undefined) {
                setInternalZoom(updateData.zoom);
              }
            }}
          />
        )}
      </div>
      
      {/* Drag overlay instructions */}
      {isDragging && !dragPreview && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Drag to reassign {draggedNode?.name}</span>
          </div>
        </div>
      )}
      
      {/* Floating Drag Preview Card */}
      {dragPreview && (
        <div
          ref={dragPreviewRef}
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${dragPreview.x}px`,
            top: `${dragPreview.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-[180px] h-[100px] rounded-lg border-2 border-primary shadow-2xl bg-white animate-pulse">
            {/* Avatar */}
            <div className="flex flex-col items-center justify-center h-full px-3 py-2">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium mb-1">
                {dragPreview.node.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              
              {/* Name */}
              <div className="text-xs font-medium text-gray-900 text-center leading-tight truncate w-full px-1">
                {dragPreview.node.name}
              </div>
              
              {/* Title */}
              <div className="text-[11px] text-gray-600 text-center leading-tight truncate w-full px-1">
                {dragPreview.node.title}
              </div>
              
              {/* Moving indicator */}
              <div className="mt-1 text-[10px] text-primary font-medium">
                ✋ Moving...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleOrgTree;