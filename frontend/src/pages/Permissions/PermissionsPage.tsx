import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Save, AlertCircle, CheckCircle, Eye, Edit, Plus, Trash } from 'lucide-react';
import { permissionService, RolePermission } from '../../services/permissionService';
import toast from 'react-hot-toast';
import TRAXCIS_COLORS from '../../theme/traxcis';

const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [roles, setRoles] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [changes, setChanges] = useState<Map<string, RolePermission>>(new Map());
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

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchPermissions(selectedRole);
    }
  }, [selectedRole]);

  const fetchInitialData = async () => {
    try {
      const [rolesData, resourcesData] = await Promise.all([
        permissionService.getAvailableRoles(),
        permissionService.getAvailableResources(),
      ]);
      setRoles(rolesData);
      setResources(resourcesData);
      if (rolesData.length > 0) {
        setSelectedRole(rolesData[0]);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      showMessage('error', 'Failed to load permission data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async (role: string) => {
    try {
      setLoading(true);
      const data = await permissionService.getAllPermissions(role);
      setPermissions(data);
      setChanges(new Map());
    } catch (error) {
      console.error('Error fetching permissions:', error);
      showMessage('error', 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: RolePermission, field: keyof RolePermission, value: boolean) => {
    const updated = { ...permission, [field]: value };
    const key = `${permission.role}-${permission.resource}`;
    const newChanges = new Map(changes);
    newChanges.set(key, updated);
    setChanges(newChanges);

    // Update UI immediately
    setPermissions(prevPermissions =>
      prevPermissions.map(p =>
        p.id === permission.id ? updated : p
      )
    );
  };

  const handleSaveChanges = async () => {
    if (changes.size === 0) {
      showMessage('error', 'No changes to save');
      return;
    }

    try {
      setSaving(true);
      
      const changesList = Array.from(changes.values());
      
      for (const permission of changesList) {
        await permissionService.updatePermission(
          permission.role,
          permission.resource,
          {
            can_view: permission.can_view,
            can_create: permission.can_create,
            can_edit: permission.can_edit,
            can_delete: permission.can_delete,
          }
        );
      }

      toast.success(`Successfully updated ${changes.size} permission(s)`);
      showMessage('success', `Successfully updated ${changes.size} permission(s)`);
      setChanges(new Map());
      await fetchPermissions(selectedRole);
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to save permissions';
      showMessage('error', errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const getRoleBadgeColors = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return {
          bg: isDark ? '#7C2D12' : '#FEE2E2',
          text: isDark ? '#FCA5A5' : '#991B1B',
          border: isDark ? '#991B1B' : '#FECACA',
        };
      case 'manager':
        return {
          bg: isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50],
          text: TRAXCIS_COLORS.primary.DEFAULT,
          border: isDark ? TRAXCIS_COLORS.primary[700] : TRAXCIS_COLORS.primary[200],
        };
      case 'employee':
        return {
          bg: isDark ? '#064E3B' : '#D1FAE5',
          text: isDark ? '#6EE7B7' : '#065F46',
          border: isDark ? '#065F46' : '#A7F3D0',
        };
      default:
        return {
          bg: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100],
          text: isDark ? TRAXCIS_COLORS.secondary[300] : TRAXCIS_COLORS.secondary[600],
          border: isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200],
        };
    }
  };

  // Theme colors
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const tableBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const tableHeaderBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const tableRowHoverBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const tabContainerBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const tabBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const inactiveText = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const hoverBg = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[100];
  const legendBg = isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50];
  const legendBorder = isDark ? TRAXCIS_COLORS.primary[700] : TRAXCIS_COLORS.primary[200];
  const legendText = isDark ? TRAXCIS_COLORS.primary[100] : TRAXCIS_COLORS.primary[900];

  if (loading && permissions.length === 0) {
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
            Permission Management
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', marginTop: '8px', fontSize: '15px' }}>
            Control viewing and editing access for each role
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
          <p style={{ color: subTextColor, fontSize: '14px' }}>Loading permissions...</p>
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
            Permission Management
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', fontSize: '15px' }}>
            Control viewing and editing access for each role
          </p>
        </div>
        
        {changes.size > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveChanges}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: saving ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.accent.DEFAULT,
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.accent[600];
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.accent.DEFAULT;
              }
            }}
          >
            <Save style={{ width: '18px', height: '18px' }} />
            {saving ? 'Saving...' : `Save Changes (${changes.size})`}
          </motion.button>
        )}
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              backgroundColor: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
              border: message.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA',
              color: message.type === 'success' ? '#065F46' : '#991B1B',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
            }}
          >
            {message.type === 'success' ? (
              <CheckCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            ) : (
              <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            )}
            <span style={{ flex: 1 }}>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: tabContainerBg,
          borderRadius: '16px',
          padding: '8px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${tabBorder}`,
        }}
      >
        <nav style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }} role="tablist">
          {roles.map((role) => {
            const isActive = selectedRole === role;
            const badgeColors = getRoleBadgeColors(role);
            
            return (
              <motion.button
                key={role}
                onClick={() => setSelectedRole(role)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: '500',
                  fontSize: '14px',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? TRAXCIS_COLORS.accent.DEFAULT : 'transparent',
                  color: isActive ? '#FFFFFF' : inactiveText,
                  boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                  textTransform: 'capitalize',
                }}
                whileHover={{ scale: isActive ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = TRAXCIS_COLORS.accent.DEFAULT;
                    e.currentTarget.style.backgroundColor = hoverBg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = inactiveText;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                role="tab"
                aria-selected={isActive}
              >
                <Shield style={{ width: '16px', height: '16px' }} />
                <span>{role}</span>
              </motion.button>
            );
          })}
        </nav>
      </motion.div>

      {/* Permissions Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
                  Resource
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: subTextColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Eye style={{ width: '14px', height: '14px' }} />
                    View
                  </div>
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: subTextColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Plus style={{ width: '14px', height: '14px' }} />
                    Create
                  </div>
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: subTextColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Edit style={{ width: '14px', height: '14px' }} />
                    Edit
                  </div>
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: subTextColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Trash style={{ width: '14px', height: '14px' }} />
                    Delete
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission, index) => {
                const key = `${permission.role}-${permission.resource}`;
                const hasChanges = changes.has(key);
                
                return (
                  <motion.tr
                    key={permission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      borderBottom: `1px solid ${cardBorder}`,
                      backgroundColor: hasChanges 
                        ? (isDark ? '#854D0E' : '#FEF3C7')
                        : 'transparent',
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      if (!hasChanges) {
                        e.currentTarget.style.backgroundColor = tableRowHoverBg;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!hasChanges) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield style={{ width: '16px', height: '16px', color: subTextColor }} />
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: textColor,
                          textTransform: 'capitalize',
                        }}>
                          {permission.resource}
                        </span>
                        {hasChanges && (
                          <span style={{
                            fontSize: '11px',
                            color: isDark ? '#FCD34D' : '#92400E',
                            fontWeight: '600',
                            padding: '2px 6px',
                            backgroundColor: isDark ? '#78350F' : '#FDE68A',
                            borderRadius: '4px',
                          }}>
                            Modified
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={permission.can_view}
                        onChange={(e) => handlePermissionChange(permission, 'can_view', e.target.checked)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: TRAXCIS_COLORS.primary.DEFAULT,
                        }}
                      />
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={permission.can_create}
                        onChange={(e) => handlePermissionChange(permission, 'can_create', e.target.checked)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: TRAXCIS_COLORS.primary.DEFAULT,
                        }}
                      />
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={permission.can_edit}
                        onChange={(e) => handlePermissionChange(permission, 'can_edit', e.target.checked)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: TRAXCIS_COLORS.primary.DEFAULT,
                        }}
                      />
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={permission.can_delete}
                        onChange={(e) => handlePermissionChange(permission, 'can_delete', e.target.checked)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: TRAXCIS_COLORS.status.error,
                        }}
                      />
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
          Showing {permissions.length} permission{permissions.length !== 1 ? 's' : ''} for <span style={{ 
            fontWeight: '600', 
            color: textColor,
            textTransform: 'capitalize',
          }}>{selectedRole}</span> role
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          backgroundColor: legendBg,
          border: `1px solid ${legendBorder}`,
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: legendText,
          marginBottom: '12px',
        }}>
          Permission Actions
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          fontSize: '14px',
          color: legendText,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              backgroundColor: isDark ? TRAXCIS_COLORS.primary[800] : '#FFFFFF',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Eye style={{ width: '14px', height: '14px', color: TRAXCIS_COLORS.primary.DEFAULT }} />
            </div>
            <div>
              <strong>View:</strong> Can see the resource
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              backgroundColor: isDark ? TRAXCIS_COLORS.primary[800] : '#FFFFFF',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Plus style={{ width: '14px', height: '14px', color: TRAXCIS_COLORS.primary.DEFAULT }} />
            </div>
            <div>
              <strong>Create:</strong> Can create new items
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              backgroundColor: isDark ? TRAXCIS_COLORS.primary[800] : '#FFFFFF',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Edit style={{ width: '14px', height: '14px', color: TRAXCIS_COLORS.primary.DEFAULT }} />
            </div>
            <div>
              <strong>Edit:</strong> Can modify existing items
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              backgroundColor: isDark ? '#7C2D12' : '#FFFFFF',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Trash style={{ width: '14px', height: '14px', color: TRAXCIS_COLORS.status.error }} />
            </div>
            <div>
              <strong>Delete:</strong> Can remove items
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PermissionsPage;
