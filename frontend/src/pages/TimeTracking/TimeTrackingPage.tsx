import React from 'react';
import { Clock } from 'lucide-react';

const TimeTrackingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Clock className="w-6 h-6 mr-2" />
          Time Tracking
        </h1>
        <p className="text-gray-600">Track your working hours and time spent on projects</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Time tracking coming soon</h3>
          <p className="text-sm">This feature is under development</p>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingPage;
