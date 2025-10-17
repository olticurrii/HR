import React, { useMemo, useEffect, useState, useRef } from 'react';

export interface OrgEdgesProps {
  employees: any[];
  getNodeRef: (id: string) => HTMLElement | null;
  rootId?: string | null;
  hiddenIds?: Set<string>;
  containerRef: React.RefObject<HTMLElement>;
  scale?: number; // Current zoom scale
}

interface EdgeData {
  id: string;
  managerId: string;
  childId: string;
  path: string;
}

export const OrgEdges: React.FC<OrgEdgesProps> = ({
  employees,
  getNodeRef,
  rootId,
  hiddenIds,
  containerRef,
  scale = 1,
}) => {
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const rafRef = useRef<number>();

  // Compute edge paths from current DOM positions
  const computeEdges = () => {
    if (!containerRef.current) {
      console.log('🔴 [OrgEdges] No containerRef');
      return [];
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const newEdges: EdgeData[] = [];
    
    console.log('🔵 [OrgEdges] Computing edges for', employees.length, 'employees');

    employees.forEach((employee) => {
      // Skip if no manager, is root, or is hidden
      if (!employee.managerId) {
        console.log('⚪ [OrgEdges] Skipping', employee.id, '- no manager');
        return;
      }
      if (rootId && employee.id === rootId) return;
      if (hiddenIds?.has(String(employee.id))) return;

      const managerEl = getNodeRef(String(employee.managerId));
      const childEl = getNodeRef(String(employee.id));

      // Skip if either element is not mounted
      if (!managerEl || !childEl) {
        console.log('🟡 [OrgEdges] Missing refs for edge', employee.managerId, '→', employee.id, 
          'managerEl:', !!managerEl, 'childEl:', !!childEl);
        return;
      }

      try {
        const managerRect = managerEl.getBoundingClientRect();
        const childRect = childEl.getBoundingClientRect();

        // Calculate anchor points (center-bottom of manager → center-top of child)
        // Convert to SVG local coordinates
        const x1 = (managerRect.left + managerRect.width / 2 - containerRect.left) / scale;
        const y1 = (managerRect.bottom - containerRect.top) / scale;
        const x2 = (childRect.left + childRect.width / 2 - containerRect.left) / scale;
        const y2 = (childRect.top - containerRect.top) / scale;

        // Create smooth cubic Bezier curve
        const dy = Math.max(24, Math.abs(y2 - y1) * 0.3);
        const path = `M ${x1},${y1} C ${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2}`;

        newEdges.push({
          id: `edge-${employee.managerId}-${employee.id}`,
          managerId: String(employee.managerId),
          childId: String(employee.id),
          path,
        });
        console.log('✅ [OrgEdges] Created edge:', employee.managerId, '→', employee.id, path);
      } catch (err) {
        // Silently skip if getBoundingClientRect fails
        console.warn('❌ [OrgEdges] Failed to compute edge for employee', employee.id, err);
      }
    });

    console.log('🟢 [OrgEdges] Total edges computed:', newEdges.length);
    return newEdges;
  };

  // Throttled recompute using RAF
  const scheduleUpdate = () => {
    if (rafRef.current) return; // Already scheduled
    
    rafRef.current = requestAnimationFrame(() => {
      const newEdges = computeEdges();
      setEdges(newEdges);
      rafRef.current = undefined;
    });
  };

  // Recompute on mount and when dependencies change
  useEffect(() => {
    console.log('🔄 [OrgEdges] useEffect triggered, employees:', employees.length);
    // Delay slightly to ensure DOM elements are mounted
    const timer = setTimeout(() => {
      scheduleUpdate();
    }, 100);
    return () => clearTimeout(timer);
  }, [employees, scale, rootId, hiddenIds]);

  // Recompute on window resize
  useEffect(() => {
    const handleResize = () => scheduleUpdate();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Get SVG dimensions from container
  const svgDimensions = useMemo(() => {
    if (!containerRef.current) return { width: '100%', height: '100%' };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      width: rect.width / scale,
      height: rect.height / scale,
    };
  }, [containerRef, scale]);

  console.log('🎨 [OrgEdges] Rendering', edges.length, 'edges');

  return (
    <svg
      className="org-edges-svg"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 1, // Below drag handles but above background
      }}
      width={svgDimensions.width}
      height={svgDimensions.height}
    >
      {edges.map((edge) => {
        console.log('📍 [OrgEdges] Rendering edge:', edge.id, edge.path);
        return (
          <path
            key={edge.id}
            className="org-edge-path"
            d={edge.path}
            stroke="#5B8EF1"
            strokeWidth={1.5}
            fill="none"
            opacity={0.9}
            style={{ pointerEvents: 'none' }}
          />
        );
      })}
    </svg>
  );
};

// Expose update method for parent to trigger recompute after DnD
export const useOrgEdgesUpdater = () => {
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  const triggerUpdate = () => {
    // Use RAF to wait for DOM to settle after mutations
    requestAnimationFrame(() => {
      setUpdateTrigger((prev) => prev + 1);
    });
  };

  return { updateTrigger, triggerUpdate };
};

