import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, UserPlus, Trash2, X, AlertCircle, CheckCircle, ChevronDown, Users } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import TRAXCIS_COLORS from '../../theme/traxcis';

interface User {
  id: number;
  email: string;
  full_name: string;
  job_role?: string;
  department_id?: number;
  role: string;
  is_active: boolean;
  is_admin: boolean;
}

const RoleManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'employee',
    job_role: '',
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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createUser({
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role: formData.role,
        job_role: formData.job_role || undefined,
      });
      setShowCreateModal(false);
      setFormData({ email: '', full_name: '', password: '', role: 'employee', job_role: '' });
      toast.success('User created successfully');
      setSuccess('User created successfully');
      setTimeout(() => setSuccess(null), 5000);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create user');
      toast.error('Failed to create user');
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      toast.success('Role updated successfully');
      setSuccess('Role updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update role');
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await adminService.deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      toast.success('User deleted successfully');
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(null), 5000);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
      toast.error('Failed to delete user');
    }
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
            User & Role Management
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', marginTop: '8px', fontSize: '15px' }}>
            Manage users, assign roles, and control permissions
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
          <p style={{ color: subTextColor, fontSize: '14px' }}>Loading users...</p>
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
            User & Role Management
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', fontSize: '15px' }}>
            Manage users, assign roles, and control permissions
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
          <UserPlus style={{ width: '18px', height: '18px' }} />
          Add User
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
          { label: 'Total Users', value: users.length, color: TRAXCIS_COLORS.primary.DEFAULT },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#EF4444' },
          { label: 'Managers', value: users.filter(u => u.role === 'manager').length, color: TRAXCIS_COLORS.accent.DEFAULT },
          { label: 'Employees', value: users.filter(u => u.role === 'employee').length, color: '#10B981' },
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
              <Users style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
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

      {/* Users Table */}
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
                  User
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
                  Job Role
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
                  System Role
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
                  Status
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
              {users.map((user, index) => (
                <motion.tr
                  key={user.id}
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
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: textColor,
                        marginBottom: '2px',
                      }}>
                        {user.full_name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: subTextColor,
                      }}>
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: '14px', color: textColor }}>
                      {user.job_role || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        disabled={user.id === currentUser?.id}
                        style={{
                          appearance: 'none',
                          fontSize: '12px',
                          padding: '6px 28px 6px 12px',
                          borderRadius: '9999px',
                          backgroundColor: getRoleBadgeColors(user.role).bg,
                          color: getRoleBadgeColors(user.role).text,
                          border: `1px solid ${getRoleBadgeColors(user.role).border}`,
                          fontWeight: '500',
                          textTransform: 'capitalize',
                          cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer',
                          opacity: user.id === currentUser?.id ? 0.5 : 1,
                          fontFamily: "'Outfit', sans-serif",
                        }}
                        onFocus={(e) => {
                          if (user.id !== currentUser?.id) {
                            e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
                            e.target.style.outlineOffset = '2px';
                          }
                        }}
                        onBlur={(e) => {
                          e.target.style.outline = 'none';
                        }}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                      </select>
                      <ChevronDown style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '14px',
                        height: '14px',
                        color: getRoleBadgeColors(user.role).text,
                        pointerEvents: 'none',
                      }} />
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      backgroundColor: user.is_active
                        ? (isDark ? '#064E3B' : '#D1FAE5')
                        : (isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100]),
                      color: user.is_active
                        ? (isDark ? '#6EE7B7' : '#065F46')
                        : subTextColor,
                      border: `1px solid ${user.is_active
                        ? (isDark ? '#065F46' : '#A7F3D0')
                        : cardBorder}`,
                      fontWeight: '500',
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                      }}
                      disabled={user.id === currentUser?.id}
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer',
                        borderRadius: '6px',
                        color: TRAXCIS_COLORS.status.error,
                        opacity: user.id === currentUser?.id ? 0.5 : 1,
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (user.id !== currentUser?.id) {
                          e.currentTarget.style.backgroundColor = isDark ? '#7C2D12' : '#FEE2E2';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Delete user"
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </td>
                </motion.tr>
              ))}
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
          Showing {users.length} user{users.length !== 1 ? 's' : ''} total
        </div>
      </motion.div>

      {/* Create User Modal */}
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
            onClick={() => setShowCreateModal(false)}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: textColor,
                }}>
                  Create New User
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: subTextColor,
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = textColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = subTextColor}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
              
              <form onSubmit={handleCreateUser}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: textColor,
                      marginBottom: '6px',
                    }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                      minLength={6}
                    />
                    <p style={{ fontSize: '12px', color: subTextColor, marginTop: '4px' }}>
                      Minimum 6 characters
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
                      System Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: textColor,
                      marginBottom: '6px',
                    }}>
                      Job Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.job_role}
                      onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                      placeholder="e.g., Software Engineer"
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
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
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
            onClick={() => setShowDeleteModal(false)}
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
                Delete User
              </h3>
              
              <p style={{
                fontSize: '14px',
                color: subTextColor,
                textAlign: 'center',
                marginBottom: '24px',
              }}>
                Are you sure you want to delete <strong style={{ color: textColor }}>{selectedUser.full_name}</strong>? 
                This action cannot be undone.
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowDeleteModal(false)}
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
                  onClick={handleDeleteUser}
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
                  Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleManagementPage;
