import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '../hooks/useOnboarding';
import { router } from 'expo-router';
import '../lib/i18n'; // Initialize i18n

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  useFrameworkReady();
  const { loading: authLoading, user } = useAuth();
  const { hasCompletedOnboarding, loading: onboardingLoading } = useOnboarding();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if ((fontsLoaded || fontError) && !authLoading && !onboardingLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, authLoading, onboardingLoading]);

  useEffect(() => {
    // console.log('🔄 RootLayout: Navigation check', {
    //   isLayoutReady,
    //   fontsLoaded: fontsLoaded || fontError,
    //   authLoading,
    //   onboardingLoading,
    //   user: !!user,
    //   hasCompletedOnboarding
    // });

    if (isLayoutReady && (fontsLoaded || fontError) && !authLoading && !onboardingLoading) {
      // Handle initial routing only after layout is ready
      if (!user && hasCompletedOnboarding === false) {
        // First time user - show onboarding
        // console.log('🚀 RootLayout: Navigating to onboarding');
        router.replace('/(onboarding)/intro');
      } else if (!user && hasCompletedOnboarding === true) {
        // Returning user without auth - allow them to browse first
        // console.log('🚀 RootLayout: Navigating to tabs (returning user)');
        router.replace('/(tabs)');
      } else if (user) {
        // Authenticated user - show main app
        // console.log('🚀 RootLayout: Navigating to tabs (authenticated user)');
        router.replace('/(tabs)');
      }
    }
  }, [isLayoutReady, fontsLoaded, fontError, authLoading, onboardingLoading, user, hasCompletedOnboarding]);

  useEffect(() => {
    // Set layout as ready after a small delay to ensure mounting is complete
    const timer = setTimeout(() => {
      // console.log('✅ RootLayout: Layout ready');
      setIsLayoutReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if ((!fontsLoaded && !fontError) || authLoading || onboardingLoading) {
    // console.log('⏳ RootLayout: Still loading...', {
    //   fontsLoaded: fontsLoaded || fontError,
    //   authLoading,
    //   onboardingLoading
    // });
    return null;
  }

  // console.log('🎨 RootLayout: Rendering Stack');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="car/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}