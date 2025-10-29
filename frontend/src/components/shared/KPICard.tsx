import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import TRAXCIS_COLORS from '../../theme/traxcis';

interface KPICardProps {
  name: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'primary' | 'accent' | 'green' | 'yellow' | 'orange' | 'red';
  loading?: boolean;
  progress?: number;
}

const KPICard: React.FC<KPICardProps> = ({
  name,
  value,
  icon: Icon,
  color = 'primary',
  loading = false,
  progress,
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

  const iconColors = {
    primary: TRAXCIS_COLORS.primary.DEFAULT,
    accent: TRAXCIS_COLORS.accent.DEFAULT,
    green: TRAXCIS_COLORS.status.success,
    yellow: TRAXCIS_COLORS.status.warning,
    orange: TRAXCIS_COLORS.accent.DEFAULT,
    red: TRAXCIS_COLORS.status.error,
  };

  const iconBg = iconColors[color];
  
  // Card background: use neutral light in light mode, secondary dark in dark mode
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : TRAXCIS_COLORS.neutral.light;
  // Border: use secondary colors
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  // Title: use secondary for headings
  const titleColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  // Value: use primary for important numbers
  const valueColor = isDark ? TRAXCIS_COLORS.primary[400] : TRAXCIS_COLORS.primary.DEFAULT;
  // Progress bar background: use secondary colors
  const progressBg = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '20px',
        border: `1px solid ${cardBorder}`,
        boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
      }}
      whileHover={{
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        y: -2,
      }}
    >
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#E5E7EB',
            borderRadius: '8px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              height: '16px',
              backgroundColor: '#E5E7EB',
              borderRadius: '4px',
              width: '75%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }} />
            <div style={{
              height: '32px',
              backgroundColor: '#E5E7EB',
              borderRadius: '4px',
              width: '50%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Icon */}
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: iconBg,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
          </div>

          {/* Content */}
          <div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: titleColor,
              fontFamily: "'Outfit', sans-serif",
              marginBottom: '4px',
            }}>
              {name}
            </h3>
            <p style={{
              fontSize: '24px',
              fontWeight: '500',
              color: valueColor,
              fontFamily: "'Outfit', sans-serif",
              marginTop: '4px',
            }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>

          {/* Progress Bar */}
          {progress !== undefined && (
            <div style={{ marginTop: '8px' }}>
              <div style={{
                height: '4px',
                backgroundColor: progressBg,
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{
                    height: '100%',
                    backgroundColor: TRAXCIS_COLORS.accent.DEFAULT,
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default KPICard;
