import React, { useState, useEffect } from 'react';
import { employeeProfileService, PersonalInfo } from '../../services/employeeProfileService';
import { useAuth } from '../../contexts/AuthContext';

interface PersonalTabProps {
  userId: number;
}

export const PersonalTab: React.FC<PersonalTabProps> = ({ userId }) => {
  const { user: currentUser } = useAuth();
  const [data, setData] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PersonalInfo>>({});

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const info = await employeeProfileService.getPersonalInfo(userId);
      setData(info);
      setFormData({ phone: info.phone, avatar_url: info.avatar_url });
    } catch (error) {
      console.error('Error loading personal info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updated = await employeeProfileService.updatePersonalInfo(userId, formData);
      setData(updated);
      setEditing(false);
    } catch (error) {
      console.error('Error updating personal info:', error);
      alert('Failed to update personal information');
    }
  };

  const canEdit = currentUser?.is_admin || currentUser?.id === userId;

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!data) {
    return <div className="p-6 text-red-500">Failed to load personal information</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-gray-900">Personal Information</h2>
        {canEdit && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Edit
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
          <div className="text-lg text-gray-900">{data.full_name}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
          <div className="text-lg text-gray-900">{data.email}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Phone</label>
          {editing ? (
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter phone number"
            />
          ) : (
            <div className="text-lg text-gray-900">{data.phone || 'Not provided'}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Avatar URL</label>
          {editing ? (
            <input
              type="url"
              value={formData.avatar_url || ''}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter avatar URL"
            />
          ) : (
            <div className="text-lg text-gray-900">{data.avatar_url || 'Not provided'}</div>
          )}
        </div>

        {editing && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData({ phone: data.phone, avatar_url: data.avatar_url });
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

