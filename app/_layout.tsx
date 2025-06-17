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

    if (!session && !inAuthGroup) {
      // Redirect to the sign-in page if not signed in
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // Redirect to the home page if signed in
      router.replace('/');
    }
  }, [session, segments, isLayoutReady]);

  useEffect(() => {
    if (!isLayoutReady) return;

    // Handle deep links for authentication
    const subscription = Linking.addEventListener('url', async (event) => {
      console.log('Deep link received:', event.url);
      
      // Check if this is an auth callback
      if (event.url.includes('auth/callback')) {
        try {
          await handleAuthCallback(event.url);
        } catch (error) {
          console.error('Error handling auth callback:', error);
          router.replace('/login');
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
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}