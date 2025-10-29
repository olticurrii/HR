/**
 * Unified Feedback Insights Dashboard
 * Complete visual consistency with HRMS design system
 * Analytics, trends, predictions, and detailed breakdowns
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Smile,
  Meh,
  Frown,
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
import TRAXCIS_COLORS from '../../theme/traxcis';

const UnifiedInsightsPage: React.FC = () => {
  // State management
  const [insights, setInsights] = useState<FeedbackInsights | null>(null);
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [forecastCount, setForecastCount] = useState<ForecastResponse | null>(null);
  const [forecastSentiment, setForecastSentiment] = useState<ForecastResponse | null>(null);
  const [keywordsBySentiment, setKeywordsBySentiment] = useState<KeywordsBySentiment | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [windowDays, setWindowDays] = useState(30);
  const [forecastWeeks, setForecastWeeks] = useState(4);
  const [isDark, setIsDark] = useState(false);

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  // Data loading
  useEffect(() => {
    loadAllData();
  }, [windowDays, forecastWeeks]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

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

  // Utility functions
  const getTrendIcon = (direction: string) => {
    if (direction === 'increasing') return <TrendingUp className="w-4 h-4" />;
    if (direction === 'decreasing') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (direction: string) => {
    if (direction === 'increasing') return 'text-green-600 dark:text-green-400';
    if (direction === 'decreasing') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  // Theme colors
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];

  // Loading state
  if (loading && !insights) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRight: `3px solid ${cardBorder}`,
                borderBottom: `3px solid ${cardBorder}`,
                borderLeft: `3px solid ${cardBorder}`,
                borderTop: `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ color: subTextColor, fontSize: '14px' }}>Loading comprehensive insights...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !insights) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
      >
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">Error Loading Data</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!insights) return null;

  const sentimentData = [
    { name: 'Positive', value: insights.sentiment.positive, color: TRAXCIS_COLORS.status.success },
    { name: 'Neutral', value: insights.sentiment.neutral, color: TRAXCIS_COLORS.status.warning },
    { name: 'Negative', value: insights.sentiment.negative, color: TRAXCIS_COLORS.status.error },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 
            className="text-2xl font-semibold flex items-center gap-2"
            style={{ color: textColor, fontFamily: "'Inter', 'Outfit', sans-serif" }}
          >
            <BarChart3 className="w-7 h-7" style={{ color: TRAXCIS_COLORS.primary.DEFAULT }} />
            Comprehensive Feedback Insights
          </h1>
          <p style={{ color: subTextColor }} className="text-sm mt-1">
            Analytics, trends, predictions, and detailed breakdowns
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value))}
            style={{
              backgroundColor: cardBg,
              borderColor: cardBorder,
              color: textColor,
            }}
            className="px-4 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last year</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ backgroundColor: TRAXCIS_COLORS.primary.DEFAULT }}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </motion.button>
        </div>
      </motion.div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: cardBg,
            borderColor: cardBorder,
          }}
          className="border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p style={{ color: subTextColor }} className="text-sm font-medium">Total Feedback</p>
              <p style={{ color: textColor }} className="text-3xl font-bold mt-2">
                {insights.total_feedback}
              </p>
              {summary && (
                <p style={{ color: subTextColor }} className="text-xs mt-2">
                  Avg {summary.avg_daily_feedback}/day
                </p>
              )}
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${TRAXCIS_COLORS.primary.DEFAULT}15` }}
            >
              <MessageCircle className="w-6 h-6" style={{ color: TRAXCIS_COLORS.primary.DEFAULT }} />
            </div>
          </div>
          {summary && (
            <div className="mt-4 flex items-center gap-2">
              <span className={getTrendColor(summary.trend.direction)}>
                {getTrendIcon(summary.trend.direction)}
              </span>
              <span className={`text-sm font-medium ${getTrendColor(summary.trend.direction)}`}>
                {summary.trend.change_pct > 0 ? '+' : ''}{summary.trend.change_pct}% trend
              </span>
            </div>
          )}
        </motion.div>

        {/* Positive Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            backgroundColor: cardBg,
            borderColor: cardBorder,
          }}
          className="border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p style={{ color: subTextColor }} className="text-sm font-medium">Positive</p>
              <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">
                {insights.sentiment.positive_pct}%
              </p>
              <p style={{ color: subTextColor }} className="text-xs mt-2">
                {insights.sentiment.positive} feedbacks
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${TRAXCIS_COLORS.status.success}15` }}
            >
              <Smile className="w-6 h-6" style={{ color: TRAXCIS_COLORS.status.success }} />
            </div>
          </div>
        </motion.div>

        {/* Neutral Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            backgroundColor: cardBg,
            borderColor: cardBorder,
          }}
          className="border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p style={{ color: subTextColor }} className="text-sm font-medium">Neutral</p>
              <p className="text-3xl font-bold mt-2 text-yellow-600 dark:text-yellow-400">
                {insights.sentiment.neutral_pct}%
              </p>
              <p style={{ color: subTextColor }} className="text-xs mt-2">
                {insights.sentiment.neutral} feedbacks
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${TRAXCIS_COLORS.status.warning}15` }}
            >
              <Meh className="w-6 h-6" style={{ color: TRAXCIS_COLORS.status.warning }} />
            </div>
          </div>
        </motion.div>

        {/* Negative Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            backgroundColor: cardBg,
            borderColor: cardBorder,
          }}
          className="border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p style={{ color: subTextColor }} className="text-sm font-medium">Negative</p>
              <p className="text-3xl font-bold mt-2 text-red-600 dark:text-red-400">
                {insights.sentiment.negative_pct}%
              </p>
              <p style={{ color: subTextColor }} className="text-xs mt-2">
                {insights.sentiment.negative} feedbacks
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${TRAXCIS_COLORS.status.error}15` }}
            >
              <Frown className="w-6 h-6" style={{ color: TRAXCIS_COLORS.status.error }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Forecast Charts */}
      {forecastCount && forecastSentiment && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volume Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            className="border rounded-xl p-6 shadow-sm"
          >
            <h2 style={{ color: textColor }} className="text-lg font-semibold mb-4 flex items-center gap-2">
              📈 Feedback Volume Forecast
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={[
                  ...forecastCount.historical.map((d) => ({ ...d, type: 'historical' })),
                  ...forecastCount.forecast.map((d) => ({ ...d, type: 'forecast' })),
                ]}
              >
                <defs>
                  <linearGradient id="colorFeedback" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TRAXCIS_COLORS.primary.DEFAULT} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={TRAXCIS_COLORS.primary.DEFAULT} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={cardBorder} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: subTextColor }}
                  stroke={cardBorder}
                />
                <YAxis tick={{ fontSize: 12, fill: subTextColor }} stroke={cardBorder} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '8px',
                    color: textColor,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={TRAXCIS_COLORS.primary.DEFAULT}
                  fill="url(#colorFeedback)"
                  strokeWidth={2}
                  name="Feedback Count"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ color: subTextColor }} className="mt-3 text-sm flex items-center gap-2">
              <span>Trend:</span>
              <span className={`font-medium ${getTrendColor(forecastCount.trend.direction)}`}>
                {forecastCount.trend.direction}
              </span>
              <span>({forecastCount.trend.change_pct > 0 ? '+' : ''}{forecastCount.trend.change_pct}%)</span>
            </div>
          </motion.div>

          {/* Sentiment Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            className="border rounded-xl p-6 shadow-sm"
          >
            <h2 style={{ color: textColor }} className="text-lg font-semibold mb-4 flex items-center gap-2">
              😊 Sentiment Score Forecast
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  ...forecastSentiment.historical.map((d) => ({ ...d, type: 'historical' })),
                  ...forecastSentiment.forecast.map((d) => ({ ...d, type: 'forecast' })),
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={cardBorder} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: subTextColor }}
                  stroke={cardBorder}
                />
                <YAxis 
                  domain={[0, 1]} 
                  tick={{ fontSize: 12, fill: subTextColor }}
                  stroke={cardBorder}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '8px',
                    color: textColor,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={TRAXCIS_COLORS.status.success}
                  strokeWidth={2}
                  name="Sentiment Score"
                  dot={{ r: 3, fill: TRAXCIS_COLORS.status.success }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ color: subTextColor }} className="mt-3 text-sm flex items-center gap-2">
              <span>Trend:</span>
              <span className={`font-medium ${getTrendColor(forecastSentiment.trend.direction)}`}>
                {forecastSentiment.trend.direction}
              </span>
              <span>({forecastSentiment.trend.change_pct > 0 ? '+' : ''}{forecastSentiment.trend.change_pct}%)</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Distribution & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          className="border rounded-xl p-6 shadow-sm"
        >
          <h2 style={{ color: textColor }} className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
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
              <Tooltip 
                contentStyle={{
                  backgroundColor: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: '8px',
                  color: textColor,
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Feedback Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          className="border rounded-xl p-6 shadow-sm"
        >
          <h2 style={{ color: textColor }} className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Feedback Trend Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={insights.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke={cardBorder} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: subTextColor }}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke={cardBorder}
              />
              <YAxis tick={{ fontSize: 12, fill: subTextColor }} stroke={cardBorder} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: '8px',
                  color: textColor,
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={TRAXCIS_COLORS.primary.DEFAULT}
                strokeWidth={2}
                name="Feedback Count"
                dot={{ r: 3, fill: TRAXCIS_COLORS.primary.DEFAULT }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Keywords Analysis */}
      {keywordsBySentiment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          className="border rounded-xl p-6 shadow-sm"
        >
          <h2 style={{ color: textColor }} className="text-lg font-semibold mb-6">
            🏷️ Top Keywords by Sentiment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Positive Keywords */}
            <div>
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                ✅ Positive ({keywordsBySentiment.positive.length})
              </h3>
              <div className="space-y-3">
                {keywordsBySentiment.positive.slice(0, 10).map((kw, idx) => (
                  <div 
                    key={idx} 
                    className="group hover:bg-green-50 dark:hover:bg-green-900/20 p-3 rounded-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: textColor }} className="text-sm font-medium">
                        {kw.keyword}
                      </span>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2.5 py-1 rounded-full font-semibold">
                        {kw.frequency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(100, (kw.frequency / Math.max(...keywordsBySentiment.positive.map(k => k.frequency))) * 100)}%` 
                          }}
                        />
                      </div>
                      <span style={{ color: subTextColor }} className="text-xs">
                        #{idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Neutral Keywords */}
            <div>
              <h3 className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-4 flex items-center gap-2">
                ➖ Neutral ({keywordsBySentiment.neutral.length})
              </h3>
              <div className="space-y-3">
                {keywordsBySentiment.neutral.slice(0, 10).map((kw, idx) => (
                  <div 
                    key={idx} 
                    className="group hover:bg-yellow-50 dark:hover:bg-yellow-900/20 p-3 rounded-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: textColor }} className="text-sm font-medium">
                        {kw.keyword}
                      </span>
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2.5 py-1 rounded-full font-semibold">
                        {kw.frequency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(100, (kw.frequency / Math.max(...keywordsBySentiment.neutral.map(k => k.frequency))) * 100)}%` 
                          }}
                        />
                      </div>
                      <span style={{ color: subTextColor }} className="text-xs">
                        #{idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Negative Keywords */}
            <div>
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                ❌ Negative ({keywordsBySentiment.negative.length})
              </h3>
              <div className="space-y-3">
                {keywordsBySentiment.negative.slice(0, 10).map((kw, idx) => (
                  <div 
                    key={idx} 
                    className="group hover:bg-red-50 dark:hover:bg-red-900/20 p-3 rounded-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: textColor }} className="text-sm font-medium">
                        {kw.keyword}
                      </span>
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2.5 py-1 rounded-full font-semibold">
                        {kw.frequency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(100, (kw.frequency / Math.max(...keywordsBySentiment.negative.map(k => k.frequency))) * 100)}%` 
                          }}
                        />
                      </div>
                      <span style={{ color: subTextColor }} className="text-xs">
                        #{idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Recipients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}
        className="border rounded-xl p-6 shadow-sm"
      >
        <h2 style={{ color: textColor }} className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Top Feedback Recipients
        </h2>
        {insights.recipients.length === 0 ? (
          <p style={{ color: subTextColor }} className="text-center py-12">
            No recipients data available
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: cardBorder }}>
              <thead style={{ backgroundColor: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50] }}>
                <tr>
                  <th 
                    style={{ color: subTextColor }}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                  >
                    Rank
                  </th>
                  <th 
                    style={{ color: subTextColor }}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                  >
                    Recipient
                  </th>
                  <th 
                    style={{ color: subTextColor }}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th 
                    style={{ color: subTextColor }}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                  >
                    Feedback Count
                  </th>
                  <th 
                    style={{ color: subTextColor }}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                  >
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: cardBorder }}>
                {insights.recipients.map((recipient, index) => (
                  <tr 
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td style={{ color: subTextColor }} className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      #{index + 1}
                    </td>
                    <td style={{ color: textColor }} className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      {recipient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          recipient.recipient_type === 'USER'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            : recipient.recipient_type === 'ADMIN'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}
                      >
                        {recipient.recipient_type}
                      </span>
                    </td>
                    <td style={{ color: textColor }} className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      {recipient.count}
                    </td>
                    <td style={{ color: subTextColor }} className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {((recipient.count / insights.total_feedback) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UnifiedInsightsPage;
