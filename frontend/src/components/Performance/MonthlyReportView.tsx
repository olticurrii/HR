import React, { useState, useEffect } from 'react';
import { FileText, Calendar, TrendingUp, Target, Clock, Award, Download } from 'lucide-react';
import { performanceService } from '../../services/performanceService';

const MonthlyReportView: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceService.getMonthlyReport();
      setReport(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Monthly Performance Report
          </h2>
          <button
            onClick={generateReport}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!report && !loading && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No Report Generated</p>
            <p className="text-sm mt-2">Click "Generate Report" to create the monthly summary</p>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Report Period */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Report Period:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {formatDate(report.report_period.start)} - {formatDate(report.report_period.end)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Generated: {formatDate(report.generated_at)}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Objectives */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Total Objectives</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">
                      {report.summary.total_objectives}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              {/* Active Objectives */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Active Objectives</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">
                      {report.summary.active_objectives}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">Pending Approvals</p>
                    <p className="text-3xl font-bold text-yellow-900 mt-1">
                      {report.summary.pending_approvals}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 font-medium">Top Performers</p>
                    <p className="text-3xl font-bold text-purple-900 mt-1">
                      {report.summary.top_performers_count}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-xs text-purple-600 mt-2">
                  ≥{report.summary.top_performer_threshold}% threshold
                </p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Average Progress</h3>
                <div className="flex items-end">
                  <span className="text-2xl font-bold text-gray-900">
                    {report.summary.average_progress.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(report.summary.average_progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Goals Created Last Month</h3>
                <div className="flex items-end">
                  <span className="text-2xl font-bold text-gray-900">
                    {report.summary.goals_created_last_month}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">new goals</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReportView;

