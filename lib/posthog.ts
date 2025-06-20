import PostHog from 'posthog-react-native';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Localization from 'expo-localization';

// Initialize PostHog
export const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY!, {
  host: process.env.EXPO_PUBLIC_POSTHOG_HOST!,
});

// Helper function to identify user
export const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
  posthog.identify(userId, {
    platform: Platform.OS,
    app_version: Application.nativeApplicationVersion,
    device_model: Device.modelName,
    device_os: Device.osVersion,
    locale: Localization.locale,
    ...userProperties,
  });
};

// Helper function to track events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  posthog.capture(eventName, {
    platform: Platform.OS,
    app_version: Application.nativeApplicationVersion,
    ...properties,
  });
};

// Helper function to set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  // Use identify with empty userId to set properties for current user
  posthog.identify('', properties);
};

// Helper function to reset user (on logout)
export const resetUser = () => {
  posthog.reset();
}; 