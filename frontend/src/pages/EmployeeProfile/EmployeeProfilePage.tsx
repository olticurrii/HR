import React from 'react';
import { User } from 'lucide-react';

const EmployeeProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <User className="w-6 h-6 mr-2" />
          Employee Profile
        </h1>
        <p className="text-gray-600">View employee details and information</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Employee profile coming soon</h3>
          <p className="text-sm">This feature is under development</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
