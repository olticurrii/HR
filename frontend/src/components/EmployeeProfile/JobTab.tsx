import React, { useState, useEffect } from 'react';
import { employeeProfileService, JobInfo } from '../../services/employeeProfileService';
import { useNavigate } from 'react-router-dom';

interface JobTabProps {
  userId: number;
}

export const JobTab: React.FC<JobTabProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<JobInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const info = await employeeProfileService.getJobInfo(userId);
      setData(info);
    } catch (error) {
      console.error('Error loading job info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!data) {
    return <div className="p-6 text-red-500">Failed to load job information</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-medium text-gray-900 mb-6">Job Information</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Job Role</label>
          <div className="text-lg text-gray-900">{data.job_role || 'Not assigned'}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Department</label>
          <div className="text-lg text-gray-900">{data.department_name || 'Not assigned'}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Manager</label>
          {data.manager_id ? (
            <button
              onClick={() => navigate(`/people/${data.manager_id}`)}
              className="text-lg text-primary hover:text-blue-700 hover:underline font-medium"
            >
              {data.manager_name}
            </button>
          ) : (
            <div className="text-lg text-gray-900">No manager assigned</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Hire Date</label>
          <div className="text-lg text-gray-900">
            {data.hire_date ? new Date(data.hire_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Not available'}
          </div>
        </div>
      </div>
    </div>
  );
};

