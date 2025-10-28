import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building2, Users, Edit3 } from 'lucide-react';
import { OrgChartNode } from '../../services/orgchartService';
import { Department } from '../../services/departmentService';
import toast from 'react-hot-toast';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: OrgChartNode | null;
  departments: Department[];
  onReassign: (userId: number, newManagerId?: number | null, newDepartmentId?: number | null) => Promise<void>;
  allUsers: OrgChartNode[];
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  departments,
  onReassign,
  allUsers
}) => {
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Find current manager and department
      const currentManager = allUsers.find(u => u.children?.some(child => child.id === user.id));
      setSelectedManager(currentManager?.id || '');
      setSelectedDepartment(user.department || '');
    }
  }, [user, allUsers]);

  if (!isOpen || !user) return null;

  const getAvatar = (name: string, avatarUrl?: string) => {
    if (avatarUrl) {
      return <img src={avatarUrl} alt={name} className="w-16 h-16 rounded-full object-cover" />;
    }
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-medium">
        {initials}
      </div>
    );
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await onReassign(
        parseInt(user.id),
        selectedManager ? parseInt(selectedManager) : null,
        selectedDepartment ? parseInt(selectedDepartment) : null
      );
      toast.success('Profile updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Employee Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar and Basic Info */}
          <div className="text-center">
            {getAvatar(user.name, user.avatar_url)}
            <h3 className="text-lg font-medium text-gray-900 mt-3">{user.name}</h3>
            <p className="text-gray-500">{user.title}</p>
            {user.department && (
              <div className="flex items-center justify-center text-sm text-gray-400 mt-1">
                <Building2 className="w-4 h-4 mr-1" />
                <span>{user.department}</span>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-3 text-gray-400" />
              <span>email@company.com</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-3 text-gray-400" />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>

          {/* Manager Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Manager
            </label>
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">No Manager</option>
              {allUsers
                .filter(u => u.id !== user.id) // Don't allow self-assignment
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} - {u.title}
                  </option>
                ))}
            </select>
          </div>

          {/* Department Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">No Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
