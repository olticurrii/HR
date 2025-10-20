/**
 * Department color mapping utilities
 * Provides consistent colors for departments across the org chart
 */

export interface DepartmentColor {
  bg: string;
  border: string;
  text: string;
  gradient: string;
}

const DEPARTMENT_COLORS: Record<string, DepartmentColor> = {
  Engineering: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    gradient: 'from-blue-400 to-blue-600',
  },
  Marketing: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-700',
    gradient: 'from-purple-400 to-purple-600',
  },
  Sales: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-700',
    gradient: 'from-green-400 to-green-600',
  },
  HR: {
    bg: 'bg-pink-50',
    border: 'border-pink-300',
    text: 'text-pink-700',
    gradient: 'from-pink-400 to-pink-600',
  },
  Finance: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-700',
    gradient: 'from-yellow-400 to-yellow-600',
  },
  Operations: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    text: 'text-orange-700',
    gradient: 'from-orange-400 to-orange-600',
  },
  IT: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
    text: 'text-indigo-700',
    gradient: 'from-indigo-400 to-indigo-600',
  },
  'Customer Support': {
    bg: 'bg-teal-50',
    border: 'border-teal-300',
    text: 'text-teal-700',
    gradient: 'from-teal-400 to-teal-600',
  },
  Legal: {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    text: 'text-gray-700',
    gradient: 'from-gray-400 to-gray-600',
  },
  Product: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-300',
    text: 'text-cyan-700',
    gradient: 'from-cyan-400 to-cyan-600',
  },
};

const DEFAULT_COLOR: DepartmentColor = {
  bg: 'bg-gray-50',
  border: 'border-gray-300',
  text: 'text-gray-700',
  gradient: 'from-gray-400 to-gray-600',
};

export const getDepartmentColor = (department: string | null | undefined): DepartmentColor => {
  if (!department) return DEFAULT_COLOR;
  return DEPARTMENT_COLORS[department] || DEFAULT_COLOR;
};

export const getAllDepartmentColors = (): Array<{ name: string; color: DepartmentColor }> => {
  return Object.entries(DEPARTMENT_COLORS).map(([name, color]) => ({ name, color }));
};

export const getDepartmentEdgeColor = (department: string | null | undefined): string => {
  if (!department) return '#9CA3AF'; // gray-400
  
  const colorMap: Record<string, string> = {
    Engineering: '#3B82F6', // blue-500
    Marketing: '#A855F7', // purple-500
    Sales: '#10B981', // green-500
    HR: '#EC4899', // pink-500
    Finance: '#F59E0B', // yellow-500
    Operations: '#F97316', // orange-500
    IT: '#6366F1', // indigo-500
    'Customer Support': '#14B8A6', // teal-500
    Legal: '#6B7280', // gray-500
    Product: '#06B6D4', // cyan-500
  };
  
  return colorMap[department] || '#9CA3AF';
};

