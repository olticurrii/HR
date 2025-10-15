import React from 'react';
import { Settings } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          Settings
        </h1>
        <p className="text-gray-600">Configure system settings and preferences</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Settings management coming soon</h3>
          <p className="text-sm">This feature is under development</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
