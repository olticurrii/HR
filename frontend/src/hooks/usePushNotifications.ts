import { useState, useEffect, useCallback } from 'react';
import { notificationService, pushNotificationUtils } from '../services/notificationService';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: 'Notification' in window && 'serviceWorker' in navigator,
    permission: 'default',
    isSubscribed: false,
    isLoading: false,
    error: null
  });

  // Check initial state
  useEffect(() => {
    if (state.isSupported) {
      setState(prev => ({
        ...prev,
        permission: Notification.permission
      }));
      
      // Check if already subscribed
      checkSubscriptionStatus();
    }
  }, [state.isSupported]);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!state.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setState(prev => ({
          ...prev,
          isSubscribed: !!subscription
        }));
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }, [state.isSupported]);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Push notifications not supported' }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const permission = await pushNotificationUtils.requestPermission();
      setState(prev => ({ ...prev, permission, isLoading: false }));
      
      return permission === 'granted';
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to request permission' 
      }));
      return false;
    }
  }, [state.isSupported]);

  const subscribe = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Push notifications not supported in this browser' }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Permission denied. You can still receive in-app notifications.' 
        }));
        return false;
      }

      // Subscribe to push notifications
      const subscription = await pushNotificationUtils.subscribeToPush();
      
      if (subscription) {
        setState(prev => ({ 
          ...prev, 
          isSubscribed: true, 
          isLoading: false,
          error: null
        }));
        return true;
      } else {
        // Push not configured, but that's okay - in-app still works
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Push notifications not configured. In-app notifications are working.' 
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Push notifications not configured. In-app notifications are working.' 
      }));
      return false;
    }
  }, [state.isSupported, requestPermission]);

  const unsubscribe = useCallback(async () => {
    if (!state.isSupported) return false;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await pushNotificationUtils.unsubscribeFromPush();
      
      setState(prev => ({ 
        ...prev, 
        isSubscribed: false, 
        isLoading: false 
      }));
      
      return true;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to unsubscribe from push notifications' 
      }));
      return false;
    }
  }, [state.isSupported]);

  const toggleSubscription = useCallback(async () => {
    if (state.isSubscribed) {
      return await unsubscribe();
    } else {
      return await subscribe();
    }
  }, [state.isSubscribed, subscribe, unsubscribe]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    toggleSubscription,
    checkSubscriptionStatus
  };
};
