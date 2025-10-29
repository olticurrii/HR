import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Edit, Trash2, AlertCircle, CheckCircle, X, Tag } from 'lucide-react';
import { roleService, CustomRole, CreateRoleData, UpdateRoleData } from '../../services/roleService';
import toast from 'react-hot-toast';
import TRAXCIS_COLORS from '../../theme/traxcis';

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  const [isDark, setIsDark] = useState(false);

  const [formData, setFormData] = useState<CreateRoleData>({
    name: '',
    display_name: '',
    description: '',
  });

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

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setError(null);
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError(err.response?.data?.detail || 'Failed to fetch roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await roleService.createRole(formData);
      toast.success('Role created successfully');
      setSuccess('Role created successfully');
      setTimeout(() => setSuccess(null), 5000);
      setShowCreateModal(false);
      fetchRoles();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create role');
      toast.error('Failed to create role');
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    try {
      setError(null);
      const updateData: UpdateRoleData = {
        display_name: formData.display_name,
        description: formData.description,
      };
      await roleService.updateRole(selectedRole.id, updateData);
      toast.success('Role updated successfully');
      setSuccess('Role updated successfully');
      setTimeout(() => setSuccess(null), 5000);
      setShowEditModal(false);
      fetchRoles();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update role');
      toast.error('Failed to update role');
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      setError(null);
      await roleService.deleteRole(selectedRole.id);
      toast.success('Role deleted successfully');
      setSuccess('Role deleted successfully');
      setTimeout(() => setSuccess(null), 5000);
      setShowDeleteModal(false);
      fetchRoles();
      setSelectedRole(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete role');
      toast.error('Failed to delete role');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
    });
    setSelectedRole(null);
  };

  const openEditModal = (role: CustomRole) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (role: CustomRole) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const getRoleBadgeColors = (isSystemRole: boolean) => {
    if (isSystemRole) {
      return {
        bg: isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50],
        text: TRAXCIS_COLORS.primary.DEFAULT,
        border: isDark ? TRAXCIS_COLORS.primary[700] : TRAXCIS_COLORS.primary[200],
      };
    }
    return {
      bg: isDark ? '#064E3B' : '#D1FAE5',
      text: isDark ? '#6EE7B7' : '#065F46',
      border: isDark ? '#065F46' : '#A7F3D0',
    };
  };

  // Theme colors
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const tableBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const tableHeaderBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const tableRowHoverBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBorder = isDark ? TRAXCIS_COLORS.secondary[600] : TRAXCIS_COLORS.secondary[300];
  const modalOverlayBg = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '500',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Shield style={{ width: '28px', height: '28px' }} />
            Role Management
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', marginTop: '8px', fontSize: '15px' }}>
            Create, edit, and manage custom roles for your organization
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: cardBg,
            borderRadius: '16px',
            boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: `1px solid ${cardBorder}`,
            padding: '64px',
            textAlign: 'center',
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRight: `3px solid ${cardBorder}`,
            borderBottom: `3px solid ${cardBorder}`,
            borderLeft: `3px solid ${cardBorder}`,
            borderTop: `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: subTextColor, fontSize: '14px' }}>Loading roles...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '500',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}>
            <Shield style={{ width: '28px', height: '28px' }} />
            Role Management
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', fontSize: '15px' }}>
            Create, edit, and manage custom roles for your organization
          </p>
        </div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
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
            boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700]}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Create Role
        </motion.button>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
            }}
          >
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#991B1B' }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              backgroundColor: '#D1FAE5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
            }}
          >
            <CheckCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#065F46' }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {[
          { label: 'Total Roles', value: roles.length, color: TRAXCIS_COLORS.primary.DEFAULT },
          { label: 'System Roles', value: roles.filter(r => r.is_system_role).length, color: TRAXCIS_COLORS.accent.DEFAULT },
          { label: 'Custom Roles', value: roles.filter(r => !r.is_system_role).length, color: '#10B981' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
              backgroundColor: cardBg,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${cardBorder}`,
              boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: stat.color,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}>
              <Tag style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
            </div>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: subTextColor,
              marginBottom: '4px',
            }}>
              {stat.label}
            </p>
            <p style={{
              fontSize: '24px',
              fontWeight: '600',
              color: textColor,
            }}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Roles Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          backgroundColor: tableBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr style={{ backgroundColor: tableHeaderBg, borderBottom: `1px solid ${cardBorder}` }}>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: subTextColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Role
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: subTextColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Display Name
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: subTextColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Description
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: subTextColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Type
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'right',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: subTextColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, index) => {
                const badgeColors = getRoleBadgeColors(role.is_system_role);
                
                return (
                  <motion.tr
                    key={role.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      borderBottom: `1px solid ${cardBorder}`,
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tableRowHoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: textColor,
                        fontFamily: "'Courier New', monospace",
                      }}>
                        {role.name}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>
                        {role.display_name}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', color: subTextColor }}>
                        {role.description || 'No description'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: '12px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        backgroundColor: badgeColors.bg,
                        color: badgeColors.text,
                        border: `1px solid ${badgeColors.border}`,
                        fontWeight: '500',
                      }}>
                        {role.is_system_role ? 'System Role' : 'Custom Role'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {!role.is_system_role ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(role)}
                            style={{
                              padding: '8px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              color: TRAXCIS_COLORS.primary.DEFAULT,
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50];
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title="Edit role"
                          >
                            <Edit style={{ width: '16px', height: '16px' }} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(role)}
                            style={{
                              padding: '8px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              color: TRAXCIS_COLORS.status.error,
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDark ? '#7C2D12' : '#FEE2E2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title="Delete role"
                          >
                            <Trash2 style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: subTextColor, fontStyle: 'italic' }}>
                          Protected
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${cardBorder}`,
          backgroundColor: tableHeaderBg,
          fontSize: '14px',
          color: subTextColor,
        }}>
          Showing {roles.length} role{roles.length !== 1 ? 's' : ''} total ({roles.filter(r => r.is_system_role).length} system, {roles.filter(r => !r.is_system_role).length} custom)
        </div>
      </motion.div>

      {/* Create Role Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: modalOverlayBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '16px',
            }}
            onClick={() => {
              setShowCreateModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: cardBg,
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '20px',
                color: textColor,
              }}>
                Create New Role
              </h2>
              
              <form onSubmit={handleCreateRole}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: textColor,
                      marginBottom: '6px',
                    }}>
                      Role Name (identifier) *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                      placeholder="e.g., supervisor, team_lead"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: "'Courier New', monospace",
                        backgroundColor: inputBg,
                        color: textColor,
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
                        e.target.style.outlineOffset = '2px';
                      }}
                      onBlur={(e) => {
                        e.target.style.outline = 'none';
                      }}
                    />
                    <p style={{ fontSize: '12px', color: subTextColor, marginTop: '4px' }}>
                      Lowercase, no spaces (use underscores)
                    </p>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: textColor,
                      marginBottom: '6px',
                    }}>
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="e.g., Supervisor, Team Lead"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: "'Outfit', sans-serif",
                        backgroundColor: inputBg,
                        color: textColor,
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

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: textColor,
                      marginBottom: '6px',
                    }}>
                      Description (optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Describe this role..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: "'Outfit', sans-serif",
                        backgroundColor: inputBg,
                        color: textColor,
                        resize: 'vertical',
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
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      color: textColor,
                      border: `1px solid ${cardBorder}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = tableRowHoverBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: TRAXCIS_COLORS.primary.DEFAULT,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700]}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT}
                  >
                    Create Role
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {showEditModal && selectedRole && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: modalOverlayBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '16px',
            }}
            onClick={() => {
              setShowEditModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: cardBg,
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '20px',
                color: textColor,
              }}>
                Edit Role
              </h2>
              
              <form onSubmit={handleUpdateRole}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: textColor,
                      marginBottom: '6px',
                    }}>
                      Role Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      disabled
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: "'Courier New', monospace",
                        backgroundColor: isDark ? TRAXCIS_COLORS.secondary[900] : TRAXCIS_COLORS.secondary[100],
                        color: subTextColor,
                        cursor: 'not-allowed',
                      }}
                    />
                    <p style={{ fontSize: '12px', color: subTextColor, marginTop: '4px' }}>
                      Role name cannot be changed
                    </p>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: textColor,
                      marginBottom: '6px',
                    }}>
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: "'Outfit', sans-serif",
                        backgroundColor: inputBg,
                        color: textColor,
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

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: textColor,
                      marginBottom: '6px',
                    }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: "'Outfit', sans-serif",
                        backgroundColor: inputBg,
                        color: textColor,
                        resize: 'vertical',
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
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      color: textColor,
                      border: `1px solid ${cardBorder}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = tableRowHoverBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: TRAXCIS_COLORS.primary.DEFAULT,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700]}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedRole && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: modalOverlayBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '16px',
            }}
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedRole(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: cardBg,
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '450px',
                boxShadow: isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: isDark ? '#7C2D12' : '#FEE2E2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AlertCircle style={{ width: '24px', height: '24px', color: TRAXCIS_COLORS.status.error }} />
                </div>
              </div>
              
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: textColor,
                textAlign: 'center',
                marginBottom: '8px',
              }}>
                Delete Role
              </h3>
              
              <p style={{
                fontSize: '14px',
                color: subTextColor,
                textAlign: 'center',
                marginBottom: '24px',
              }}>
                Are you sure you want to delete the role <strong style={{ color: textColor }}>{selectedRole.display_name}</strong>? 
                This action cannot be undone.
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRole(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    color: textColor,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = tableRowHoverBg}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRole}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: TRAXCIS_COLORS.status.error,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.status.error}
                >
                  Delete Role
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RolesPage;
