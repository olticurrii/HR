import React, { useState, useCallback, useRef } from 'react';
import { Tree } from 'react-d3-tree';
import { User, Building2, Users } from 'lucide-react';
import { OrgChartNode } from '../../services/orgchartService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface OrgTreeProps {
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
  onDragOver: (e: React.DragEvent) => void;
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
      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
        {initial}
      </div>
    );
  };

  return (
    <foreignObject
      width="200"
      height="120"
      x="-100"
      y="-60"
      className="cursor-pointer"
    >
      <div
        className={`
          w-48 h-24 bg-white rounded-lg shadow-md border-2 border-gray-200 p-3
          ${isDragOver ? 'border-blue-400 ring-2 ring-blue-300' : ''}
          ${isDragging ? 'opacity-60 scale-95' : ''}
          ${canDrag ? 'cursor-move hover:shadow-lg' : 'cursor-default'}
        `}
        draggable={canDrag}
        onDragStart={(e) => onDragStart(e, nodeDatum)}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, nodeDatum)}
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
        
        {/* Drag indicator for admins */}
        {canDrag && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
        )}
        
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
  );
};

const OrgTree: React.FC<OrgTreeProps> = ({ data, onReassign, onDepartmentDrop }) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<OrgChartNode | null>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  const canDrag = user?.is_admin || false;

  const handleDragStart = useCallback((e: React.DragEvent, nodeDatum: OrgChartNode) => {
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    
    setIsDragging(true);
    setDraggedNode(nodeDatum);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'user',
      id: nodeDatum.id,
      name: nodeDatum.name
    }));
  }, [canDrag]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setIsDragging(false);
    setDraggedNode(null);
    setDragOverNodeId(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetNode: OrgChartNode) => {
    e.preventDefault();
    
    if (!draggedNode || !canDrag) return;
    
    // Don't allow dropping on self
    if (draggedNode.id === targetNode.id) {
      setDragOverNodeId(null);
      return;
    }
    
    try {
      await onReassign(parseInt(draggedNode.id), parseInt(targetNode.id));
      toast.success(`Moved ${draggedNode.name} under ${targetNode.name}`);
    } catch (error) {
      console.error('Error reassigning user:', error);
      toast.error('Failed to move user');
    } finally {
      setDragOverNodeId(null);
    }
  }, [draggedNode, canDrag, onReassign]);

  const handleNodeClick = useCallback((nodeDatum: OrgChartNode) => {
    console.log('Node clicked:', nodeDatum);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if we're leaving the entire tree container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverNodeId(null);
    }
  }, []);

  // Custom node renderer
  const renderCustomNodeElement = useCallback((rd3tProps: any) => {
    const { nodeDatum, toggleNode } = rd3tProps;
    
    return (
      <CustomNode
        nodeDatum={nodeDatum}
        toggleNode={toggleNode}
        onNodeClick={handleNodeClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        isDragging={isDragging}
        dragOverNodeId={dragOverNodeId}
        canDrag={canDrag}
      />
    );
  }, [handleNodeClick, handleDragStart, handleDragEnd, handleDragOver, handleDrop, isDragging, dragOverNodeId, canDrag]);

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
    <div 
      ref={treeContainerRef}
      className="w-full h-full bg-gray-50 rounded-lg"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <Tree
        data={data}
        orientation="vertical"
        pathFunc="step"
        translate={{ x: 400, y: 50 }}
        scaleExtent={{ min: 0.3, max: 1.5 }}
        nodeSize={{ x: 200, y: 120 }}
        separation={{ siblings: 1.2, nonSiblings: 1.5 }}
        renderCustomNodeElement={renderCustomNodeElement}
        enableLegacyTransitions={false}
        transitionDuration={0}
        zoom={1}
        zoomable={true}
        draggable={false} // We handle our own drag and drop
      />
      
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

export default OrgTree;
