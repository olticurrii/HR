/**
 * Admin Insights Dashboard
 * Displays keyword tracking, sentiment trends, and predictive forecasts
 */
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  MessageSquare,
  RefreshCw,
  Filter,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  insightsService,
  InsightsSummary,
  ForecastResponse,
  KeywordsBySentiment,
  Keyword,
} from '../../services/insightsService';

const InsightsPage: React.FC = () => {
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [forecastCount, setForecastCount] = useState<ForecastResponse | null>(null);
  const [forecastSentiment, setForecastSentiment] = useState<ForecastResponse | null>(null);
  const [keywordsBySentiment, setKeywordsBySentiment] = useState<KeywordsBySentiment | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const [windowDays, setWindowDays] = useState(30);
  const [forecastWeeks, setForecastWeeks] = useState(4);

  useEffect(() => {
    loadAllData();
  }, [windowDays, forecastWeeks]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [summaryData, countForecast, sentimentForecast, keywordsSent] = await Promise.all([
        insightsService.getSummary(windowDays),
        insightsService.getForecast('feedback_count', 90, forecastWeeks),
        insightsService.getForecast('sentiment_avg', 90, forecastWeeks),
        insightsService.getKeywordsBySentiment(windowDays, 10),
      ]);

      setSummary(summaryData);
      setForecastCount(countForecast);
      setForecastSentiment(sentimentForecast);
      setKeywordsBySentiment(keywordsSent);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load insights data');
      console.error('Error loading insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Trigger aggregate computation
      await insightsService.computeAggregates(90);
      // Reload data
      await loadAllData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const getTrendIcon = (direction: string) => {
    if (direction === 'increasing') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (direction === 'decreasing') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getTrendColor = (direction: string) => {
    if (direction === 'increasing') return 'text-green-600';
    if (direction === 'decreasing') return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Insights</h1>
          <p className="text-sm text-gray-600 mt-1">
            Analytics, trends, and predictions for feedback data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Window selector */}
          <select
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Feedback */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Feedback</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary.total_feedback}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg {summary.avg_daily_feedback}/day
                </p>
              </div>
              <MessageSquare className="w-10 h-10 text-indigo-600" />
            </div>
            <div className="mt-3 flex items-center">
              {getTrendIcon(summary.trend.direction)}
              <span className={`text-sm font-medium ml-2 ${getTrendColor(summary.trend.direction)}`}>
                {summary.trend.change_pct > 0 ? '+' : ''}{summary.trend.change_pct}%
              </span>
            </div>
          </div>

          {/* Sentiment Score */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Sentiment</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {summary.avg_sentiment_score.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Out of 1.0</p>
              </div>
              <BarChart3 className="w-10 h-10 text-green-600" />
            </div>
          </div>

          {/* Positive Feedback */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Positive</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {summary.sentiment_distribution.positive}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.total_feedback > 0
                    ? Math.round((summary.sentiment_distribution.positive / summary.total_feedback) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Negative Feedback */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Negative</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {summary.sentiment_distribution.negative}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.total_feedback > 0
                    ? Math.round((summary.sentiment_distribution.negative / summary.total_feedback) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Volume Forecast */}
        {forecastCount && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Feedback Volume Forecast
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={[
                  ...forecastCount.historical.map((d) => ({ ...d, type: 'historical' })),
                  ...forecastCount.forecast.map((d) => ({ ...d, type: 'forecast' })),
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.3}
                  name="Feedback Count"
                />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="#9CA3AF"
                  fill="#E5E7EB"
                  fillOpacity={0.2}
                  name="Upper Bound"
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="#9CA3AF"
                  fill="#E5E7EB"
                  fillOpacity={0.2}
                  name="Lower Bound"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 text-sm text-gray-600">
              <p>
                Trend: <span className={`font-medium ${getTrendColor(forecastCount.trend.direction)}`}>
                  {forecastCount.trend.direction}
                </span> ({forecastCount.trend.change_pct > 0 ? '+' : ''}{forecastCount.trend.change_pct}%)
              </p>
            </div>
          </div>
        )}

        {/* Sentiment Forecast */}
        {forecastSentiment && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sentiment Score Forecast
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  ...forecastSentiment.historical.map((d) => ({ ...d, type: 'historical' })),
                  ...forecastSentiment.forecast.map((d) => ({ ...d, type: 'forecast' })),
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Sentiment Score"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke="#9CA3AF"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Upper Bound"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke="#9CA3AF"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Lower Bound"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 text-sm text-gray-600">
              <p>
                Trend: <span className={`font-medium ${getTrendColor(forecastSentiment.trend.direction)}`}>
                  {forecastSentiment.trend.direction}
                </span> ({forecastSentiment.trend.change_pct > 0 ? '+' : ''}{forecastSentiment.trend.change_pct}%)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top Keywords by Sentiment */}
      {keywordsBySentiment && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Keywords by Sentiment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Positive Keywords */}
            <div>
              <h3 className="text-sm font-medium text-green-700 mb-3">
                Positive ({keywordsBySentiment.positive.length})
              </h3>
              <div className="space-y-2">
                {keywordsBySentiment.positive.slice(0, 10).map((kw, idx) => (
                  <div key={idx} className="group hover:bg-green-50 p-2 rounded transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{kw.keyword}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                        {kw.frequency}
                      </span>
                    </div>
                    {/* Mini sparkline visualization */}
                    <div className="flex items-center space-x-1">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (kw.frequency / Math.max(...keywordsBySentiment.positive.map(k => k.frequency))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">#{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Neutral Keywords */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Neutral ({keywordsBySentiment.neutral.length})
              </h3>
              <div className="space-y-2">
                {keywordsBySentiment.neutral.slice(0, 10).map((kw, idx) => (
                  <div key={idx} className="group hover:bg-gray-50 p-2 rounded transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{kw.keyword}</span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-semibold">
                        {kw.frequency}
                      </span>
                    </div>
                    {/* Mini sparkline visualization */}
                    <div className="flex items-center space-x-1">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gray-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (kw.frequency / Math.max(...keywordsBySentiment.neutral.map(k => k.frequency))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">#{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Negative Keywords */}
            <div>
              <h3 className="text-sm font-medium text-red-700 mb-3">
                Negative ({keywordsBySentiment.negative.length})
              </h3>
              <div className="space-y-2">
                {keywordsBySentiment.negative.slice(0, 10).map((kw, idx) => (
                  <div key={idx} className="group hover:bg-red-50 p-2 rounded transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{kw.keyword}</span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold">
                        {kw.frequency}
                      </span>
                    </div>
                    {/* Mini sparkline visualization */}
                    <div className="flex items-center space-x-1">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (kw.frequency / Math.max(...keywordsBySentiment.negative.map(k => k.frequency))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">#{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Overall Keywords */}
      {summary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Keywords Overall
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {summary.top_keywords.slice(0, 20).map((kw, idx) => (
              <div
                key={idx}
                className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center"
              >
                <p className="text-sm font-medium text-gray-900">{kw.keyword}</p>
                <p className="text-xs text-gray-600 mt-1">{kw.frequency} mentions</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsPage;

