import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import TRAXCIS_COLORS from '../../theme/traxcis';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
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

  const containerBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100];
  const buttonBg = isDark ? TRAXCIS_COLORS.secondary[700] : '#FFFFFF';
  const buttonHoverBg = isDark ? TRAXCIS_COLORS.secondary[600] : TRAXCIS_COLORS.secondary[50];
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const iconColor = isDark ? TRAXCIS_COLORS.secondary[300] : TRAXCIS_COLORS.secondary[600];

  const buttonStyle = {
    padding: '8px',
    backgroundColor: buttonBg,
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    color: iconColor,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: containerBg,
        borderRadius: '12px',
        padding: '4px',
        boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <button
        onClick={onZoomOut}
        style={buttonStyle}
        title="Zoom Out"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = buttonHoverBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = buttonBg;
        }}
      >
        <ZoomOut style={{ width: '16px', height: '16px' }} />
      </button>
      
      <span style={{
        fontSize: '14px',
        fontWeight: '500',
        minWidth: '48px',
        textAlign: 'center',
        color: textColor,
        fontFamily: "'Outfit', sans-serif",
      }}>
        {Math.round(zoom * 100)}%
      </span>
      
      <button
        onClick={onZoomIn}
        style={buttonStyle}
        title="Zoom In"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = buttonHoverBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = buttonBg;
        }}
      >
        <ZoomIn style={{ width: '16px', height: '16px' }} />
      </button>
      
      <button
        onClick={onReset}
        style={buttonStyle}
        title="Reset Zoom"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = buttonHoverBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = buttonBg;
        }}
      >
        <RotateCcw style={{ width: '16px', height: '16px' }} />
      </button>
    </motion.div>
  );
};

export default ZoomControls;


