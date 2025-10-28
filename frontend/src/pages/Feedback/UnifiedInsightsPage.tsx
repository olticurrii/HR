/**
 * Unified Feedback Insights Dashboard
 * Combines all insights features: analytics, trends, keywords, forecasting, and recipients
 */
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  MessageCircle,
  Tag,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { feedbackService, FeedbackInsights } from '../../services/feedbackService';
import {
  insightsService,
  InsightsSummary,
  ForecastResponse,
  KeywordsBySentiment,
} from '../../services/insightsService';

const UnifiedInsightsPage: React.FC = () => {
  // Basic insights
  const [insights, setInsights] = useState<FeedbackInsights | null>(null);
  
  // Advanced insights
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
      const [basicData, summaryData, countForecast, sentimentForecast, keywordsSent] = await Promise.all([
        feedbackService.getInsights(windowDays),
        insightsService.getSummary(windowDays),
        insightsService.getForecast('feedback_count', 90, forecastWeeks),
        insightsService.getForecast('sentiment_avg', 90, forecastWeeks),
        insightsService.getKeywordsBySentiment(windowDays, 10),
      ]);

      setInsights(basicData);
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
      await insightsService.computeAggregates(90);
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

  if (loading && !insights) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading comprehensive insights...</span>
        </div>
      </div>
    );
  }

  if (error && !insights) {
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

  if (!insights) return null;

  const sentimentData = [
    { name: 'Positive', value: insights.sentiment.positive, color: '#10B981' },
    { name: 'Neutral', value: insights.sentiment.neutral, color: '#6B7280' },
    { name: 'Negative', value: insights.sentiment.negative, color: '#EF4444' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            Comprehensive Feedback Insights
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Analytics, trends, predictions, and detailed breakdowns
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last year</option>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Feedback */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Feedback</p>
              <p className="text-3xl font-medium text-gray-900 mt-1">{insights.total_feedback}</p>
              {summary && (
                <p className="text-xs text-gray-500 mt-1">
                  Avg {summary.avg_daily_feedback}/day
                </p>
              )}
            </div>
            <MessageCircle className="w-10 h-10 text-indigo-600" />
          </div>
          {summary && (
            <div className="mt-3 flex items-center">
              {getTrendIcon(summary.trend.direction)}
              <span className={`text-sm font-medium ml-2 ${getTrendColor(summary.trend.direction)}`}>
                {summary.trend.change_pct > 0 ? '+' : ''}{summary.trend.change_pct}%
              </span>
            </div>
          )}
        </div>

        {/* Positive Feedback */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Positive</p>
              <p className="text-3xl font-medium text-green-600 mt-1">
                {insights.sentiment.positive_pct}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {insights.sentiment.positive} feedbacks
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </div>

        {/* Neutral Feedback */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Neutral</p>
              <p className="text-3xl font-medium text-gray-600 mt-1">
                {insights.sentiment.neutral_pct}%
              </p>
              <p className="text-xs text-gray-500 mt-1">{insights.sentiment.neutral} feedbacks</p>
            </div>
            <Minus className="w-10 h-10 text-gray-500" />
          </div>
        </div>

        {/* Negative Feedback */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Negative</p>
              <p className="text-3xl font-medium text-red-600 mt-1">
                {insights.sentiment.negative_pct}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {insights.sentiment.negative} feedbacks
              </p>
            </div>
            <TrendingDown className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Forecasts Section */}
      {forecastCount && forecastSentiment && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volume Forecast */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              📈 Feedback Volume Forecast
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

          {/* Sentiment Forecast */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              😊 Sentiment Score Forecast
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
        </div>
      )}

      {/* Historical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution Pie */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Sentiment Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Feedback Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Feedback Trend Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={insights.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Feedback Count"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Keywords Section */}
      {keywordsBySentiment && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            🏷️ Top Keywords by Sentiment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Positive Keywords */}
            <div>
              <h3 className="text-sm font-medium text-green-700 mb-3">
                ✅ Positive ({keywordsBySentiment.positive.length})
              </h3>
              <div className="space-y-2">
                {keywordsBySentiment.positive.slice(0, 10).map((kw, idx) => (
                  <div key={idx} className="group hover:bg-green-50 p-2 rounded transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{kw.keyword}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                        {kw.frequency}
                      </span>
                    </div>
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
                ➖ Neutral ({keywordsBySentiment.neutral.length})
              </h3>
              <div className="space-y-2">
                {keywordsBySentiment.neutral.slice(0, 10).map((kw, idx) => (
                  <div key={idx} className="group hover:bg-gray-50 p-2 rounded transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{kw.keyword}</span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-medium">
                        {kw.frequency}
                      </span>
                    </div>
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
                ❌ Negative ({keywordsBySentiment.negative.length})
              </h3>
              <div className="space-y-2">
                {keywordsBySentiment.negative.slice(0, 10).map((kw, idx) => (
                  <div key={idx} className="group hover:bg-red-50 p-2 rounded transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{kw.keyword}</span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                        {kw.frequency}
                      </span>
                    </div>
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

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Keywords Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Top Keywords (All Sentiments)
          </h2>
          {insights.keywords.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No keywords data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insights.keywords.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="term" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" name="Mentions" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Average Sentiment Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Average Sentiment Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={insights.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[-1, 1]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avg_sentiment"
                stroke="#10B981"
                strokeWidth={2}
                name="Avg Sentiment"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Scale: -1 (most negative) to +1 (most positive)
          </div>
        </div>
      </div>

      {/* Top Recipients Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Top Feedback Recipients
        </h2>
        {insights.recipients.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No recipients data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {insights.recipients.map((recipient, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {recipient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          recipient.recipient_type === 'USER'
                            ? 'bg-blue-100 text-blue-800'
                            : recipient.recipient_type === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {recipient.recipient_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {recipient.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((recipient.count / insights.total_feedback) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedInsightsPage;

