import { api } from './authService';

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface PushToken {
  id: number;
  user_id: number;
  token: string;
  platform: string;
  device_info?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  user_id: number;
  // Task notifications
  email_task_assigned: boolean;
  email_task_completed: boolean;
  email_task_overdue: boolean;
  inapp_task_assigned: boolean;
  inapp_task_completed: boolean;
  inapp_task_overdue: boolean;
  push_task_assigned: boolean;
  push_task_completed: boolean;
  push_task_overdue: boolean;
  
  // Project notifications
  email_project_assigned: boolean;
  inapp_project_assigned: boolean;
  push_project_assigned: boolean;
  
  // Work notifications
  email_late_to_work: boolean;
  inapp_late_to_work: boolean;
  push_late_to_work: boolean;
  
  // Comment notifications
  email_comment_reply: boolean;
  inapp_comment_reply: boolean;
  push_comment_reply: boolean;
  
  // Review notifications
  email_task_reviewed: boolean;
  inapp_task_reviewed: boolean;
  push_task_reviewed: boolean;
  
  // Feedback notifications
  email_feedback_received: boolean;
  email_public_feedback: boolean;
  email_feedback_replied: boolean;
  inapp_feedback_received: boolean;
  inapp_public_feedback: boolean;
  inapp_feedback_replied: boolean;
  push_feedback_received: boolean;
  push_public_feedback: boolean;
  push_feedback_replied: boolean;
  
  // Review notifications
  email_peer_review: boolean;
  email_manager_review: boolean;
  email_review_due: boolean;
  inapp_peer_review: boolean;
  inapp_manager_review: boolean;
  inapp_review_due: boolean;
  push_peer_review: boolean;
  push_manager_review: boolean;
  push_review_due: boolean;
  
  // Goal notifications
  email_goal_approved: boolean;
  email_goal_rejected: boolean;
  inapp_goal_approved: boolean;
  inapp_goal_rejected: boolean;
  push_goal_approved: boolean;
  push_goal_rejected: boolean;
  
  // Leave notifications
  email_leave_approved: boolean;
  email_leave_rejected: boolean;
  inapp_leave_approved: boolean;
  inapp_leave_rejected: boolean;
  push_leave_approved: boolean;
  push_leave_rejected: boolean;
  
  // Message notifications
  email_private_message: boolean;
  email_department_message: boolean;
  email_company_message: boolean;
  inapp_private_message: boolean;
  inapp_department_message: boolean;
  inapp_company_message: boolean;
  push_private_message: boolean;
  push_department_message: boolean;
  push_company_message: boolean;
  
  // Mention notifications
  email_mention: boolean;
  inapp_mention: boolean;
  push_mention: boolean;
}

export interface NotificationPreferencesUpdate {
  // Task notifications
  email_task_assigned?: boolean;
  email_task_completed?: boolean;
  email_task_overdue?: boolean;
  inapp_task_assigned?: boolean;
  inapp_task_completed?: boolean;
  inapp_task_overdue?: boolean;
  push_task_assigned?: boolean;
  push_task_completed?: boolean;
  push_task_overdue?: boolean;
  
  // Project notifications
  email_project_assigned?: boolean;
  inapp_project_assigned?: boolean;
  push_project_assigned?: boolean;
  
  // Work notifications
  email_late_to_work?: boolean;
  inapp_late_to_work?: boolean;
  push_late_to_work?: boolean;
  
  // Comment notifications
  email_comment_reply?: boolean;
  inapp_comment_reply?: boolean;
  push_comment_reply?: boolean;
  
  // Review notifications
  email_task_reviewed?: boolean;
  inapp_task_reviewed?: boolean;
  push_task_reviewed?: boolean;
  
  // Feedback notifications
  email_feedback_received?: boolean;
  email_public_feedback?: boolean;
  email_feedback_replied?: boolean;
  inapp_feedback_received?: boolean;
  inapp_public_feedback?: boolean;
  inapp_feedback_replied?: boolean;
  push_feedback_received?: boolean;
  push_public_feedback?: boolean;
  push_feedback_replied?: boolean;
  
  // Review notifications
  email_peer_review?: boolean;
  email_manager_review?: boolean;
  email_review_due?: boolean;
  inapp_peer_review?: boolean;
  inapp_manager_review?: boolean;
  inapp_review_due?: boolean;
  push_peer_review?: boolean;
  push_manager_review?: boolean;
  push_review_due?: boolean;
  
  // Goal notifications
  email_goal_approved?: boolean;
  email_goal_rejected?: boolean;
  inapp_goal_approved?: boolean;
  inapp_goal_rejected?: boolean;
  push_goal_approved?: boolean;
  push_goal_rejected?: boolean;
  
  // Leave notifications
  email_leave_approved?: boolean;
  email_leave_rejected?: boolean;
  inapp_leave_approved?: boolean;
  inapp_leave_rejected?: boolean;
  push_leave_approved?: boolean;
  push_leave_rejected?: boolean;
  
  // Message notifications
  email_private_message?: boolean;
  email_department_message?: boolean;
  email_company_message?: boolean;
  inapp_private_message?: boolean;
  inapp_department_message?: boolean;
  inapp_company_message?: boolean;
  push_private_message?: boolean;
  push_department_message?: boolean;
  push_company_message?: boolean;
  
  // Mention notifications
  email_mention?: boolean;
  inapp_mention?: boolean;
  push_mention?: boolean;
}

export const notificationService = {
  // Get notifications
  getNotifications: async (limit: number = 50, unreadOnly: boolean = false): Promise<Notification[]> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (unreadOnly) params.append('unread_only', 'true');
    
    const response = await api.get(`/api/v1/notifications?${params}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/api/v1/notifications/unread-count');
    return response.data.unread_count;
  },

  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<void> => {
    await api.patch(`/api/v1/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<number> => {
    const response = await api.patch('/api/v1/notifications/mark-all-read');
    return response.data.updated_count;
  },

  // Push token management
  registerPushToken: async (token: string, platform: string, deviceInfo?: Record<string, any>): Promise<PushToken> => {
    const response = await api.post('/api/v1/notifications/push-tokens', {
      token,
      platform,
      device_info: deviceInfo
    });
    return response.data;
  },

  unregisterPushToken: async (token: string): Promise<void> => {
    await api.delete(`/api/v1/notifications/push-tokens/${token}`);
  },

  // Notification preferences
  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await api.get('/api/v1/notifications/preferences');
    return response.data;
  },

  updatePreferences: async (preferences: NotificationPreferencesUpdate): Promise<NotificationPreferences> => {
    const response = await api.patch('/api/v1/notifications/preferences', preferences);
    return response.data;
  },

  // Cleanup old notifications (admin only)
  cleanupOldNotifications: async (days: number = 30): Promise<number> => {
    const response = await api.delete(`/api/v1/notifications/cleanup?days=${days}`);
    return response.data.deleted_count;
  }
};

// Push notification utilities
export const pushNotificationUtils = {
  // Request notification permission
  requestPermission: async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }
    
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    
    if (Notification.permission === 'denied') {
      return 'denied';
    }
    
    const permission = await Notification.requestPermission();
    return permission;
  },

  // Register service worker for push notifications
  registerServiceWorker: async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported');
      return null;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  },

  // Subscribe to push notifications
  subscribeToPush: async (): Promise<PushSubscription | null> => {
    const registration = await pushNotificationUtils.registerServiceWorker();
    if (!registration) {
      console.warn('Service worker not available');
      return null;
    }
    
    // Check if VAPID key is configured
    if (!process.env.REACT_APP_VAPID_PUBLIC_KEY) {
      console.warn('Push notifications not configured (missing VAPID key). In-app notifications will still work.');
      return null;
    }
    
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });
      
      // Send subscription to server
      const subscriptionData = subscription.toJSON();
      await notificationService.registerPushToken(
        JSON.stringify(subscriptionData),
        'web',
        {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        }
      );
      
      return subscription;
    } catch (error) {
      console.warn('Push notifications not available (VAPID key not configured). In-app notifications will still work.');
      return null;
    }
  },

  // Unsubscribe from push notifications
  unsubscribeFromPush: async (): Promise<void> => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await notificationService.unregisterPushToken(JSON.stringify(subscription.toJSON()));
      }
    }
  }
};