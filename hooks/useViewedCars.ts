import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIEWED_CARS_KEY = 'viewed_cars_count';
const MIN_VIEWS_BEFORE_LOGIN = 500;

export function useViewedCars() {
  const [viewedCount, setViewedCount] = useState(0);
  const [shouldShowLogin, setShouldShowLogin] = useState(false);
  const [hasShownLogin, setHasShownLogin] = useState(false);

  useEffect(() => {
    loadViewedCount();
    // Removed automatic reset - only reset manually for testing
  }, []);

  const loadViewedCount = async () => {
    try {
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AsyncStorage timeout')), 1000)
      );
      
      const storagePromise = AsyncStorage.getItem(VIEWED_CARS_KEY);
      
      const stored = await Promise.race([storagePromise, timeoutPromise]) as string | null;
      let count = stored ? parseInt(stored, 10) : 0;
      
      // Reset if count is unreasonably high (like 633)
      if (count > MIN_VIEWS_BEFORE_LOGIN * 2) {
        count = 0;
        try {
          const resetPromise = AsyncStorage.setItem(VIEWED_CARS_KEY, '0');
          await Promise.race([resetPromise, timeoutPromise]);
        } catch {
          // Silently fail on reset
        }
      }
      
      setViewedCount(count);
      
      // Check if should show login modal
      if (count >= MIN_VIEWS_BEFORE_LOGIN) {
        setShouldShowLogin(true);
      }
    } catch (error) {
      // Silently fallback to defaults without logging
      setViewedCount(0);
    }
  };

  const incrementViewedCount = async () => {
    try {
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AsyncStorage timeout')), 1000)
      );
      
      // Get the current count from AsyncStorage to ensure accuracy
      const storagePromise = AsyncStorage.getItem(VIEWED_CARS_KEY);
      const stored = await Promise.race([storagePromise, timeoutPromise]) as string | null;
      const currentCount = stored ? parseInt(stored, 10) : 0;
      
      // Don't increment beyond the limit
      if (currentCount >= MIN_VIEWS_BEFORE_LOGIN) {
        setShouldShowLogin(true);
        return;
      }
      
      const newCount = currentCount + 1;
      
      // Update state immediately
      setViewedCount(newCount);
      
      // Try to save to storage with timeout
      try {
        const savePromise = AsyncStorage.setItem(VIEWED_CARS_KEY, newCount.toString());
        await Promise.race([savePromise, timeoutPromise]);
      } catch {
        // Silently fail - state is already updated
      }
      
      if (newCount >= MIN_VIEWS_BEFORE_LOGIN && !hasShownLogin) {
        setShouldShowLogin(true);
        setHasShownLogin(true);
      }
    } catch (error) {
      // Silently fail - use session state only
    }
  };

  const resetViewedCount = async () => {
    try {
      // Update state immediately
      setViewedCount(0);
      setShouldShowLogin(false);
      setHasShownLogin(false);
      
      // Try to clear storage with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AsyncStorage timeout')), 1000)
      );
      
      const removePromise = AsyncStorage.removeItem(VIEWED_CARS_KEY);
      await Promise.race([removePromise, timeoutPromise]);
    } catch (error) {
      // Silently fail - state is already reset
    }
  };

  return {
    viewedCount,
    shouldShowLogin,
    incrementViewedCount,
    resetViewedCount,
    minViewsRequired: MIN_VIEWS_BEFORE_LOGIN,
  };
} 