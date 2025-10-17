import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, ZoomIn, ZoomOut, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';

interface TopToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddEmployee: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  isAllExpanded: boolean;
}

const TopToolbar: React.FC<TopToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onAddEmployee,
  onZoomIn,
  onZoomOut,
  onFitView,
  onExpandAll,
  onCollapseAll,
  isAllExpanded,
}) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full px-6 py-4"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="flex items-center justify-between gap-4 max-w-full">
        {/* Left: Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
              }}
            />
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Add Employee */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddEmployee}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium text-sm shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </motion.button>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
            <button
              onClick={onZoomOut}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onZoomIn}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onFitView}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              title="Fit to Screen"
            >
              <Maximize2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Expand/Collapse Toggle */}
          <button
            onClick={isAllExpanded ? onCollapseAll : onExpandAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            {isAllExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Expand All
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TopToolbar;

