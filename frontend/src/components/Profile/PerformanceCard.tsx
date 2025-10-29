import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, Calendar, CheckCircle } from 'lucide-react';
import { PerformanceSummary } from '../../services/profileService';
import TRAXCIS_COLORS from '../../theme/traxcis';

interface PerformanceCardProps {
  onGetPerformance: (windowDays: number) => Promise<PerformanceSummary>;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ onGetPerformance }) => {
  const [performance, setPerformance] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [windowDays, setWindowDays] = useState(180);
  const [isDark, setIsDark] = useState(false);

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

  useEffect(() => {
    loadPerformance();
  }, [windowDays]);

  const loadPerformance = async () => {
    setLoading(true);
    try {
      const data = await onGetPerformance(windowDays);
      setPerformance(data);
    } catch (error) {
      console.error('Failed to load performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColors = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'done':
        return {
          bg: isDark ? '#064E3B' : '#D1FAE5',
          text: isDark ? '#6EE7B7' : '#065F46',
          border: isDark ? '#065F46' : '#A7F3D0',
        };
      case 'in_progress':
        return {
          bg: isDark ? TRAXCIS_COLORS.accent[900] : TRAXCIS_COLORS.accent[50],
          text: TRAXCIS_COLORS.accent.DEFAULT,
          border: isDark ? TRAXCIS_COLORS.accent[700] : TRAXCIS_COLORS.accent[200],
        };
      case 'closed':
        return {
          bg: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100],
          text: isDark ? TRAXCIS_COLORS.secondary[300] : TRAXCIS_COLORS.secondary[600],
          border: isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200],
        };
      default:
        return {
          bg: isDark ? '#78350F' : '#FEF3C7',
          text: isDark ? '#FCD34D' : '#92400E',
          border: isDark ? '#92400E' : '#FDE68A',
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Theme colors
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const sectionBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBorder = isDark ? TRAXCIS_COLORS.secondary[600] : TRAXCIS_COLORS.secondary[300];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: cardBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          padding: '24px',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: textColor }}>
          Performance Summary
        </h2>
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderLeft: `3px solid ${cardBorder}`,
            borderRight: `3px solid ${cardBorder}`,
            borderBottom: `3px solid ${cardBorder}`,
            borderTop: `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={{ color: subTextColor, fontSize: '14px' }}>Loading performance data...</p>
        </div>
      </motion.div>
    );
  }

  if (!performance) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: cardBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          padding: '24px',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: textColor }}>
          Performance Summary
        </h2>
        <p style={{ color: subTextColor, fontSize: '14px' }}>Failed to load performance data.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: cardBg,
        borderRadius: '16px',
        boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: `1px solid ${cardBorder}`,
        padding: '24px',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: textColor }}>
          Performance Summary
        </h2>
        <select
          value={windowDays}
          onChange={(e) => setWindowDays(Number(e.target.value))}
          style={{
            padding: '6px 10px',
            border: `1px solid ${inputBorder}`,
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: "'Outfit', sans-serif",
            backgroundColor: inputBg,
            color: textColor,
            cursor: 'pointer',
          }}
          onFocus={(e) => {
            e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
            e.target.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.target.style.outline = 'none';
          }}
        >
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={180}>Last 180 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* KPIs Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: textColor,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <TrendingUp style={{ width: '18px', height: '18px' }} />
          Key Performance Indicators
        </h3>
        {performance.kpis.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            {performance.kpis.map((kpi, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  backgroundColor: sectionBg,
                  borderRadius: '8px',
                  padding: '16px',
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <p style={{ fontSize: '12px', color: subTextColor, marginBottom: '6px' }}>
                  {kpi.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <p style={{ fontSize: '24px', fontWeight: '600', color: textColor }}>
                    {kpi.value}
                    {kpi.unit && <span style={{ fontSize: '16px', marginLeft: '4px' }}>{kpi.unit}</span>}
                  </p>
                  {kpi.delta !== null && kpi.delta !== undefined && (
                    <span style={{
                      fontSize: '13px',
                      color: kpi.delta >= 0 ? TRAXCIS_COLORS.status.success : TRAXCIS_COLORS.status.error,
                      fontWeight: '500',
                    }}>
                      {kpi.delta >= 0 ? '↑' : '↓'} {Math.abs(kpi.delta)}%
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: subTextColor }}>No KPIs available</p>
        )}
      </div>

      {/* Goals Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: textColor,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Target style={{ width: '18px', height: '18px' }} />
          My Goals
        </h3>
        {performance.goals.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {performance.goals.map((goal) => {
              const statusColors = getStatusBadgeColors(goal.status);
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: sectionBg,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: textColor }}>
                      {goal.title}
                    </h4>
                    <span style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '9999px',
                      backgroundColor: statusColors.bg,
                      color: statusColors.text,
                      border: `1px solid ${statusColors.border}`,
                      fontWeight: '500',
                      textTransform: 'capitalize',
                    }}>
                      {goal.status}
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    backgroundColor: isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200],
                    borderRadius: '9999px',
                    height: '6px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}>
                    <div style={{
                      height: '100%',
                      backgroundColor: TRAXCIS_COLORS.accent.DEFAULT,
                      borderRadius: '9999px',
                      width: `${goal.progress}%`,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: subTextColor }}>
                    <span>{goal.progress}% complete</span>
                    {goal.due_date && (
                      <span>Due: {formatDate(goal.due_date)}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: subTextColor }}>No active goals</p>
        )}
      </div>

      {/* Last Review Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: textColor,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Award style={{ width: '18px', height: '18px' }} />
          Last Review
        </h3>
        {performance.last_review ? (
          <div style={{
            backgroundColor: sectionBg,
            borderRadius: '8px',
            padding: '16px',
            border: `1px solid ${cardBorder}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '13px', color: subTextColor, marginBottom: '2px' }}>
                  Reviewed by: {performance.last_review.reviewer?.full_name || 'Unknown'}
                </p>
                <p style={{ fontSize: '12px', color: subTextColor }}>
                  {formatDate(performance.last_review.date)}
                </p>
              </div>
              {performance.last_review.rating && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '28px', fontWeight: '600', color: TRAXCIS_COLORS.accent.DEFAULT }}>
                    {performance.last_review.rating}
                  </span>
                  <span style={{ fontSize: '14px', color: subTextColor, marginLeft: '4px' }}>/5</span>
                </div>
              )}
            </div>
            {performance.last_review.comment && (
              <p style={{ fontSize: '14px', color: textColor, lineHeight: '1.5' }}>
                {performance.last_review.comment}
              </p>
            )}
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: subTextColor }}>No reviews yet</p>
        )}
      </div>

      {/* Trend Section */}
      <div>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: textColor,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <TrendingUp style={{ width: '18px', height: '18px' }} />
          Performance Trend
        </h3>
        {performance.trend.length > 0 ? (
          <div style={{
            backgroundColor: sectionBg,
            borderRadius: '8px',
            padding: '16px',
            border: `1px solid ${cardBorder}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '120px', gap: '4px' }}>
              {performance.trend.map((point, index) => {
                const maxScore = 5;
                const heightPercent = (point.score / maxScore) * 100;
                return (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                    title={`${formatDate(point.date)}: ${point.score}`}
                  >
                    <div style={{
                      width: '100%',
                      backgroundColor: TRAXCIS_COLORS.primary.DEFAULT,
                      borderRadius: '4px 4px 0 0',
                      height: `${heightPercent}%`,
                      minHeight: heightPercent > 0 ? '4px' : '0px',
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: subTextColor,
              marginTop: '8px',
            }}>
              <span>
                {performance.trend.length > 0 ? formatDate(performance.trend[0].date) : ''}
              </span>
              <span>
                {performance.trend.length > 0
                  ? formatDate(performance.trend[performance.trend.length - 1].date)
                  : ''}
              </span>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: subTextColor }}>No trend data available</p>
        )}
      </div>
    </motion.div>
  );
};

export default PerformanceCard;
