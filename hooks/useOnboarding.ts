import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@Autovad_onboarding_completed';
const PREVIEW_CARS_VIEWED_KEY = '@Autovad_preview_cars_viewed';

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [previewCarsViewed, setPreviewCarsViewed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AsyncStorage timeout')), 1000)
      );
      
      const storagePromises = Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem(PREVIEW_CARS_VIEWED_KEY)
      ]);
      
      const [onboardingStatus, carsViewed] = await Promise.race([storagePromises, timeoutPromise]) as [string | null, string | null];
      
      setHasCompletedOnboarding(onboardingStatus === 'true');
      setPreviewCarsViewed(parseInt(carsViewed || '0', 10));
    } catch (error) {
      // Silently fallback to defaults without logging
      setHasCompletedOnboarding(false);
      setPreviewCarsViewed(0);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AsyncStorage timeout')), 1000)
      );
      
      const storagePromise = AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      
      await Promise.race([storagePromise, timeoutPromise]);
      setHasCompletedOnboarding(true);
    } catch (error) {
      // Silently fail - onboarding state will use session state
      setHasCompletedOnboarding(true);
    }
  };

  const incrementPreviewCarsViewed = async () => {
    try {
      const newCount = previewCarsViewed + 1;
      await AsyncStorage.setItem(PREVIEW_CARS_VIEWED_KEY, newCount.toString());
      setPreviewCarsViewed(newCount);
      return newCount;
    } catch (error) {
      console.error('Error incrementing preview cars viewed:', error);
      return previewCarsViewed;
    }
  };

  const resetPreviewCarsViewed = async () => {
    try {
      await AsyncStorage.setItem(PREVIEW_CARS_VIEWED_KEY, '0');
      setPreviewCarsViewed(0);
    } catch (error) {
      console.error('Error resetting preview cars viewed:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ONBOARDING_KEY),
        AsyncStorage.removeItem(PREVIEW_CARS_VIEWED_KEY)
      ]);
      setHasCompletedOnboarding(false);
      setPreviewCarsViewed(0);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  return {
    hasCompletedOnboarding,
    previewCarsViewed,
    loading,
    completeOnboarding,
    incrementPreviewCarsViewed,
    resetPreviewCarsViewed,
    resetOnboarding,
  };
}