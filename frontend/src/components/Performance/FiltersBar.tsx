import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface FiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'all' | 'active' | 'completed' | 'pending' | 'overdue';
  onStatusFilterChange: (status: 'all' | 'active' | 'completed' | 'pending' | 'overdue') => void;
  sortBy: 'created_at' | 'due_date' | 'progress' | 'title';
  onSortByChange: (sortBy: 'created_at' | 'due_date' | 'progress' | 'title') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onClearFilters: () => void;
  resultCount?: number;
  totalCount?: number;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  searchQuery, onSearchChange, statusFilter, onStatusFilterChange, sortBy, onSortByChange,
  sortOrder, onSortOrderChange, onClearFilters, resultCount = 0, totalCount = 0
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search goals..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-primary" />
          </div>
          <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as typeof statusFilter)}
            className="bg-gray-50 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary">
            <option value="all">All Status</option><option value="active">Active</option><option value="completed">Completed</option>
            <option value="pending">Pending</option><option value="overdue">Overdue</option>
          </select>
          <select value={sortBy} onChange={(e) => onSortByChange(e.target.value as typeof sortBy)}
            className="bg-gray-50 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary">
            <option value="created_at">Created</option><option value="due_date">Due Date</option>
            <option value="progress">Progress</option><option value="title">Title</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Showing {resultCount} of {totalCount}</span>
          <button onClick={onClearFilters} className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
            <RotateCcw className="w-4 h-4 mr-1" />Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
