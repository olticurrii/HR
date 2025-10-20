import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeProfileService, ProfileHeader } from '../../services/employeeProfileService';
import { PersonalTab } from '../../components/EmployeeProfile/PersonalTab';
import { JobTab } from '../../components/EmployeeProfile/JobTab';
import { PerformanceTab } from '../../components/EmployeeProfile/PerformanceTab';
import { WorkflowsTab } from '../../components/EmployeeProfile/WorkflowsTab';
import { useAuth } from '../../contexts/AuthContext';

type TabType = 'Personal' | 'Job' | 'Compensation' | 'Time off' | 'Performance' | 'Time' | 'Workflows' | 'More';

const EmployeeProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('Personal');
  const [prevUserId, setPrevUserId] = useState<number | null>(null);
  const [nextUserId, setNextUserId] = useState<number | null>(null);

  const userIdNum = userId ? parseInt(userId, 10) : currentUser?.id || 0;

  const tabs: TabType[] = ['Personal', 'Job', 'Compensation', 'Time off', 'Performance', 'Time', 'Workflows', 'More'];

  useEffect(() => {
    loadProfileData();
  }, [userIdNum]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [headerData, neighbors] = await Promise.all([
        employeeProfileService.getProfileHeader(userIdNum),
        employeeProfileService.getNeighbors(userIdNum)
      ]);
      setProfile(headerData);
      setPrevUserId(neighbors.prev_user_id || null);
      setNextUserId(neighbors.next_user_id || null);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevNext = (targetUserId: number | null) => {
    if (targetUserId) {
      navigate(`/people/${targetUserId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Profile not found</div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Personal':
        return <PersonalTab userId={userIdNum} />;
      case 'Job':
        return <JobTab userId={userIdNum} />;
      case 'Compensation':
        return <div className="p-6 text-gray-500">Compensation information (coming soon)</div>;
      case 'Time off':
        return <div className="p-6 text-gray-500">Time off information (coming soon)</div>;
      case 'Performance':
        return <PerformanceTab userId={userIdNum} />;
      case 'Time':
        return <div className="p-6 text-gray-500">Time tracking information (coming soon)</div>;
      case 'Workflows':
        return <WorkflowsTab userId={userIdNum} />;
      case 'More':
        return <div className="p-6 text-gray-500">Additional information (coming soon)</div>;
      default:
        return null;
    }
  };

  const avatarUrl = profile.avatar_url 
    ? (profile.avatar_url.startsWith('http') 
        ? profile.avatar_url 
        : `http://localhost:8000${profile.avatar_url}`)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={profile.full_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                    {profile.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${profile.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-lg text-gray-600">{profile.job_role || 'No Role'}</span>
                  {profile.department_name && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{profile.department_name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation & Actions */}
            <div className="flex items-center gap-3">
              {/* Prev/Next Buttons */}
              <button
                onClick={() => handlePrevNext(prevUserId)}
                disabled={!prevUserId}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Previous employee"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => handlePrevNext(nextUserId)}
                disabled={!nextUserId}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Next employee"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Actions Menu (admin only) */}
              {currentUser?.is_admin && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                  Actions ▾
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
