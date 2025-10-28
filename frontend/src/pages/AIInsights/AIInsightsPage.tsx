import React from 'react';
import { BarChart3 } from 'lucide-react';

const AIInsightsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2" />
          AI Insights
        </h1>
        <p className="text-gray-600">AI-powered analytics and insights</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">AI insights coming soon</h3>
          <p className="text-sm">This feature is under development</p>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPage;
