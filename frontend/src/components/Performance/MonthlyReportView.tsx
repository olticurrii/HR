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

  const downloadReport = () => {
    if (!report) return;
    
    // Create downloadable content
    const reportContent = `
Performance Monthly Report
========================

Report Period: ${formatDate(report.report_period.start)} - ${formatDate(report.report_period.end)}
Generated: ${formatDate(report.generated_at)}

SUMMARY STATISTICS
-----------------
Total Objectives: ${report.summary.total_objectives}
Active Objectives: ${report.summary.active_objectives}
Average Progress: ${report.summary.average_progress.toFixed(1)}%
Goals Created Last Month: ${report.summary.goals_created_last_month}
Pending Approvals: ${report.summary.pending_approvals}
Top Performers: ${report.summary.top_performers_count} (≥${report.summary.top_performer_threshold}% threshold)

This report was generated automatically by the HR Performance Management System.
    `.trim();

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-report-${report.report_period.start}-${report.report_period.end}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary" />
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!report && !loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium">No Report Generated</p>
            <p className="text-sm mt-2">Click "Generate Report" to create the monthly summary</p>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Report Period with Download Button */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Report Period:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatDate(report.report_period.start)} - {formatDate(report.report_period.end)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Generated: {formatDate(report.generated_at)}
                  </div>
                </div>
                <button
                  onClick={downloadReport}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Objectives */}
              <div className="bg-primary-50 dark:bg-blue-900/20 rounded-lg p-4 border border-primary-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Objectives</p>
                    <p className="text-3xl font-medium text-blue-900 dark:text-blue-100 mt-1">
                      {report.summary.total_objectives}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              {/* Active Objectives */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">Active Objectives</p>
                    <p className="text-3xl font-medium text-green-900 dark:text-green-100 mt-1">
                      {report.summary.active_objectives}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Pending Approvals</p>
                    <p className="text-3xl font-medium text-yellow-900 dark:text-yellow-100 mt-1">
                      {report.summary.pending_approvals}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Top Performers</p>
                    <p className="text-3xl font-medium text-purple-900 dark:text-purple-100 mt-1">
                      {report.summary.top_performers_count}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-300 mt-2">
                  ≥{report.summary.top_performer_threshold}% threshold
                </p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Average Progress</h3>
                <div className="flex items-end">
                  <span className="text-2xl font-medium text-gray-900 dark:text-white">
                    {report.summary.average_progress.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(report.summary.average_progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goals Created Last Month</h3>
                <div className="flex items-end">
                  <span className="text-2xl font-medium text-gray-900 dark:text-white">
                    {report.summary.goals_created_last_month}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">new goals</span>
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
