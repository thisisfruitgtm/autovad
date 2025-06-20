import { supabase } from './supabase';
import { trackEvent, identifyUser, setUserProperties } from './posthog';

export async function logActivity(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: any
) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    });

    // Also track with PostHog
    trackEvent('activity_logged', {
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

export async function getActivityLogs(userId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
}

// PostHog specific functions
export const analytics = {
  // Track user identification
  identify: (userId: string, userProperties?: Record<string, any>) => {
    identifyUser(userId, userProperties);
  },

  // Track custom events
  track: (eventName: string, properties?: Record<string, any>) => {
    trackEvent(eventName, properties);
  },

  // Set user properties
  setUserProperties: (properties: Record<string, any>) => {
    setUserProperties(properties);
  },

  // Track screen views
  trackScreen: (screenName: string, properties?: Record<string, any>) => {
    trackEvent('screen_viewed', {
      screen_name: screenName,
      ...properties,
    });
  },

  // Track car-related events
  trackCarView: (carId: string, carData?: any) => {
    trackEvent('car_viewed', {
      car_id: carId,
      ...carData,
    });
  },

  trackCarLike: (carId: string, carData?: any) => {
    trackEvent('car_liked', {
      car_id: carId,
      ...carData,
    });
  },

  trackCarPost: (carData?: any) => {
    trackEvent('car_posted', carData);
  },

  // Track auth events
  trackLogin: (method: string) => {
    trackEvent('user_login', { method });
  },

  trackLogout: () => {
    trackEvent('user_logout');
  },

  trackSignup: (method: string) => {
    trackEvent('user_signup', { method });
  },
};