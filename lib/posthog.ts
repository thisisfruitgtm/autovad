import PostHog from 'posthog-react-native';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Localization from 'expo-localization';

// PostHog configuration for cross-platform tracking
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

// Validate API key
if (!POSTHOG_API_KEY) {
  console.warn('⚠️ PostHog API key not found. Analytics will be disabled.');
}

// Initialize PostHog with error handling
export const posthog = POSTHOG_API_KEY 
  ? new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
    })
  : null;

// Helper function to identify user with cross-platform properties
export const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
  if (!posthog) return;
  
  try {
    posthog.identify(userId, {
      // Platform-specific properties
      platform: Platform.OS,
      platform_version: Platform.Version,
      app_version: Application.nativeApplicationVersion,
      app_build: Application.nativeBuildVersion,
      device_model: Device.modelName,
      device_os: Device.osVersion,
      device_brand: Device.brand,
      device_manufacturer: Device.manufacturer,
      locale: Localization.locale,
      timezone: Localization.timezone,
      // Cross-platform user properties
      ...userProperties,
    });
  } catch (error) {
    console.error('PostHog identify error:', error);
  }
};

// Helper function to track events with cross-platform context
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (!posthog) return;
  
  try {
    posthog.capture(eventName, {
      // Platform context
      platform: Platform.OS,
      platform_version: Platform.Version,
      app_version: Application.nativeApplicationVersion,
      device_model: Device.modelName,
      device_os: Device.osVersion,
      locale: Localization.locale,
      // Event properties
      ...properties,
      // Timestamp
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('PostHog track error:', error);
  }
};

// Helper function to set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (!posthog) return;
  
  try {
    // Use identify with empty userId to set properties for current user
    posthog.identify('', properties);
  } catch (error) {
    console.error('PostHog setUserProperties error:', error);
  }
};

// Helper function to reset user (on logout)
export const resetUser = () => {
  if (!posthog) return;
  
  try {
    posthog.reset();
  } catch (error) {
    console.error('PostHog reset error:', error);
  }
};

// Helper function to track screen views
export const trackScreen = (screenName: string, properties?: Record<string, any>) => {
  trackEvent('screen_viewed', {
    screen_name: screenName,
    ...properties,
  });
};

// Helper function to track car events
export const trackCarEvent = (eventType: string, carData: any) => {
  trackEvent(`car_${eventType}`, {
    car_id: carData.id,
    car_make: carData.make,
    car_model: carData.model,
    car_year: carData.year,
    car_price: carData.price,
    ...carData,
  });
};

// Helper function to track auth events
export const trackAuthEvent = (action: string, method?: string, success?: boolean, error?: string) => {
  trackEvent('auth_action', {
    action,
    method,
    success,
    error,
  });
};

// Helper function to track search events
export const trackSearchEvent = (query: string, filters?: any, resultsCount?: number) => {
  trackEvent('search_performed', {
    query,
    filters,
    results_count: resultsCount,
  });
}; 