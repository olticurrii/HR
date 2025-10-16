import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Tree } from 'react-d3-tree';
import { User, Building2, Users, ChevronDown, ChevronRight } from 'lucide-react';
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
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
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
      <foreignObject width="160" height="80" x="-80" y="-40">
        <div
          className={`
            relative w-[160px] h-[80px] rounded-lg border border-gray-200 shadow-sm bg-white cursor-pointer
            transition-all duration-200 hover:shadow-md
            ${isDragOver ? 'border-blue-400 ring-2 ring-blue-300' : ''}
            ${isDragging ? 'opacity-60 scale-95' : ''}
            ${canDrag ? 'cursor-move' : 'cursor-default'}
          `}
          draggable={canDrag}
          onDragStart={(e) => {
            e.stopPropagation();
            onDragStart(e, nodeDatum);
          }}
          onDragEnd={(e) => {
            e.stopPropagation();
            onDragEnd(e);
          }}
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
          onClick={() => onNodeClick(nodeDatum)}
        >
          {/* Chevron expand/collapse button */}
          {hasChildren && (
            <button
              onClick={handleToggle}
              className="absolute top-2 left-2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
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
          {teamSize > 0 && (
            <div className="absolute bottom-2 left-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {teamSize}
            </div>
          )}
          
          {/* Main content */}
          <div className="flex flex-col items-center justify-center h-full p-2">
            <div className="mb-1">
              {getAvatar(nodeDatum.name, nodeDatum.avatar_url)}
            </div>
            <div className="text-xs font-semibold text-gray-900 mb-1 truncate w-full text-center">
              {nodeDatum.name}
            </div>
            <div className="text-xs text-gray-500 truncate w-full text-center">
              {nodeDatum.title}
            </div>
          </div>
          
          {/* Drop target indicator */}
          {isDragOver && (
            <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-xl flex items-center justify-center">
              <div className="text-xs text-blue-600 font-medium bg-white px-2 py-1 rounded shadow">
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

  const canDrag = user?.is_admin || false;

  useEffect(() => {
    if (treeContainerRef.current) {
      const { width, height } = treeContainerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      setTranslate({ x: width / 2, y: 50 });
    }
  }, []);

  const handleNodeClick = useCallback((nodeDatum: OrgChartNode) => {
    if (onUserClick) {
      onUserClick(nodeDatum);
    }
  }, [onUserClick]);

  const handleDragStart = useCallback((e: React.DragEvent, node: OrgChartNode) => {
    console.log('Drag start:', { node, canDrag });
    
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
    
    // Add a small delay to ensure drag state is set
    setTimeout(() => {
      console.log('Drag state set:', { isDragging: true, draggedNode: node });
    }, 10);
  }, [canDrag]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setIsDragging(false);
    setDraggedNode(null);
    setDragOverNodeId(null);
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
    
    console.log('Drop event:', { draggedNode, targetNode, canDrag });
    
    if (!draggedNode || !canDrag) {
      console.log('Drop cancelled: no dragged node or no permission');
      setDragOverNodeId(null);
      return;
    }
    
    // Don't allow dropping on self
    if (draggedNode.id === targetNode.id) {
      console.log('Drop cancelled: cannot drop on self');
      setDragOverNodeId(null);
      return;
    }
    
    try {
      console.log('Attempting to reassign:', { userId: parseInt(draggedNode.id), newManagerId: parseInt(targetNode.id) });
      await onReassign(parseInt(draggedNode.id), parseInt(targetNode.id));
      toast.success(`Moved ${draggedNode.name} under ${targetNode.name}`);
    } catch (error) {
      console.error('Error reassigning user:', error);
      toast.error('Failed to move user');
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

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden">
      <div
        ref={treeContainerRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      >
        {dimensions.width > 0 && dimensions.height > 0 && (
          <Tree
            data={data}
            orientation="vertical"
            pathFunc="step"
            translate={translate}
            scaleExtent={{ min: 0.3, max: 3 }}
            nodeSize={{ x: 180, y: 100 }}
            separation={{ siblings: 1.5, nonSiblings: 2 }}
            renderCustomNodeElement={renderCustomNodeElement}
            enableLegacyTransitions={false}
            transitionDuration={200}
            zoom={zoomLevel}
            zoomable={true}
            draggable={true}
            onUpdate={(updateData) => setTranslate(updateData.translate)}
          />
        )}
      </div>
      
      {/* Drag overlay instructions */}
      {isDragging && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Drag to reassign {draggedNode?.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleOrgTree;