import { useCallback } from 'react';
import { analytics } from '@/lib/analytics';

export const useAnalytics = () => {
  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, properties);
  }, []);

  const identify = useCallback((userId: string, userProperties?: Record<string, any>) => {
    analytics.identify(userId, userProperties);
  }, []);

  const setUserProperties = useCallback((properties: Record<string, any>) => {
    analytics.setUserProperties(properties);
  }, []);

  const trackScreen = useCallback((screenName: string, properties?: Record<string, any>) => {
    analytics.trackScreen(screenName, properties);
  }, []);

  const trackCarView = useCallback((carId: string, carData?: any) => {
    analytics.trackCarView(carId, carData);
  }, []);

  const trackCarLike = useCallback((carId: string, carData?: any) => {
    analytics.trackCarLike(carId, carData);
  }, []);

  const trackCarPost = useCallback((carData?: any) => {
    analytics.trackCarPost(carData);
  }, []);

  const trackLogin = useCallback((method: string) => {
    analytics.trackLogin(method);
  }, []);

  const trackLogout = useCallback(() => {
    analytics.trackLogout();
  }, []);

  const trackSignup = useCallback((method: string) => {
    analytics.trackSignup(method);
  }, []);

  return {
    track,
    identify,
    setUserProperties,
    trackScreen,
    trackCarView,
    trackCarLike,
    trackCarPost,
    trackLogin,
    trackLogout,
    trackSignup,
  };
}; 