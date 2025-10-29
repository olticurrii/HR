import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, RotateCcw } from 'lucide-react';
import TRAXCIS_COLORS from '../../theme/traxcis';

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
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  resultCount = 0,
  totalCount = 0,
}) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  // Container: use neutral light in light mode, secondary dark in dark mode
  const containerBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  // Border: use secondary colors
  const containerBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  // Inputs: use secondary colors
  const inputBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBorder = isDark ? TRAXCIS_COLORS.secondary[600] : TRAXCIS_COLORS.secondary[200];
  const inputText = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  // Icons: use secondary lighter shades
  const iconColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[400];
  // Buttons: use secondary colors
  const buttonBg = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[100];
  const buttonText = isDark ? TRAXCIS_COLORS.secondary[200] : TRAXCIS_COLORS.secondary[700];
  // Text: use secondary colors
  const textColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: containerBg,
        borderRadius: '16px',
        boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: `1px solid ${containerBorder}`,
        padding: '24px',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          flex: 1,
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '448px' }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: iconColor,
              width: '16px',
              height: '16px',
            }} />
            <input
              type="text"
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '16px',
                paddingTop: '8px',
                paddingBottom: '8px',
                backgroundColor: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                color: inputText,
              }}
              onFocus={(e) => {
                e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
                e.target.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.target.style.outline = 'none';
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as typeof statusFilter)}
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                color: inputText,
                cursor: 'pointer',
              }}
              onFocus={(e) => {
                e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
                e.target.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.target.style.outline = 'none';
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as typeof sortBy)}
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                color: inputText,
                cursor: 'pointer',
              }}
              onFocus={(e) => {
                e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
                e.target.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.target.style.outline = 'none';
              }}
            >
              <option value="created_at">Sort by Created</option>
              <option value="due_date">Sort by Due Date</option>
              <option value="progress">Sort by Progress</option>
              <option value="title">Sort by Title</option>
            </select>

            <button
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '8px 16px',
                backgroundColor: buttonBg,
                color: buttonText,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? TRAXCIS_COLORS.secondary[600] : TRAXCIS_COLORS.secondary[200]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = buttonBg}
            >
              {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '14px',
            color: textColor,
            fontFamily: "'Outfit', sans-serif",
          }}>
            Showing {resultCount} of {totalCount}
          </span>
          <button
            onClick={onClearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              fontSize: '14px',
              color: textColor,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT}
            onMouseLeave={(e) => e.currentTarget.style.color = textColor}
          >
            <RotateCcw style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            Clear
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FiltersBar;
