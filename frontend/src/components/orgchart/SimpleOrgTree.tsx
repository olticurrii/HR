import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Tree } from 'react-d3-tree';
import { User, Building2, Users } from 'lucide-react';
import { OrgChartNode } from '../../services/orgchartService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SimpleOrgTreeProps {
  data: OrgChartNode[];
  onReassign: (userId: number, newManagerId?: number | null, newDepartmentId?: number | null) => Promise<void>;
  onDepartmentDrop?: (userId: number, departmentId: number) => Promise<void>;
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

  const getAvatar = (name: string, avatarUrl?: string) => {
    if (avatarUrl) {
      return <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full" />;
    }
    const initial = name.charAt(0).toUpperCase();
    return (
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
        {initial}
      </div>
    );
  };

  return (
    <g>
      <foreignObject width="200" height="120" x="-100" y="-60">
        <div
          className={`
            w-48 h-24 bg-white rounded-lg shadow-md border-2 border-gray-200 p-3 cursor-pointer
            transition-all duration-200
            ${isDragOver ? 'border-blue-400 ring-2 ring-blue-300' : ''}
            ${isDragging ? 'opacity-60 scale-95' : ''}
            ${canDrag ? 'cursor-move hover:shadow-lg' : 'cursor-default'}
          `}
          draggable={canDrag}
          onDragStart={(e) => {
            e.stopPropagation(); // Prevent tree drag
            onDragStart(e, nodeDatum);
          }}
          onDragEnd={(e) => {
            e.stopPropagation();
            onDragEnd(e);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent tree drag
            onDragOver(e, nodeDatum);
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            onDragLeave(e);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent tree drag
            onDrop(e, nodeDatum);
          }}
          onClick={() => onNodeClick(nodeDatum)}
        >
          <div className="flex items-center space-x-2 h-full">
            <div className="flex-shrink-0">
              {getAvatar(nodeDatum.name, nodeDatum.avatar_url)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {nodeDatum.name}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {nodeDatum.title}
              </div>
              {nodeDatum.department && (
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <Building2 className="w-3 h-3 mr-1" />
                  <span className="truncate">{nodeDatum.department}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Drop target indicator */}
          {isDragOver && (
            <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg flex items-center justify-center">
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

const SimpleOrgTree: React.FC<SimpleOrgTreeProps> = ({ data, onReassign, onDepartmentDrop }) => {
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
    console.log('Node clicked:', nodeDatum);
  }, []);

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
            scaleExtent={{ min: 0.3, max: 2 }}
            nodeSize={{ x: 250, y: 150 }}
            separation={{ siblings: 1.5, nonSiblings: 2 }}
            renderCustomNodeElement={renderCustomNodeElement}
            enableLegacyTransitions={false}
            transitionDuration={0}
            zoom={1}
            zoomable={true}
            draggable={true} // Enable tree dragging for pan
            onUpdate={(updateData) => setTranslate(updateData.translate)} // Handle pan updates
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