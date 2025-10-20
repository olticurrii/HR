import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Target, Clock, BarChart3, Plus, RefreshCw } from 'lucide-react';
import { performanceService } from '../../services/performanceService';

interface AutoCalculatedKpisProps {
  userId: number;
  onRecordKpi?: (kpiName: string, value: number, unit: string) => void;
}

const AutoCalculatedKpis: React.FC<AutoCalculatedKpisProps> = ({
  userId,
  onRecordKpi
}) => {
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadCalculatedKpis();
  }, [userId, days]);

  const loadCalculatedKpis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceService.getAutoCalculatedKpis(userId, days);
      setKpis(data.kpis || []);
    } catch (err) {
      console.error('Failed to calculate KPIs:', err);
      setError('Failed to calculate KPIs');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'productivity':
        return <Activity className="w-5 h-5 text-blue-500" />;
      case 'quality':
        return <Target className="w-5 h-5 text-green-500" />;
      case 'goals':
        return <Target className="w-5 h-5 text-purple-500" />;
      case 'activity':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'efficiency':
        return <BarChart3 className="w-5 h-5 text-indigo-500" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'productivity':
        return 'border-blue-200 bg-blue-50';
      case 'quality':
        return 'border-green-200 bg-green-50';
      case 'goals':
        return 'border-purple-200 bg-purple-50';
      case 'activity':
        return 'border-orange-200 bg-orange-50';
      case 'efficiency':
        return 'border-indigo-200 bg-indigo-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleRecordKpi = async (kpi: any) => {
    try {
      await performanceService.createKpiSnapshot({
        user_id: userId,
        kpi_name: kpi.kpi_name,
        value: kpi.value,
        unit: kpi.unit,
        notes: `Auto-calculated: ${kpi.description}`
      });
      
      if (onRecordKpi) {
        onRecordKpi(kpi.kpi_name, kpi.value, kpi.unit);
      }
    } catch (err) {
      console.error('Failed to record KPI:', err);
      alert('Failed to record KPI');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Period Selector */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Auto-Calculated KPIs</h3>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={loadCalculatedKpis}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {kpis.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600">No data available for calculation</p>
          <p className="text-sm text-gray-500 mt-1">
            Complete tasks and goals to generate KPI insights
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Based on your activity over the last {days} days. Click "Record" to save any KPI for trend tracking.
          </p>

          <div className="grid gap-3">
            {kpis.map((kpi, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getCategoryColor(kpi.category)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getCategoryIcon(kpi.category)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{kpi.kpi_name}</h4>
                        <span className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-600">
                          {kpi.category}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {kpi.value.toFixed(1)}
                        {kpi.unit && <span className="text-lg ml-1">{kpi.unit}</span>}
                      </p>
                      <p className="text-sm text-gray-600">{kpi.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRecordKpi(kpi)}
                    className="ml-3 px-3 py-1.5 bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-md text-sm font-medium flex items-center transition-colors"
                    title="Record this KPI snapshot"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Record
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Recording KPIs regularly helps track your performance trends over time. 
              Click "Record" on any KPI to save it as a snapshot.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoCalculatedKpis;

