import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Languages, Palette, Mail, CheckCircle, Save, RotateCcw } from 'lucide-react';
import { UserProfile, ProfileUpdate } from '../../services/profileService';
import TRAXCIS_COLORS from '../../theme/traxcis';

interface PreferencesCardProps {
  profile: UserProfile;
  onUpdate: (data: ProfileUpdate) => Promise<void>;
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Europe/Pristina', label: 'Pristina (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
];

const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'sq', label: 'Albanian (Shqip)' },
  { value: 'de', label: 'German (Deutsch)' },
  { value: 'fr', label: 'French (Français)' },
  { value: 'es', label: 'Spanish (Español)' },
  { value: 'it', label: 'Italian (Italiano)' },
];

const THEMES = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' },
];

const PreferencesCard: React.FC<PreferencesCardProps> = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    timezone: profile.timezone || 'UTC',
    locale: profile.locale || 'en',
    theme: profile.theme || 'light',
    email_notifications: profile.email_notifications !== false,
  });
  const [hasChanges, setHasChanges] = useState(false);
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

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData({
      timezone: profile.timezone || 'UTC',
      locale: profile.locale || 'en',
      theme: profile.theme || 'light',
      email_notifications: profile.email_notifications !== false,
    });
    setHasChanges(false);
  };

  // Theme colors
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const inputBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBorder = isDark ? TRAXCIS_COLORS.secondary[600] : TRAXCIS_COLORS.secondary[300];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: cardBg,
        borderRadius: '16px',
        boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: `1px solid ${cardBorder}`,
        padding: '24px',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <h2 style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '24px',
        color: textColor,
      }}>
        Preferences
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Timezone */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: textColor,
            marginBottom: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe style={{ width: '14px', height: '14px', color: subTextColor }} />
              Timezone
            </div>
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${inputBorder}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: "'Outfit', sans-serif",
              backgroundColor: inputBg,
              color: textColor,
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
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p style={{ fontSize: '12px', color: subTextColor, marginTop: '4px' }}>
            Used for displaying dates and times
          </p>
        </div>

        {/* Locale */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: textColor,
            marginBottom: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Languages style={{ width: '14px', height: '14px', color: subTextColor }} />
              Language
            </div>
          </label>
          <select
            value={formData.locale}
            onChange={(e) => handleChange('locale', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${inputBorder}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: "'Outfit', sans-serif",
              backgroundColor: inputBg,
              color: textColor,
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
            {LOCALES.map((locale) => (
              <option key={locale.value} value={locale.value}>
                {locale.label}
              </option>
            ))}
          </select>
          <p style={{ fontSize: '12px', color: subTextColor, marginTop: '4px' }}>
            Preferred language for the interface
          </p>
        </div>

        {/* Theme */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: textColor,
            marginBottom: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Palette style={{ width: '14px', height: '14px', color: subTextColor }} />
              Theme
            </div>
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}>
            {THEMES.map((theme) => (
              <button
                key={theme.value}
                type="button"
                onClick={() => handleChange('theme', theme.value)}
                style={{
                  padding: '16px',
                  border: `2px solid ${formData.theme === theme.value ? TRAXCIS_COLORS.primary.DEFAULT : cardBorder}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  textAlign: 'center',
                  backgroundColor: formData.theme === theme.value
                    ? (isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50])
                    : 'transparent',
                  color: formData.theme === theme.value ? TRAXCIS_COLORS.primary.DEFAULT : textColor,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (formData.theme !== theme.value) {
                    e.currentTarget.style.borderColor = TRAXCIS_COLORS.secondary[400];
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.theme !== theme.value) {
                    e.currentTarget.style.borderColor = cardBorder;
                  }
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{theme.icon}</div>
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* Email Notifications */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: textColor,
            marginBottom: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail style={{ width: '14px', height: '14px', color: subTextColor }} />
              Notifications
            </div>
          </label>
          <div style={{
            padding: '16px',
            backgroundColor: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50],
            borderRadius: '8px',
            border: `1px solid ${cardBorder}`,
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={formData.email_notifications}
                onChange={(e) => handleChange('email_notifications', e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  marginRight: '10px',
                  cursor: 'pointer',
                  accentColor: TRAXCIS_COLORS.primary.DEFAULT,
                }}
              />
              <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>
                Email notifications
              </span>
            </label>
            <p style={{
              fontSize: '12px',
              color: subTextColor,
              marginLeft: '28px',
              marginTop: '4px',
            }}>
              Receive email updates about tasks, messages, and important events
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {hasChanges ? (
          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '16px',
            borderTop: `1px solid ${cardBorder}`,
          }}>
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: TRAXCIS_COLORS.primary.DEFAULT,
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              Save Preferences
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: textColor,
                border: `1px solid ${cardBorder}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <RotateCcw style={{ width: '16px', height: '16px' }} />
              Reset
            </button>
          </div>
        ) : (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
            border: `1px solid ${isDark ? '#065F46' : '#A7F3D0'}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle style={{ width: '16px', height: '16px', color: TRAXCIS_COLORS.status.success }} />
            <p style={{ fontSize: '14px', color: isDark ? '#6EE7B7' : '#065F46' }}>
              All preferences saved
            </p>
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default PreferencesCard;
