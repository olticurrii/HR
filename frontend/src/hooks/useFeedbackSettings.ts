import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

export interface FeedbackSettings {
  feedback_allow_anonymous: boolean;
  feedback_enable_threading: boolean;
  feedback_enable_moderation: boolean;
  feedback_notify_managers: boolean;
  feedback_weekly_digest: boolean;
}

export const useFeedbackSettings = () => {
  const [settings, setSettings] = useState<FeedbackSettings>({
    feedback_allow_anonymous: true,
    feedback_enable_threading: true,
    feedback_enable_moderation: true,
    feedback_notify_managers: true,
    feedback_weekly_digest: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsService.getOrgSettings();
        setSettings({
          feedback_allow_anonymous: response.feedback_allow_anonymous,
          feedback_enable_threading: response.feedback_enable_threading,
          feedback_enable_moderation: response.feedback_enable_moderation,
          feedback_notify_managers: response.feedback_notify_managers,
          feedback_weekly_digest: response.feedback_weekly_digest,
        });
      } catch (error) {
        console.error('Failed to fetch feedback settings:', error);
        // Use defaults on error
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading };
};

