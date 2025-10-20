import React, { useState } from 'react';
import { UserProfile, ProfileUpdate } from '../../services/profileService';

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
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System Default' },
];

const PreferencesCard: React.FC<PreferencesCardProps> = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    timezone: profile.timezone || 'UTC',
    locale: profile.locale || 'en',
    theme: profile.theme || 'light',
    email_notifications: profile.email_notifications !== false,
  });
  const [hasChanges, setHasChanges] = useState(false);

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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Preferences</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Used for displaying dates and times
          </p>
        </div>

        {/* Locale */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={formData.locale}
            onChange={(e) => handleChange('locale', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {LOCALES.map((locale) => (
              <option key={locale.value} value={locale.value}>
                {locale.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Preferred language for the interface
          </p>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((theme) => (
              <button
                key={theme.value}
                type="button"
                onClick={() => handleChange('theme', theme.value)}
                className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                  formData.theme === theme.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Notifications
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.email_notifications}
                onChange={(e) => handleChange('email_notifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Email notifications
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Receive email updates about tasks, messages, and important events
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Preferences
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        )}
      </form>

      {!hasChanges && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">✓ All preferences saved</p>
        </div>
      )}
    </div>
  );
};

export default PreferencesCard;

