import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { EmployeeData } from './ModernEmployeeCard';
import { OrgChartNode } from '../../services/orgchartService';

interface ModernOrgChartCanvasProps {
  data: OrgChartNode[];
  onEmployeeClick?: (employee: OrgChartNode) => void;
  onReassign?: (userId: number, newManagerId: number | null) => Promise<void>;
  searchTerm?: string;
  expandedIds?: Set<string>;
  activeNodeId?: string | null;
}

// Custom node component for React Flow
const EmployeeNode: React.FC<NodeProps<EmployeeData>> = ({ data }) => {
  const { attributes, listeners, setNodeRef: setDragRef } = useDraggable({
    id: `node-${data.id}`,
    data: { node: data },
  });

  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: `drop-${data.id}`,
    data: { node: data },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      ref={(el) => {
        setDragRef(el);
        setDropRef(el);
      }}
      {...attributes}
      {...listeners}
      className={`
        relative w-[220px] rounded-2xl cursor-grab active:cursor-grabbing
        transition-all duration-250
        ${isOver ? 'ring-4 ring-blue-400' : ''}
      `}
      style={{
        background: isOver ? 'rgba(91, 142, 241, 0.1)' : 'rgba(255, 255, 255, 0.95)',
        border: isOver ? '2px solid #5B8EF1' : '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: isOver
          ? '0 6px 20px rgba(91, 142, 241, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className={`
              flex-shrink-0 w-12 h-12 rounded-full
              flex items-center justify-center text-white font-medium text-sm
              bg-gradient-to-br ${getAvatarColor(data.name)}
              shadow-md
            `}
          >
            {data.avatar_url ? (
              <img
                src={data.avatar_url}
                alt={data.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(data.name)
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm leading-tight truncate">
              {data.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {data.title}
            </p>
            {data.department && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {data.department}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Team Size Badge */}
      {data.teamSize && data.teamSize > 0 && (
        <div className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md flex items-center gap-1">
          👥 {data.teamSize}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  employee: EmployeeNode,
};

// Helper to count team size
const countTeamSize = (node: OrgChartNode): number => {
  if (!node.children || node.children.length === 0) return 0;
  return node.children.reduce((acc, child) => acc + 1 + countTeamSize(child), 0);
};

// Helper to build hierarchical layout
const buildHierarchicalLayout = (
  nodes: OrgChartNode[],
  parentX: number = 0,
  parentY: number = 0,
  level: number = 0,
  expandedIds?: Set<string>,
  activeNodeId?: string | null
): { nodes: Node[]; edges: Edge[] } => {
  const result: { nodes: Node[]; edges: Edge[] } = { nodes: [], edges: [] };
  
  const levelSpacing = 200;
  const nodeSpacing = 280;
  
  const calculateWidth = (nodeList: OrgChartNode[]): number => {
    return nodeList.reduce((sum, node) => {
      const isExpanded = expandedIds?.has(node.id) !== false;
      if (node.children && node.children.length > 0 && isExpanded) {
        return sum + calculateWidth(node.children);
      }
      return sum + nodeSpacing;
    }, 0);
  };
  
  let currentX = parentX;
  
  nodes.forEach((node) => {
    const isExpanded = expandedIds?.has(node.id) !== false;
    const teamSize = countTeamSize(node);
    const isBeingDragged = activeNodeId === node.id;
    
    let childrenWidth = 0;
    if (node.children && node.children.length > 0 && isExpanded) {
      childrenWidth = calculateWidth(node.children);
    } else {
      childrenWidth = nodeSpacing;
    }
    
    const nodeX = currentX + childrenWidth / 2 - nodeSpacing / 2;
    const nodeY = parentY + (level * levelSpacing);
    
    if (!isBeingDragged) {
      const employeeData: EmployeeData = {
        id: node.id,
        name: node.name,
        title: node.title,
        department: node.department,
        avatar_url: node.avatar_url,
        isActive: true,
        teamSize: teamSize > 0 ? teamSize : undefined,
      };
      
      result.nodes.push({
        id: node.id,
        type: 'employee',
        position: { x: nodeX, y: nodeY },
        data: employeeData,
        draggable: false,
      });
    }
    
    if (node.children && node.children.length > 0 && isExpanded) {
      const visibleChildren = node.children.filter(child => child.id !== activeNodeId);
      
      if (visibleChildren.length > 0) {
        const childResult = buildHierarchicalLayout(
          visibleChildren,
          currentX,
          nodeY + levelSpacing,
          level + 1,
          expandedIds,
          activeNodeId
        );
        
        result.nodes.push(...childResult.nodes);
        result.edges.push(...childResult.edges);
        
        visibleChildren.forEach((child) => {
          result.edges.push({
            id: `${node.id}-${child.id}`,
            source: node.id,
            target: child.id,
            sourceHandle: null, // Explicitly set to null to avoid "undefined" warning
            targetHandle: null,
            type: 'smoothstep',
            animated: false,
            style: {
              stroke: '#5B8EF1',
              strokeWidth: 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#5B8EF1',
              width: 20,
              height: 20,
            },
          });
        });
      }
    }
    
    currentX += childrenWidth;
  });
  
  return result;
};

const OrgChartCanvasContent: React.FC<ModernOrgChartCanvasProps> = ({
  data,
  onEmployeeClick,
  searchTerm = '',
  expandedIds,
  activeNodeId,
}) => {
  const { fitView } = useReactFlow();
  
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return buildHierarchicalLayout(data, 0, 0, 0, expandedIds, activeNodeId);
  }, [data, expandedIds, activeNodeId]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildHierarchicalLayout(
      data, 
      0, 
      0, 
      0, 
      expandedIds,
      activeNodeId
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [data, expandedIds, activeNodeId, setNodes, setEdges]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView]);
  
  const visibleNodes = useMemo(() => {
    if (!searchTerm) return nodes;
    
    const lowerSearch = searchTerm.toLowerCase();
    return nodes.map((node) => {
      const data = node.data as EmployeeData;
      const matches =
        data.name.toLowerCase().includes(lowerSearch) ||
        data.title.toLowerCase().includes(lowerSearch) ||
        data.department?.toLowerCase().includes(lowerSearch);
      
      return {
        ...node,
        style: {
          ...node.style,
          opacity: matches ? 1 : 0.2,
        },
      };
    });
  }, [nodes, searchTerm]);
  
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const findNodeById = (nodes: OrgChartNode[], id: string): OrgChartNode | null => {
        for (const n of nodes) {
          if (n.id === id) return n;
          if (n.children) {
            const found = findNodeById(n.children, id);
            if (found) return found;
          }
        }
        return null;
      };
      
      const originalNode = findNodeById(data, node.id);
      if (originalNode && onEmployeeClick) {
        onEmployeeClick(originalNode);
      }
    },
    [data, onEmployeeClick]
  );
  
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={visibleNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#5B8EF1', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <Controls
          showZoom={false}
          showFitView={false}
          showInteractive={false}
          className="hidden"
        />
      </ReactFlow>
    </div>
  );
};

const ModernOrgChartCanvas: React.FC<ModernOrgChartCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <OrgChartCanvasContent {...props} />
    </ReactFlowProvider>
  );
};

export default ModernOrgChartCanvas;
