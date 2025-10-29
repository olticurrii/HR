import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Clock, Save, AlertCircle, CheckCircle, MessageCircle, TrendingUp, Bell } from 'lucide-react';
import { settingsService, OrganizationSettings } from '../../services/settingsService';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
      setSuccess('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save settings');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="gradient-primary rounded-3xl p-8 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-medium mb-2 flex flex-col">
            <span className="flex items-center">
              <Settings className="w-8 h-8 mr-3" />
              Organization Settings
            </span>
            <span className="accent-line mt-2 border-white/50"></span>
          </h1>
          <p className="text-primary-100 text-lg font-normal">
            Configure system settings and preferences (Admin Only)
          </p>
        </div>
      </motion.div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {/* Time Tracking Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Time Tracking
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure time tracking behavior for all employees
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Allow Breaks Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="allow-breaks" className="text-base font-medium text-gray-900">
                Allow Employee Breaks
              </label>
              <p className="text-sm text-gray-600 mt-1">
                When enabled, employees can start and end breaks during their shifts. 
                When disabled, break controls will be hidden and break endpoints will return 403.
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                onClick={() => setAllowBreaks(!allowBreaks)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  allowBreaks ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={allowBreaks}
                id="allow-breaks"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    allowBreaks ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Status Indicator */}
          <div className={`p-4 rounded-lg ${allowBreaks ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${allowBreaks ? 'text-green-600' : 'text-red-600'}`}>
                {allowBreaks ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${allowBreaks ? 'text-green-800' : 'text-red-800'}`}>
                  {allowBreaks ? 'Breaks Enabled' : 'Breaks Disabled'}
                </h3>
                <p className={`text-sm mt-1 ${allowBreaks ? 'text-green-700' : 'text-red-700'}`}>
                  {allowBreaks
                    ? 'Employees can start and end breaks in the Time Tracking module.'
                    : 'Break controls are hidden and break API endpoints will return 403 Forbidden.'}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Require Documentation Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="require-documentation" className="text-base font-medium text-gray-900">
                Require Daily Documentation
              </label>
              <p className="text-sm text-gray-600 mt-1">
                When enabled, employees must submit a work summary when clocking out. 
                The system will show a modal requiring non-empty text before completing clock-out.
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                onClick={() => setRequireDocumentation(!requireDocumentation)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  requireDocumentation ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={requireDocumentation}
                id="require-documentation"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    requireDocumentation ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Documentation Status Indicator */}
          <div className={`p-4 rounded-lg ${requireDocumentation ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${requireDocumentation ? 'text-primary' : 'text-gray-600'}`}>
                {requireDocumentation ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${requireDocumentation ? 'text-blue-800' : 'text-gray-800'}`}>
                  {requireDocumentation ? 'Documentation Required' : 'Documentation Optional'}
                </h3>
                <p className={`text-sm mt-1 ${requireDocumentation ? 'text-blue-700' : 'text-gray-700'}`}>
                  {requireDocumentation
                    ? 'Employees must provide a work summary when clocking out. Empty submissions will be rejected.'
                    : 'Employees can clock out without providing documentation.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Chart Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Organization Chart Features
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Enable or disable organization chart features
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Show Unassigned Panel */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="show-unassigned" className="text-base font-medium text-gray-900">
                Show Unassigned Panel
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Display a panel showing employees without a manager. Allows bidirectional drag and drop.
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                onClick={() => setShowUnassignedPanel(!showUnassignedPanel)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  showUnassignedPanel ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={showUnassignedPanel}
                id="show-unassigned"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showUnassignedPanel ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Manager Subtree Edit */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="manager-subtree" className="text-base font-medium text-gray-900">
                Manager Subtree Edit Only
              </label>
              <p className="text-sm text-gray-600 mt-1">
                When enabled, managers can only edit employees in their subtree. Admins can edit all.
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                onClick={() => setManagerSubtreeEdit(!managerSubtreeEdit)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  managerSubtreeEdit ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={managerSubtreeEdit}
                id="manager-subtree"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    managerSubtreeEdit ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Department Colors */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="dept-colors" className="text-base font-medium text-gray-900">
                Department Colors
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Color-code employee cards and connecting lines by department for easier visualization.
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                onClick={() => setDepartmentColors(!departmentColors)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  departmentColors ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={departmentColors}
                id="dept-colors"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    departmentColors ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Compact View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="compact-view" className="text-base font-medium text-gray-900">
                Enable Compact View Toggle
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Show a toggle button to switch between detailed and compact employee cards.
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                onClick={() => setCompactView(!compactView)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  compactView ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={compactView}
                id="compact-view"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    compactView ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Show Connecting Lines */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="show-connectors" className="text-base font-medium text-gray-900">
                Show Connecting Lines
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Display curved SVG lines connecting managers to their direct reports.
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                onClick={() => setShowConnectors(!showConnectors)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  showConnectors ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={showConnectors}
                id="show-connectors"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showConnectors ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Feedback System Features
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure feedback system behavior and enhancements
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Allow Anonymous */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="allow-anonymous" className="text-base font-medium text-gray-900">
                Allow Anonymous Feedback
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Users can submit feedback anonymously. Identity is hidden from non-admins.
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                onClick={() => setAllowAnonymous(!allowAnonymous)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  allowAnonymous ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={allowAnonymous}
                id="allow-anonymous"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    allowAnonymous ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Enable Threading */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="enable-threading" className="text-base font-medium text-gray-900">
                Enable Threaded Conversations
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Allow users to reply to feedback, creating conversation threads.
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                onClick={() => setEnableThreading(!enableThreading)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  enableThreading ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={enableThreading}
                id="enable-threading"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enableThreading ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Enable Moderation */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="enable-moderation" className="text-base font-medium text-gray-900 flex items-center gap-2">
                Enable Content Moderation
                {enableModeration && (
                  <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded font-normal">
                    Blocks inappropriate content
                  </span>
                )}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Automatically scan and BLOCK feedback containing profanity, threats, or inappropriate content. Blocked feedback will not be saved.
              </p>
              {enableModeration && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  ⚠️ Warning: Users will receive an error if their feedback contains flagged words
                </p>
              )}
            </div>
            <div className="ml-6">
              <button
                type="button"
                onClick={() => setEnableModeration(!enableModeration)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  enableModeration ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={enableModeration}
                id="enable-moderation"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enableModeration ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Notify Managers */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="notify-managers" className="text-base font-medium text-gray-900">
                Notify Managers on Feedback
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Automatically notify managers when their team members receive negative feedback.
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                onClick={() => setNotifyManagers(!notifyManagers)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  notifyManagers ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={notifyManagers}
                id="notify-managers"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifyManagers ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Weekly Digest */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="weekly-digest" className="text-base font-medium text-gray-900">
                Weekly Feedback Digest
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Generate and send weekly feedback summary to administrators every Monday.
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                onClick={() => setWeeklyDigest(!weeklyDigest)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  weeklyDigest ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={weeklyDigest}
                id="weekly-digest"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    weeklyDigest ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Performance Module Settings */}
        <div className="bg-white rounded-lg shadow mt-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Module Settings
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure the performance management module and its features
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Module Enabled */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="performance-enabled" className="text-base font-medium text-gray-900 flex items-center gap-2">
                  Enable Performance Module
                  {!performanceModuleEnabled && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded font-normal">
                      Module disabled
                    </span>
                  )}
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Master on/off switch for the entire performance management module. When disabled, the Performance tab will be hidden.
                </p>
              </div>
              <div className="ml-6">
                <button
                  type="button"
                  onClick={() => setPerformanceModuleEnabled(!performanceModuleEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    performanceModuleEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={performanceModuleEnabled}
                  id="performance-enabled"
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      performanceModuleEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Allow Self Goals */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="allow-self-goals" className="text-base font-medium text-gray-900">
                  Allow Self-Created Goals
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Allow employees to create their own performance goals and objectives.
                </p>
              </div>
              <div className="ml-6">
                <button
                  type="button"
                  onClick={() => setAllowSelfGoals(!allowSelfGoals)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    allowSelfGoals ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={allowSelfGoals}
                  id="allow-self-goals"
                  disabled={!performanceModuleEnabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      allowSelfGoals ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Require Goal Approval */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="require-goal-approval" className="text-base font-medium text-gray-900">
                  Require Goal Approval
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Self-created goals must be approved by manager before becoming active.
                </p>
              </div>
              <div className="ml-6">
                <button
                  type="button"
                  onClick={() => setRequireGoalApproval(!requireGoalApproval)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    requireGoalApproval ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={requireGoalApproval}
                  id="require-goal-approval"
                  disabled={!performanceModuleEnabled || !allowSelfGoals}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      requireGoalApproval ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Enable Peer Reviews */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="enable-peer-reviews" className="text-base font-medium text-gray-900">
                  Enable Peer Reviews
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Allow employees to submit peer reviews for their colleagues.
                </p>
              </div>
              <div className="ml-6">
                <button
                  type="button"
                  onClick={() => setEnablePeerReviews(!enablePeerReviews)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    enablePeerReviews ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={enablePeerReviews}
                  id="enable-peer-reviews"
                  disabled={!performanceModuleEnabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enablePeerReviews ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Allow Anonymous Peer */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="allow-anonymous-peer" className="text-base font-medium text-gray-900">
                  Allow Anonymous Peer Reviews
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Allow peer reviews to be submitted anonymously for more honest feedback.
                </p>
              </div>
              <div className="ml-6">
                <button
                  type="button"
                  onClick={() => setAllowAnonymousPeer(!allowAnonymousPeer)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    allowAnonymousPeer ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={allowAnonymousPeer}
                  id="allow-anonymous-peer"
                  disabled={!performanceModuleEnabled || !enablePeerReviews}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      allowAnonymousPeer ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Show KPI Trends */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="show-kpi-trends" className="text-base font-medium text-gray-900">
                  Show KPI Trend Charts
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Display KPI trend visualizations and historical data tracking.
                </p>
              </div>
              <div className="ml-6">
                <button
                  type="button"
                  onClick={() => setShowKpiTrends(!showKpiTrends)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    showKpiTrends ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={showKpiTrends}
                  id="show-kpi-trends"
                  disabled={!performanceModuleEnabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showKpiTrends ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Top Performer Threshold */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="top-performer-threshold" className="text-base font-medium text-gray-900">
                  Top Performer Badge Threshold
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Score threshold (0-100) for displaying top performer badge on profile ({topPerformerThreshold}%).
                </p>
                <div className="mt-3">
                  <input
                    type="range"
                    id="top-performer-threshold"
                    min="50"
                    max="100"
                    step="5"
                    value={topPerformerThreshold}
                    onChange={(e) => setTopPerformerThreshold(parseInt(e.target.value))}
                    disabled={!performanceModuleEnabled}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Monthly Reports */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="monthly-reports" className="text-base font-medium text-gray-900">
                  Generate Monthly Reports
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Automatically generate and email monthly performance summary to administrators.
                </p>
              </div>
              <div className="ml-6">
                <button
                  type="button"
                  onClick={() => setMonthlyReports(!monthlyReports)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    monthlyReports ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={monthlyReports}
                  id="monthly-reports"
                  disabled={!performanceModuleEnabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      monthlyReports ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification System Settings */}
        <div className="bg-white rounded-lg shadow mt-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notification System Settings
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure email and in-app notifications
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Email Notifications Enabled */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="email-notifications" className="text-base font-medium text-gray-900">
                  Enable Email Notifications
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Master toggle for all email notifications. Users can still control individual notification types.
                </p>
              </div>
              <div className="ml-6">
                <button
                  type="button"
                  onClick={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    emailNotificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={emailNotificationsEnabled}
                  id="email-notifications"
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      emailNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* In-App Notifications Enabled */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="inapp-notifications" className="text-base font-medium text-gray-900">
                  Enable In-App Notifications
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Show notifications in the notification bell. Users can control individual notification types in their profile.
                </p>
              </div>
              <div className="ml-6">
                <button
                  type="button"
                  onClick={() => setInappNotificationsEnabled(!inappNotificationsEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    inappNotificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={inappNotificationsEnabled}
                  id="inapp-notifications"
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      inappNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Daily Summary Enabled */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="daily-summary" className="text-base font-medium text-gray-900">
                  Daily Admin Summary
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Send daily digest email to administrators with system activity summary.
                </p>
              </div>
              <div className="ml-6">
                <button
                  type="button"
                  onClick={() => setDailySummaryEnabled(!dailySummaryEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    dailySummaryEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={dailySummaryEnabled}
                  id="daily-summary"
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      dailySummaryEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center px-4 py-2 rounded-md font-medium ${
              hasChanges && !saving
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
