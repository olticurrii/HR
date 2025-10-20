import React, { useState, useRef } from 'react';
import { UserProfile, ProfileUpdate } from '../../services/profileService';
import API_BASE_URL from '../../config';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-6">
        <div
          className={`relative group cursor-pointer ${isDragging ? 'ring-4 ring-blue-400' : ''}`}
          onClick={handleAvatarClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl text-gray-400">
                {profile.full_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-sm">Change Photo</span>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <p className="text-sm text-gray-500 mt-2">
          Click or drag to upload new avatar
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                isEditing ? 'bg-white' : 'bg-gray-50'
              }`}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                isEditing ? 'bg-white' : 'bg-gray-50'
              }`}
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              value={formData.job_role}
              onChange={(e) =>
                setFormData({ ...formData, job_role: e.target.value })
              }
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                isEditing ? 'bg-white' : 'bg-gray-50'
              }`}
            />
          </div>

          {/* Department (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              value={profile.department_name || 'Not assigned'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          {/* Role (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              value={profile.role}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileInfoCard;

