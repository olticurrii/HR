import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mail, Phone, Briefcase, Building, Shield, Edit, Check, X } from 'lucide-react';
import { UserProfile, ProfileUpdate } from '../../services/profileService';
import API_BASE_URL from '../../config';
import TRAXCIS_COLORS from '../../theme/traxcis';

interface ProfileInfoCardProps {
  profile: UserProfile;
  onUpdate: (data: ProfileUpdate) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<void>;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  profile,
  onUpdate,
  onAvatarUpload,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    phone: profile.phone || '',
    job_role: profile.job_role || '',
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name,
      phone: profile.phone || '',
      job_role: profile.job_role || '',
    });
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onAvatarUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await onAvatarUpload(file);
    }
  };

  const avatarUrl = profile.avatar_url
    ? `${API_BASE_URL}${profile.avatar_url}`
    : null;

  // Theme colors
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const inputBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBorder = isDark ? TRAXCIS_COLORS.secondary[600] : TRAXCIS_COLORS.secondary[300];
  const disabledBg = isDark ? TRAXCIS_COLORS.secondary[900] : TRAXCIS_COLORS.secondary[100];

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
        Profile Information
      </h2>

      {/* Avatar Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
        <div
          onClick={handleAvatarClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: isDragging ? `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}` : `3px solid ${cardBorder}`,
            boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile.full_name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <span style={{
              fontSize: '48px',
              color: TRAXCIS_COLORS.primary.DEFAULT,
              fontWeight: '600',
            }}>
              {profile.full_name.charAt(0).toUpperCase()}
            </span>
          )}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0';
          }}
          >
            <div style={{ textAlign: 'center', color: '#FFFFFF' }}>
              <Camera style={{ width: '24px', height: '24px', margin: '0 auto 4px' }} />
              <span style={{ fontSize: '12px', fontWeight: '500' }}>Change Photo</span>
            </div>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <p style={{
          fontSize: '13px',
          color: subTextColor,
          marginTop: '12px',
          textAlign: 'center',
        }}>
          Click or drag to upload new avatar
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email (read-only) */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: textColor,
              marginBottom: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail style={{ width: '14px', height: '14px', color: subTextColor }} />
                Email
              </div>
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                backgroundColor: disabledBg,
                color: subTextColor,
                cursor: 'not-allowed',
              }}
            />
          </div>

          {/* Full Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: textColor,
              marginBottom: '6px',
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                backgroundColor: isEditing ? inputBg : disabledBg,
                color: isEditing ? textColor : subTextColor,
                cursor: isEditing ? 'text' : 'not-allowed',
              }}
              onFocus={(e) => {
                if (isEditing) {
                  e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
                  e.target.style.outlineOffset = '2px';
                }
              }}
              onBlur={(e) => {
                e.target.style.outline = 'none';
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: textColor,
              marginBottom: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone style={{ width: '14px', height: '14px', color: subTextColor }} />
                Phone
              </div>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={!isEditing}
              placeholder="+1 (555) 000-0000"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                backgroundColor: isEditing ? inputBg : disabledBg,
                color: isEditing ? textColor : subTextColor,
                cursor: isEditing ? 'text' : 'not-allowed',
              }}
              onFocus={(e) => {
                if (isEditing) {
                  e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
                  e.target.style.outlineOffset = '2px';
                }
              }}
              onBlur={(e) => {
                e.target.style.outline = 'none';
              }}
            />
          </div>

          {/* Job Title */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: textColor,
              marginBottom: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase style={{ width: '14px', height: '14px', color: subTextColor }} />
                Job Title
              </div>
            </label>
            <input
              type="text"
              value={formData.job_role}
              onChange={(e) =>
                setFormData({ ...formData, job_role: e.target.value })
              }
              disabled={!isEditing}
              placeholder="e.g., Software Engineer"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                backgroundColor: isEditing ? inputBg : disabledBg,
                color: isEditing ? textColor : subTextColor,
                cursor: isEditing ? 'text' : 'not-allowed',
              }}
              onFocus={(e) => {
                if (isEditing) {
                  e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
                  e.target.style.outlineOffset = '2px';
                }
              }}
              onBlur={(e) => {
                e.target.style.outline = 'none';
              }}
            />
          </div>

          {/* Department (read-only) */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: textColor,
              marginBottom: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building style={{ width: '14px', height: '14px', color: subTextColor }} />
                Department
              </div>
            </label>
            <input
              type="text"
              value={profile.department_name || 'Not assigned'}
              disabled
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                backgroundColor: disabledBg,
                color: subTextColor,
                cursor: 'not-allowed',
              }}
            />
          </div>

          {/* Role (read-only) */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: textColor,
              marginBottom: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield style={{ width: '14px', height: '14px', color: subTextColor }} />
                Role
              </div>
            </label>
            <input
              type="text"
              value={profile.role}
              disabled
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                backgroundColor: disabledBg,
                color: subTextColor,
                cursor: 'not-allowed',
                textTransform: 'capitalize',
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
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
              <Edit style={{ width: '16px', height: '16px' }} />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: TRAXCIS_COLORS.status.success,
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.status.success}
              >
                <Check style={{ width: '16px', height: '16px' }} />
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
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
                <X style={{ width: '16px', height: '16px' }} />
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default ProfileInfoCard;
