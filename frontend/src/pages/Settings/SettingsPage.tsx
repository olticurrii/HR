import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Clock, Save, AlertCircle, CheckCircle, X, MessageCircle, TrendingUp, Bell, Network } from 'lucide-react';
import { settingsService, OrganizationSettings } from '../../services/settingsService';
import ToggleSwitch from '../../components/Settings/ToggleSwitch';
import SettingItem from '../../components/Settings/SettingItem';
import toast from 'react-hot-toast';
import TRAXCIS_COLORS from '../../theme/traxcis';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  
  // Time Tracking
  const [allowBreaks, setAllowBreaks] = useState(true);
  const [requireDocumentation, setRequireDocumentation] = useState(false);
  
  // Org Chart Feature Flags
  const [showUnassignedPanel, setShowUnassignedPanel] = useState(true);
  const [managerSubtreeEdit, setManagerSubtreeEdit] = useState(true);
  const [departmentColors, setDepartmentColors] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [showConnectors, setShowConnectors] = useState(true);
  
  // Feedback Feature Flags
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [enableThreading, setEnableThreading] = useState(true);
  const [enableModeration, setEnableModeration] = useState(true);
  const [notifyManagers, setNotifyManagers] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  
  // Performance Module Feature Flags
  const [performanceModuleEnabled, setPerformanceModuleEnabled] = useState(true);
  const [allowSelfGoals, setAllowSelfGoals] = useState(true);
  const [requireGoalApproval, setRequireGoalApproval] = useState(true);
  const [enablePeerReviews, setEnablePeerReviews] = useState(true);
  const [allowAnonymousPeer, setAllowAnonymousPeer] = useState(true);
  const [showKpiTrends, setShowKpiTrends] = useState(true);
  const [topPerformerThreshold, setTopPerformerThreshold] = useState(85);
  const [monthlyReports, setMonthlyReports] = useState(true);
  
  // Notification System Feature Flags
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [inappNotificationsEnabled, setInappNotificationsEnabled] = useState(true);
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(true);

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
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getOrgSettings();
      setSettings(data);
      setAllowBreaks(data.allow_breaks);
      setRequireDocumentation(data.require_documentation);
      setShowUnassignedPanel(data.orgchart_show_unassigned_panel);
      setManagerSubtreeEdit(data.orgchart_manager_subtree_edit);
      setDepartmentColors(data.orgchart_department_colors);
      setCompactView(data.orgchart_compact_view);
      setShowConnectors(data.orgchart_show_connectors);
      setAllowAnonymous(data.feedback_allow_anonymous);
      setEnableThreading(data.feedback_enable_threading);
      setEnableModeration(data.feedback_enable_moderation);
      setNotifyManagers(data.feedback_notify_managers);
      setWeeklyDigest(data.feedback_weekly_digest);
      setPerformanceModuleEnabled(data.performance_module_enabled);
      setAllowSelfGoals(data.performance_allow_self_goals);
      setRequireGoalApproval(data.performance_require_goal_approval);
      setEnablePeerReviews(data.performance_enable_peer_reviews);
      setAllowAnonymousPeer(data.performance_allow_anonymous_peer);
      setShowKpiTrends(data.performance_show_kpi_trends);
      setTopPerformerThreshold(data.performance_top_performer_threshold);
      setMonthlyReports(data.performance_monthly_reports);
      setEmailNotificationsEnabled(data.email_notifications_enabled ?? true);
      setInappNotificationsEnabled(data.inapp_notifications_enabled ?? true);
      setDailySummaryEnabled(data.daily_summary_enabled ?? true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const updated = await settingsService.updateOrgSettings({
        allow_breaks: allowBreaks,
        require_documentation: requireDocumentation,
        orgchart_show_unassigned_panel: showUnassignedPanel,
        orgchart_manager_subtree_edit: managerSubtreeEdit,
        orgchart_department_colors: departmentColors,
        orgchart_compact_view: compactView,
        orgchart_show_connectors: showConnectors,
        feedback_allow_anonymous: allowAnonymous,
        feedback_enable_threading: enableThreading,
        feedback_enable_moderation: enableModeration,
        feedback_notify_managers: notifyManagers,
        feedback_weekly_digest: weeklyDigest,
        performance_module_enabled: performanceModuleEnabled,
        performance_allow_self_goals: allowSelfGoals,
        performance_require_goal_approval: requireGoalApproval,
        performance_enable_peer_reviews: enablePeerReviews,
        performance_allow_anonymous_peer: allowAnonymousPeer,
        performance_show_kpi_trends: showKpiTrends,
        performance_top_performer_threshold: topPerformerThreshold,
        performance_monthly_reports: monthlyReports,
        email_notifications_enabled: emailNotificationsEnabled,
        inapp_notifications_enabled: inappNotificationsEnabled,
        daily_summary_enabled: dailySummaryEnabled,
      });
      
      setSettings(updated);
      toast.success('Settings saved successfully!');
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to save settings';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = settings && (
    settings.allow_breaks !== allowBreaks ||
    settings.require_documentation !== requireDocumentation ||
    settings.orgchart_show_unassigned_panel !== showUnassignedPanel ||
    settings.orgchart_manager_subtree_edit !== managerSubtreeEdit ||
    settings.orgchart_department_colors !== departmentColors ||
    settings.orgchart_compact_view !== compactView ||
    settings.orgchart_show_connectors !== showConnectors ||
    settings.feedback_allow_anonymous !== allowAnonymous ||
    settings.feedback_enable_threading !== enableThreading ||
    settings.feedback_enable_moderation !== enableModeration ||
    settings.feedback_notify_managers !== notifyManagers ||
    settings.feedback_weekly_digest !== weeklyDigest ||
    settings.performance_module_enabled !== performanceModuleEnabled ||
    settings.performance_allow_self_goals !== allowSelfGoals ||
    settings.performance_require_goal_approval !== requireGoalApproval ||
    settings.performance_enable_peer_reviews !== enablePeerReviews ||
    settings.performance_allow_anonymous_peer !== allowAnonymousPeer ||
    settings.performance_show_kpi_trends !== showKpiTrends ||
    settings.performance_top_performer_threshold !== topPerformerThreshold ||
    settings.performance_monthly_reports !== monthlyReports ||
    settings.email_notifications_enabled !== emailNotificationsEnabled ||
    settings.inapp_notifications_enabled !== inappNotificationsEnabled ||
    settings.daily_summary_enabled !== dailySummaryEnabled
  );

  // Theme colors
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const sectionBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const dividerColor = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '500',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <SettingsIcon style={{ width: '28px', height: '28px' }} />
            Organization Settings
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', marginTop: '8px', fontSize: '15px' }}>
            Configure system settings and preferences (Admin Only)
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: cardBg,
            borderRadius: '16px',
            boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: `1px solid ${cardBorder}`,
            padding: '64px',
            textAlign: 'center',
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderLeft: `3px solid ${cardBorder}`,
            borderRight: `3px solid ${cardBorder}`,
            borderBottom: `3px solid ${cardBorder}`,
            borderTop: `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: subTextColor, fontSize: '14px' }}>Loading settings...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '500',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}>
            <SettingsIcon style={{ width: '28px', height: '28px' }} />
            Organization Settings
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', fontSize: '15px' }}>
            Configure system settings and preferences (Admin Only)
          </p>
        </div>
        
        {hasChanges && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: saving ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.accent.DEFAULT,
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.accent[600];
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.accent.DEFAULT;
              }
            }}
          >
            {saving ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #FFFFFF',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                Saving...
              </>
            ) : (
              <>
                <Save style={{ width: '18px', height: '18px' }} />
                Save All Settings
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
            }}
          >
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#991B1B' }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              backgroundColor: '#D1FAE5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
            }}
          >
            <CheckCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#065F46' }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Tracking Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          backgroundColor: sectionBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}` }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}>
            <Clock style={{ width: '20px', height: '20px' }} />
            Time Tracking
          </h2>
          <p style={{ fontSize: '13px', color: subTextColor }}>
            Configure time tracking behavior for all employees
          </p>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SettingItem
            id="allow-breaks"
            title="Allow Employee Breaks"
            description="When enabled, employees can start and end breaks during their shifts. When disabled, break controls will be hidden."
            enabled={allowBreaks}
            onChange={setAllowBreaks}
            badge={allowBreaks ? { text: 'Breaks Enabled', color: 'green' } : { text: 'Breaks Disabled', color: 'red' }}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="require-documentation"
            title="Require Daily Documentation"
            description="When enabled, employees must submit a work summary when clocking out. The system will show a modal requiring non-empty text."
            enabled={requireDocumentation}
            onChange={setRequireDocumentation}
            badge={requireDocumentation ? { text: 'Required', color: 'orange' } : { text: 'Optional', color: 'gray' }}
          />
        </div>
      </motion.div>

      {/* Organization Chart Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          backgroundColor: sectionBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}` }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}>
            <Network style={{ width: '20px', height: '20px' }} />
            Organization Chart Features
          </h2>
          <p style={{ fontSize: '13px', color: subTextColor }}>
            Enable or disable organization chart features
          </p>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SettingItem
            id="show-unassigned"
            title="Show Unassigned Panel"
            description="Display a panel showing employees without a manager. Allows bidirectional drag and drop."
            enabled={showUnassignedPanel}
            onChange={setShowUnassignedPanel}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="manager-subtree"
            title="Manager Subtree Edit Only"
            description="When enabled, managers can only edit employees in their subtree. Admins can edit all."
            enabled={managerSubtreeEdit}
            onChange={setManagerSubtreeEdit}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="dept-colors"
            title="Department Colors"
            description="Color-code employee cards and connecting lines by department for easier visualization."
            enabled={departmentColors}
            onChange={setDepartmentColors}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="compact-view"
            title="Enable Compact View Toggle"
            description="Show a toggle button to switch between detailed and compact employee cards."
            enabled={compactView}
            onChange={setCompactView}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="show-connectors"
            title="Show Connecting Lines"
            description="Display curved SVG lines connecting managers to their direct reports."
            enabled={showConnectors}
            onChange={setShowConnectors}
          />
        </div>
      </motion.div>

      {/* Feedback System Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          backgroundColor: sectionBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}` }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}>
            <MessageCircle style={{ width: '20px', height: '20px' }} />
            Feedback System Features
          </h2>
          <p style={{ fontSize: '13px', color: subTextColor }}>
            Configure feedback system behavior and enhancements
          </p>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SettingItem
            id="allow-anonymous"
            title="Allow Anonymous Feedback"
            description="Users can submit feedback anonymously. Identity is hidden from non-admins."
            enabled={allowAnonymous}
            onChange={setAllowAnonymous}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="enable-threading"
            title="Enable Threaded Conversations"
            description="Allow users to reply to feedback, creating conversation threads."
            enabled={enableThreading}
            onChange={setEnableThreading}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="enable-moderation"
            title="Enable Content Moderation"
            description="Automatically scan and BLOCK feedback containing profanity, threats, or inappropriate content. Blocked feedback will not be saved."
            enabled={enableModeration}
            onChange={setEnableModeration}
            warning={enableModeration ? "Warning: Users will receive an error if their feedback contains flagged words" : undefined}
            badge={enableModeration ? { text: 'Blocks inappropriate content', color: 'red' } : undefined}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="notify-managers"
            title="Notify Managers on Feedback"
            description="Automatically notify managers when their team members receive negative feedback."
            enabled={notifyManagers}
            onChange={setNotifyManagers}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="weekly-digest"
            title="Weekly Feedback Digest"
            description="Generate and send weekly feedback summary to administrators every Monday."
            enabled={weeklyDigest}
            onChange={setWeeklyDigest}
          />
        </div>
      </motion.div>

      {/* Performance Module Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          backgroundColor: sectionBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}` }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}>
            <TrendingUp style={{ width: '20px', height: '20px' }} />
            Performance Module Settings
          </h2>
          <p style={{ fontSize: '13px', color: subTextColor }}>
            Configure the performance management module and its features
          </p>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SettingItem
            id="performance-enabled"
            title="Enable Performance Module"
            description="Master on/off switch for the entire performance management module. When disabled, the Performance tab will be hidden."
            enabled={performanceModuleEnabled}
            onChange={setPerformanceModuleEnabled}
            badge={performanceModuleEnabled ? { text: 'Module Enabled', color: 'green' } : { text: 'Module Disabled', color: 'gray' }}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="allow-self-goals"
            title="Allow Self-Created Goals"
            description="Allow employees to create their own performance goals and objectives."
            enabled={allowSelfGoals}
            onChange={setAllowSelfGoals}
            disabled={!performanceModuleEnabled}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="require-goal-approval"
            title="Require Goal Approval"
            description="Self-created goals must be approved by manager before becoming active."
            enabled={requireGoalApproval}
            onChange={setRequireGoalApproval}
            disabled={!performanceModuleEnabled || !allowSelfGoals}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="enable-peer-reviews"
            title="Enable Peer Reviews"
            description="Allow employees to submit peer reviews for their colleagues."
            enabled={enablePeerReviews}
            onChange={setEnablePeerReviews}
            disabled={!performanceModuleEnabled}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="allow-anonymous-peer"
            title="Allow Anonymous Peer Reviews"
            description="Allow peer reviews to be submitted anonymously for more honest feedback."
            enabled={allowAnonymousPeer}
            onChange={setAllowAnonymousPeer}
            disabled={!performanceModuleEnabled || !enablePeerReviews}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="show-kpi-trends"
            title="Show KPI Trend Charts"
            description="Display KPI trend visualizations and historical data tracking."
            enabled={showKpiTrends}
            onChange={setShowKpiTrends}
            disabled={!performanceModuleEnabled}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          {/* Top Performer Threshold Slider */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <label
                htmlFor="top-performer-threshold"
                style={{
                  fontSize: '15px',
                  fontWeight: '500',
                  color: textColor,
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Top Performer Badge Threshold
              </label>
              <p style={{
                fontSize: '13px',
                color: subTextColor,
                marginBottom: '12px',
                lineHeight: '1.5',
              }}>
                Score threshold (50-100%) for displaying top performer badge on profile. Current: <strong style={{ color: TRAXCIS_COLORS.accent.DEFAULT }}>{topPerformerThreshold}%</strong>
              </p>
              <div>
                <input
                  type="range"
                  id="top-performer-threshold"
                  min="50"
                  max="100"
                  step="5"
                  value={topPerformerThreshold}
                  onChange={(e) => setTopPerformerThreshold(parseInt(e.target.value))}
                  disabled={!performanceModuleEnabled}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    appearance: 'none',
                    background: `linear-gradient(to right, ${TRAXCIS_COLORS.primary.DEFAULT} 0%, ${TRAXCIS_COLORS.primary.DEFAULT} ${(topPerformerThreshold - 50) * 2}%, ${isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200]} ${(topPerformerThreshold - 50) * 2}%, ${isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200]} 100%)`,
                    cursor: performanceModuleEnabled ? 'pointer' : 'not-allowed',
                    opacity: performanceModuleEnabled ? 1 : 0.5,
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: subTextColor,
                  marginTop: '6px',
                }}>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="monthly-reports"
            title="Generate Monthly Reports"
            description="Automatically generate and email monthly performance summary to administrators."
            enabled={monthlyReports}
            onChange={setMonthlyReports}
            disabled={!performanceModuleEnabled}
          />
        </div>
      </motion.div>

      {/* Notification System Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          backgroundColor: sectionBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}` }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}>
            <Bell style={{ width: '20px', height: '20px' }} />
            Notification System Settings
          </h2>
          <p style={{ fontSize: '13px', color: subTextColor }}>
            Configure email and in-app notifications
          </p>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SettingItem
            id="email-notifications"
            title="Enable Email Notifications"
            description="Master toggle for all email notifications. Users can still control individual notification types."
            enabled={emailNotificationsEnabled}
            onChange={setEmailNotificationsEnabled}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="inapp-notifications"
            title="Enable In-App Notifications"
            description="Show notifications in the notification bell. Users can control individual notification types in their profile."
            enabled={inappNotificationsEnabled}
            onChange={setInappNotificationsEnabled}
          />

          <div style={{ height: '1px', backgroundColor: dividerColor }} />

          <SettingItem
            id="daily-summary"
            title="Daily Admin Summary"
            description="Send daily digest email to administrators with system activity summary."
            enabled={dailySummaryEnabled}
            onChange={setDailySummaryEnabled}
          />
        </div>
      </motion.div>

      {/* Footer Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '20px 24px',
            backgroundColor: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50],
            borderRadius: '12px',
            border: `1px solid ${cardBorder}`,
          }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: saving ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.accent.DEFAULT,
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.accent[600];
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.accent.DEFAULT;
              }
            }}
          >
            {saving ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #FFFFFF',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                Saving...
              </>
            ) : (
              <>
                <Save style={{ width: '18px', height: '18px' }} />
                Save All Settings
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsPage;
