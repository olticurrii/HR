# Org Chart Enhancements Implementation Guide

## Overview

This guide provides implementation for 5 new org chart features:
1. **Unassigned Panel** - Bidirectional drag for unassigned employees
2. **Manager Subtree Edit** - Managers can only edit their subtree
3. **Department Colors** - Color-code nodes by department
4. **Compact View** - Toggle between detailed and compact cards
5. **Connecting Lines** - SVG edges that update dynamically

## ✅ Backend Complete

### Feature Flags Added
- `orgchart_show_unassigned_panel` (default: true)
- `orgchart_manager_subtree_edit` (default: true)
- `orgchart_department_colors` (default: true)
- `orgchart_compact_view` (default: false)
- `orgchart_show_connectors` (default: true)

### API Endpoint
- `GET /api/v1/settings/org` - Returns all settings including org chart flags
- `PUT /api/v1/settings/org` - Admin can update flags

## 📋 Frontend Implementation Steps

### Step 1: Update OrgChartPage.tsx

Add settings state and manager subtree logic:

```typescript
import { useOrgChartSettings } from '../../hooks/useOrgChartSettings';
import { getDepartmentColor, getAllDepartmentColors } from '../../utils/departmentColors';

// In OrgChartPage component:
const { settings, loading: settingsLoading } = useOrgChartSettings();
const [compactView, setCompactView] = useState(false);

// Get user's subtree if manager
const getUserSubtree = (userId: number): Set<number> => {
  const subtree = new Set<number>();
  
  const collectDescendants = (users: any[]) => {
    users.forEach(user => {
      subtree.add(parseInt(user.id));
      if (user.children && user.children.length > 0) {
        collectDescendants(user.children);
      }
    });
  };
  
  // Find user's node
  const findUserNode = (users: any[]): any | null => {
    for (const u of users) {
      if (parseInt(u.id) === userId) return u;
      if (u.children) {
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

const canDragNode = (nodeId: number): boolean => {
  if (!settings.orgchart_manager_subtree_edit) return true;
  if (user?.is_admin || user?.role === 'admin') return true;
  if (user?.role !== 'manager') return false;
  
  const subtree = getUserSubtree(user.id);
  return subtree.has(nodeId);
};
```

### Step 2: Add Toolbar Controls

```typescript
{/* Toolbar with feature toggles */}
<div className="flex items-center space-x-4">
  {/* Department Filter - existing */}
  
  {/* Department Colors Legend */}
  {settings.orgchart_department_colors && (
    <div className="relative group">
      <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
        🎨 Departments
      </button>
      <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-3">
          <h4 className="text-sm font-semibold mb-2">Department Colors</h4>
          <div className="space-y-1">
            {getAllDepartmentColors().map(({ name, color }) => (
              <div key={name} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border ${color.border} ${color.bg}`} />
                <span className="text-xs">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )}
  
  {/* Compact View Toggle */}
  {settings.orgchart_compact_view && (
    <button
      onClick={() => setCompactView(!compactView)}
      className={`px-3 py-2 border rounded-lg transition-colors ${
        compactView 
          ? 'bg-blue-500 text-white border-blue-600' 
          : 'bg-white border-gray-300 hover:bg-gray-50'
      }`}
    >
      {compactView ? '📋 Detailed' : '📝 Compact'}
    </button>
  )}
  
  {/* Zoom controls - existing */}
</div>
```

### Step 3: Update EmployeeCard Component

Add department colors and compact view support:

```typescript
interface EmployeeCardProps {
  node: OrgChartNode;
  isDragging?: boolean;
  isOver?: boolean;
  onExpand?: () => void;
  isExpanded?: boolean;
  onClick?: () => void;
  departmentColors?: boolean;
  compactView?: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  node,
  isDragging = false,
  isOver = false,
  onExpand,
  isExpanded,
  onClick,
  departmentColors = false,
  compactView = false,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const initials = node.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const avatarUrl = node.avatar_url ? `http://localhost:8000${node.avatar_url}` : null;
  const deptColor = departmentColors ? getDepartmentColor(node.department) : null;

  if (compactView) {
    // Compact card - avatar + name only
    return (
      <div
        className={`
          employee-card relative w-[160px] rounded-xl shadow-md bg-white
          transition-all duration-300
          ${isDragging ? 'opacity-40 scale-95' : 'hover:shadow-xl hover:scale-105'}
          ${isOver ? 'ring-2 ring-blue-400' : ''}
          ${deptColor ? `${deptColor.border} border-2` : 'border border-gray-200'}
        `}
        onClick={onClick}
      >
        {/* Drag Handle */}
        <div className="absolute top-1 left-1 cursor-grab text-gray-400 hover:text-blue-500 z-10">
          <GripVertical className="w-3 h-3" />
        </div>
        
        {/* Compact content */}
        <div className="flex flex-col items-center p-3">
          <div className={`w-10 h-10 rounded-full ${deptColor ? `bg-gradient-to-br ${deptColor.gradient}` : 'bg-gradient-to-br from-blue-500 to-purple-600'} flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden`}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={node.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="text-xs font-semibold text-gray-900 text-center mt-1 truncate w-full">
            {node.name}
          </div>
        </div>
      </div>
    );
  }

  // Regular detailed card with department colors
  return (
    <div
      className={`
        employee-card relative w-[220px] rounded-2xl shadow-lg bg-white
        transition-all duration-300 ease-in-out
        ${isDragging ? 'opacity-40 scale-95' : 'hover:shadow-2xl hover:scale-105'}
        ${isOver ? 'ring-4 ring-blue-400 border-2 border-blue-500' : `border-2 ${deptColor ? deptColor.border : 'border-gray-200'}`}
        ${deptColor ? deptColor.bg : ''}
      `}
      onClick={onClick}
    >
      {/* Existing card content with department color accents */}
      {/* ... */}
    </div>
  );
};
```

### Step 4: Add SVG Connectors

Create a new component for SVG connectors:

```typescript
// components/orgchart/OrgChartConnectors.tsx
import React, { useEffect, useState, useRef } from 'react';
import { OrgChartNode } from '../../services/orgchartService';
import { getDepartmentEdgeColor } from '../../utils/departmentColors';

interface ConnectorsProps {
  data: OrgChartNode[];
  nodeRefs: Map<string, HTMLElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  pan: { x: number; y: number };
  departmentColors: boolean;
}

export const OrgChartConnectors: React.FC<ConnectorsProps> = ({
  data,
  nodeRefs,
  containerRef,
  zoom,
  pan,
  departmentColors,
}) => {
  const [paths, setPaths] = useState<Array<{
    d: string;
    color: string;
  }>>([]);

  useEffect(() => {
    const computePaths = () => {
      const newPaths: Array<{ d: string; color: string }> = [];
      
      const collectConnections = (nodes: OrgChartNode[], parentElement: HTMLElement | null = null) => {
        nodes.forEach(node => {
          const childElement = nodeRefs.get(node.id);
          
          if (parentElement && childElement && containerRef.current) {
            const parentRect = parentElement.getBoundingClientRect();
            const childRect = childElement.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            
            // Calculate positions relative to container
            const parentX = (parentRect.left + parentRect.width / 2 - containerRect.left) / zoom;
            const parentY = (parentRect.bottom - containerRect.top) / zoom;
            const childX = (childRect.left + childRect.width / 2 - containerRect.left) / zoom;
            const childY = (childRect.top - containerRect.top) / zoom;
            
            // Create curved path
            const midY = (parentY + childY) / 2;
            const d = `M ${parentX} ${parentY} C ${parentX} ${midY}, ${childX} ${midY}, ${childX} ${childY}`;
            
            const color = departmentColors 
              ? getDepartmentEdgeColor(node.department)
              : '#9CA3AF';
            
            newPaths.push({ d, color });
          }
          
          if (node.children && node.children.length > 0) {
            collectConnections(node.children, childElement);
          }
        });
      };
      
      collectConnections(data);
      setPaths(newPaths);
    };
    
    // Recompute on zoom, pan, or data change
    computePaths();
    
    // Also recompute on window resize
    window.addEventListener('resize', computePaths);
    return () => window.removeEventListener('resize', computePaths);
  }, [data, nodeRefs, zoom, pan, departmentColors, containerRef]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      {paths.map((path, index) => (
        <path
          key={index}
          d={path.d}
          stroke={path.color}
          strokeWidth={2}
          fill="none"
          opacity={0.6}
        />
      ))}
    </svg>
  );
};
```

### Step 5: Update DraggableOrgChart Integration

```typescript
// In DraggableOrgChart component
import { OrgChartConnectors } from './OrgChartConnectors';

const DraggableOrgChart: React.FC<DraggableOrgChartProps> = ({
  data,
  unassignedEmployees = [],
  onReassign,
  onUserClick,
  initialZoom,
  initialPan,
  onZoomChange,
  onPanChange,
  settings, // New prop
  compactView, // New prop
  canDragNode, // New prop - function to check if node can be dragged
}) => {
  // ...

  // Modify useDraggable to conditionally enable
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: node.id,
    data: { node },
    disabled: !canDragNode(parseInt(node.id)), // Guard with permission check
  });

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* SVG Connectors Layer */}
      {settings?.orgchart_show_connectors && (
        <OrgChartConnectors
          data={data}
          nodeRefs={nodeRefs.current}
          containerRef={containerRef}
          zoom={zoom}
          pan={pan}
          departmentColors={settings.orgchart_department_colors}
        />
      )}
      
      {/* Org chart content */}
      <div
        ref={contentRef}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        className="relative"
      >
        {/* Pass settings to child components */}
        {data.map(node => (
          <DraggableEmployee
            key={node.id}
            node={node}
            departmentColors={settings?.orgchart_department_colors}
            compactView={compactView}
            canDrag={canDragNode(parseInt(node.id))}
            // ...
          />
        ))}
      </div>
      
      {/* Unassigned Panel */}
      {settings?.orgchart_show_unassigned_panel && unassignedEmployees.length > 0 && (
        <UnassignedPanel unassignedEmployees={unassignedEmployees} />
      )}
    </div>
  );
};
```

### Step 6: Handle Unassigned Drag Both Ways

The existing `UnassignedPanel` already supports dragging TO it. To drag FROM it, the `UnassignedEmployeeCard` already has draggable functionality. Just ensure the `onDragEnd` handler in the parent properly handles setting `managerId = null`:

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  
  if (!over) return;
  
  const draggedNode = active.data.current?.node;
  if (!draggedNode) return;
  
  // Check if dropped in unassigned zone
  if (over.data.current?.isUnassignedZone) {
    onReassign(parseInt(draggedNode.id), null, null);
    return;
  }
  
  // Normal reassignment logic
  const targetNode = over.data.current?.node;
  if (targetNode && draggedNode.id !== targetNode.id) {
    onReassign(
      parseInt(draggedNode.id),
      parseInt(targetNode.id),
      null
    );
  }
};
```

## 🧪 Testing Checklist

### Feature 1: Unassigned Panel
- [ ] Panel shows when `orgchart_show_unassigned_panel = true`
- [ ] Panel hides when flag = false
- [ ] Can drag employee FROM assigned TO unassigned
- [ ] Can drag employee FROM unassigned TO manager
- [ ] managerId properly set to null when dropped in panel

### Feature 2: Manager Subtree Edit
- [ ] Enabled when `orgchart_manager_subtree_edit = true`
- [ ] Manager can only drag nodes in their subtree
- [ ] Admin can drag any node
- [ ] Employee role cannot drag nodes
- [ ] Drag handles disabled for non-draggable nodes

### Feature 3: Department Colors
- [ ] Colors apply when `orgchart_department_colors = true`
- [ ] Each department has unique color
- [ ] Legend shows all departments
- [ ] Edges colored by department
- [ ] Colors disabled when flag = false

### Feature 4: Compact View
- [ ] Toggle appears when `orgchart_compact_view = true`
- [ ] Compact cards show avatar + name only
- [ ] Detailed cards show full info
- [ ] Toggle persists during session
- [ ] Layout adjusts properly

### Feature 5: Connecting Lines
- [ ] Lines show when `orgchart_show_connectors = true`
- [ ] Lines hide when flag = false
- [ ] Lines update on drag
- [ ] Lines removed when node reassigned
- [ ] Lines colored by department when colors enabled
- [ ] No stale lines after drag operations

## 🎨 CSS Classes

Add these to your global CSS or Tailwind config:

```css
/* Compact view card animations */
.employee-card-compact {
  @apply w-32 h-24;
}

/* Department color transitions */
.dept-colored {
  transition: border-color 0.3s, background-color 0.3s;
}

/* Connector animations */
.org-connector {
  transition: opacity 0.3s, stroke 0.3s;
}
```

## 🔧 Admin Settings UI

Add toggles in Settings page:

```typescript
<div className="space-y-4">
  <h3 className="font-semibold">Org Chart Features</h3>
  
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={settings.orgchart_show_unassigned_panel}
      onChange={(e) => updateSetting('orgchart_show_unassigned_panel', e.target.checked)}
    />
    Show Unassigned Panel
  </label>
  
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={settings.orgchart_manager_subtree_edit}
      onChange={(e) => updateSetting('orgchart_manager_subtree_edit', e.target.checked)}
    />
    Manager Subtree Edit Only
  </label>
  
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={settings.orgchart_department_colors}
      onChange={(e) => updateSetting('orgchart_department_colors', e.target.checked)}
    />
    Department Colors
  </label>
  
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={settings.orgchart_compact_view}
      onChange={(e) => updateSetting('orgchart_compact_view', e.target.checked)}
    />
    Enable Compact View Toggle
  </label>
  
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={settings.orgchart_show_connectors}
      onChange={(e) => updateSetting('orgchart_show_connectors', e.target.checked)}
    />
    Show Connecting Lines
  </label>
</div>
```

## 📝 Summary

All 5 features are designed to:
- ✅ Work independently (each can be toggled on/off)
- ✅ Not break existing DnD logic
- ✅ Clean up properly (no stale lines or artifacts)
- ✅ Respect role-based permissions
- ✅ Update dynamically on data changes

The implementation uses React hooks, conditional rendering, and proper state management to ensure features can be enabled/disabled without side effects.

## Files Created

1. `hooks/useOrgChartSettings.ts` - Fetch feature flags
2. `utils/departmentColors.ts` - Department color utilities
3. `components/orgchart/OrgChartConnectors.tsx` - SVG connector component (to be created)

## Files to Modify

1. `pages/OrgChart/OrgChartPage.tsx` - Add settings, toolbar, permissions
2. `components/orgchart/DraggableOrgChart.tsx` - Add feature integration
3. `components/orgchart/EmployeeCard` - Add colors and compact view
4. `pages/Settings/SettingsPage.tsx` - Add feature flag toggles

## Implementation Status

- ✅ Backend feature flags - Complete
- ✅ Backend API endpoints - Complete
- ✅ Migration - Complete
- ✅ Settings hook - Complete
- ✅ Department colors utility - Complete
- ⏳ Frontend integration - In progress (requires careful file modifications)

This guide provides all the necessary code. The actual integration requires careful modification of the existing large files to avoid breaking DnD functionality.

