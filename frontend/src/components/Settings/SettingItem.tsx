import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import ToggleSwitch from './ToggleSwitch';
import TRAXCIS_COLORS from '../../theme/traxcis';

interface SettingItemProps {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  warning?: string;
  badge?: { text: string; color: 'green' | 'red' | 'gray' | 'orange' };
}

const SettingItem: React.FC<SettingItemProps> = ({
  id,
  title,
  description,
  enabled,
  onChange,
  disabled = false,
  warning,
  badge,
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

  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];

  const getBadgeColors = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: isDark ? '#064E3B' : '#D1FAE5',
          text: isDark ? '#6EE7B7' : '#065F46',
        };
      case 'red':
        return {
          bg: isDark ? '#7C2D12' : '#FEE2E2',
          text: isDark ? '#FCA5A5' : '#991B1B',
        };
      case 'orange':
        return {
          bg: isDark ? '#78350F' : '#FEF3C7',
          text: isDark ? '#FCD34D' : '#92400E',
        };
      default:
        return {
          bg: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100],
          text: isDark ? TRAXCIS_COLORS.secondary[300] : TRAXCIS_COLORS.secondary[600],
        };
    }
  };

  const badgeColors = badge ? getBadgeColors(badge.color) : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <label
            htmlFor={id}
            style={{
              fontSize: '15px',
              fontWeight: '500',
              color: textColor,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {title}
            {badge && badgeColors && (
              <span style={{
                padding: '2px 8px',
                fontSize: '11px',
                backgroundColor: badgeColors.bg,
                color: badgeColors.text,
                borderRadius: '4px',
                fontWeight: '500',
              }}>
                {badge.text}
              </span>
            )}
          </label>
          <p style={{
            fontSize: '13px',
            color: subTextColor,
            marginTop: '4px',
            lineHeight: '1.5',
          }}>
            {description}
          </p>
          {warning && (
            <div style={{
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: isDark ? '#FCA5A5' : '#991B1B',
            }}>
              <AlertCircle style={{ width: '14px', height: '14px' }} />
              <span>{warning}</span>
            </div>
          )}
        </div>
        <div style={{ marginLeft: '24px' }}>
          <ToggleSwitch
            id={id}
            enabled={enabled}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingItem;


