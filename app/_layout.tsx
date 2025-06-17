import React, { useEffect, useState } from 'react';
import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { router } from 'expo-router';
import '../lib/i18n'; // Initialize i18n
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  useFrameworkReady();
  const { loading: authLoading, user, session, handleAuthCallback } = useAuth();
  const { hasCompletedOnboarding, loading: onboardingLoading } = useOnboarding();
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    // Add your fonts here
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Set layout as ready after initial mount
    setIsLayoutReady(true);
  }, []);

  useEffect(() => {
    if (!isLayoutReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    // If user has completed onboarding, allow them to access the main feed (preview mode)
    // Only redirect to login if they're trying to access auth screens while authenticated
    if (session && inAuthGroup) {
      // User is authenticated but on auth screens - redirect to main feed
      router.replace('/');
    } else if (!session && !hasCompletedOnboarding && !inOnboardingGroup) {
      // User hasn't completed onboarding - start onboarding flow
      router.replace('/(onboarding)/intro');
    } else if (!session && hasCompletedOnboarding && inAuthGroup) {
      // User completed onboarding but is on auth screen - redirect to main feed (preview mode)
      router.replace('/');
    }
    
    // Allow access to main feed for users who completed onboarding (authenticated or not)
    // The useViewedCars hook in the feed will handle showing login prompts when needed
  }, [session, segments, isLayoutReady, hasCompletedOnboarding]);

  useEffect(() => {
    if (!isLayoutReady) return;

    // Handle deep links for authentication
    const subscription = Linking.addEventListener('url', async (event) => {
      console.log('[Layout] Deep link received:', event.url);
      
      // Check if this is an auth callback (check for common OAuth parameters)
      if (event.url.includes('auth/callback') || 
          event.url.includes('access_token') || 
          event.url.includes('code=') ||
          event.url.includes('error=')) {
        console.log('[Layout] Auth callback detected, handling...');
        try {
          await handleAuthCallback(event.url);
        } catch (error) {
          console.error('[Layout] Error handling auth callback:', error);
          router.replace('/(auth)/login');
        }
      }
    });

    // Also check if we opened via a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('[Layout] Initial URL:', url);
        if (url.includes('auth/callback') || 
            url.includes('access_token') || 
            url.includes('code=') ||
            url.includes('error=')) {
          console.log('[Layout] Initial auth callback detected, handling...');
          handleAuthCallback(url).catch((error) => {
            console.error('[Layout] Error handling initial auth callback:', error);
            router.replace('/(auth)/login');
          });
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [handleAuthCallback, isLayoutReady]);

  if (!isLayoutReady || (!fontsLoaded && !fontError) || authLoading || onboardingLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          },
          headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        }}
      >
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="car/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="debug-oauth" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}