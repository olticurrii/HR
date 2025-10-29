import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TRAXCIS_COLORS from '../../theme/traxcis';

interface ToggleSwitchProps {
  id: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, enabled, onChange, disabled = false }) => {
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

  const bgColor = enabled 
    ? TRAXCIS_COLORS.primary.DEFAULT
    : (isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[300]);

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        height: '24px',
        width: '44px',
        flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: '9999px',
        border: '2px solid transparent',
        backgroundColor: disabled ? TRAXCIS_COLORS.secondary[400] : bgColor,
        transition: 'background-color 0.2s ease',
        opacity: disabled ? 0.5 : 1,
      }}
      role="switch"
      aria-checked={enabled}
      id={id}
      onFocus={(e) => {
        if (!disabled) {
          e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
          e.target.style.outlineOffset = '2px';
        }
      }}
      onBlur={(e) => {
        e.target.style.outline = 'none';
      }}
    >
      <motion.span
        animate={{
          transform: enabled ? 'translateX(20px)' : 'translateX(0px)',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          pointerEvents: 'none',
          display: 'inline-block',
          height: '20px',
          width: '20px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      />
    </button>
  );
};

export default ToggleSwitch;


