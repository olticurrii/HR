import React, { useState, useEffect } from 'react';
import { Shield, Save, AlertCircle, CheckCircle, Eye, Edit, Plus, Trash } from 'lucide-react';
import { permissionService, RolePermission } from '../../services/permissionService';

const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [roles, setRoles] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [changes, setChanges] = useState<Map<string, RolePermission>>(new Map());

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
      
      // Convert Map to Array for iteration
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

      showMessage('success', `Successfully updated ${changes.size} permission(s)`);
      setChanges(new Map());
      await fetchPermissions(selectedRole);
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      showMessage('error', error.response?.data?.detail || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResourceIcon = (resource: string) => {
    // Return appropriate icon based on resource type
    return <Shield className="w-4 h-4" />;
  };

  if (loading && permissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-gray-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Permission Management
            </h1>
            <p className="mt-2 text-gray-600">
              Control viewing and editing access for each role
            </p>
          </div>
          {changes.size > 0 && (
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : `Save Changes (${changes.size})`}
            </button>
          )}
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Role Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  selectedRole === role
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getRoleBadgeColor(role)}`}>
                  {role}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  View
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-2">
                  <Trash className="w-4 h-4" />
                  Delete
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {permissions.map((permission) => {
              const key = `${permission.role}-${permission.resource}`;
              const hasChanges = changes.has(key);
              
              return (
                <tr key={permission.id} className={hasChanges ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {getResourceIcon(permission.resource)}
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {permission.resource}
                      </span>
                      {hasChanges && (
                        <span className="text-xs text-yellow-600 font-medium">Modified</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={permission.can_view}
                      onChange={(e) => handlePermissionChange(permission, 'can_view', e.target.checked)}
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={permission.can_create}
                      onChange={(e) => handlePermissionChange(permission, 'can_create', e.target.checked)}
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={permission.can_edit}
                      onChange={(e) => handlePermissionChange(permission, 'can_edit', e.target.checked)}
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={permission.can_delete}
                      onChange={(e) => handlePermissionChange(permission, 'can_delete', e.target.checked)}
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-primary-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Permission Actions:</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span><strong>View:</strong> Can see the resource</span>
          </div>
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span><strong>Create:</strong> Can create new items</span>
          </div>
          <div className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            <span><strong>Edit:</strong> Can modify existing items</span>
          </div>
          <div className="flex items-center gap-2">
            <Trash className="w-4 h-4" />
            <span><strong>Delete:</strong> Can remove items</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage;

