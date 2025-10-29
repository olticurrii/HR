import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import TRAXCIS_COLORS from '../../theme/traxcis';
import { Department } from '../../services/departmentService';

interface DepartmentFilterProps {
  departments: Department[];
  selected: string;
  onChange: (value: string) => void;
}

const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  departments,
  selected,
  onChange,
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

  const containerBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const containerBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const iconColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[400];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ position: 'relative' }}
    >
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: 'none',
          backgroundColor: containerBg,
          border: `1px solid ${containerBorder}`,
          borderRadius: '8px',
          padding: '8px 32px 8px 12px',
          fontSize: '14px',
          fontFamily: "'Outfit', sans-serif",
          color: textColor,
          cursor: 'pointer',
          minWidth: '180px',
          fontWeight: '500',
        }}
        onFocus={(e) => {
          e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
          e.target.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.target.style.outline = 'none';
        }}
      >
        <option value="all">All Departments</option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id.toString()}>
            {dept.name}
          </option>
        ))}
      </select>
      <ChevronDown
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '16px',
          height: '16px',
          color: iconColor,
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
};

export default DepartmentFilter;


