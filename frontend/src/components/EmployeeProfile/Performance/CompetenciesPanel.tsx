import React, { useState, useEffect } from 'react';
import { employeeProfileService, CompetencyRadarData } from '../../../services/employeeProfileService';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';

interface CompetenciesPanelProps {
  userId: number;
}

export const CompetenciesPanel: React.FC<CompetenciesPanelProps> = ({ userId }) => {
  const [competencies, setCompetencies] = useState<CompetencyRadarData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompetencies();
  }, [userId]);

  const loadCompetencies = async () => {
    try {
      setLoading(true);
      const data = await employeeProfileService.getCompetencies(userId);
      setCompetencies(data);
    } catch (error) {
      console.error('Error loading competencies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">Loading competencies...</div>;
  }

  if (competencies.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">No competency data available</p>
      </div>
    );
  }

  // Transform data for radar chart
  const radarData = competencies.map(comp => ({
    competency: comp.competency_name.length > 15 
      ? comp.competency_name.substring(0, 15) + '...' 
      : comp.competency_name,
    Self: comp.self_score || 0,
    Manager: comp.manager_score || 0,
    Peer: comp.peer_score || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Competency Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="competency" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 5]} 
              tick={{ fill: '#6b7280' }}
            />
            <Radar
              name="Self"
              dataKey="Self"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Manager"
              dataKey="Manager"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Peer"
              dataKey="Peer"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Competency Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Detailed Scores</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Competency
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Self
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Peer
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Average
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {competencies.map((comp) => {
                const scores = [comp.self_score, comp.manager_score, comp.peer_score].filter(s => s !== null && s !== undefined) as number[];
                const average = scores.length > 0 
                  ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
                  : 'N/A';

                return (
                  <tr key={comp.competency_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {comp.competency_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-800 font-bold">
                        {comp.self_score?.toFixed(1) || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-800 font-bold">
                        {comp.manager_score?.toFixed(1) || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-800 font-bold">
                        {comp.peer_score?.toFixed(1) || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-800 font-bold text-base">
                        {average}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

