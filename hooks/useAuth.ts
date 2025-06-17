import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (data.user && !error) {
      // Create user profile
      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email!,
        name,
      });
    }

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signInWithGoogle = async () => {
    try {
      const redirectTo = makeRedirectUri({ native: 'autovad://auth/callback' });
      console.log('[Auth] Using redirect URL:', redirectTo);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) throw error;
      if (data?.url) {
        await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      }
    } catch (error) {
      console.error('[Auth] Error in signInWithGoogle:', error);
      return { error };
    }
  };

  const handleAuthCallback = async (url: string) => {
    try {
      console.log('[Auth] Handling auth callback with URL:', url);
      
      // Extract the code from the URL
      const { queryParams } = Linking.parse(url);
      const code = queryParams?.code as string;
      const state = queryParams?.state as string;
      
      console.log('[Auth] Extracted code and state:', { 
        code: code ? 'Present' : 'Not found',
        state: state ? 'Present' : 'Not found'
      });
      
      // Verify state
      const savedState = await AsyncStorage.getItem('oauth_state');
      console.log('[Auth] Verifying state:', { 
        received: state,
        saved: savedState,
        match: state === savedState
      });
      
      if (state !== savedState) {
        throw new Error('Invalid state parameter');
      }
      
      // Exchange the code for a session directly with Supabase
      console.log('[Auth] Exchanging code for session...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('[Auth] Error exchanging code for session:', error);
        throw error;
      }

      console.log('[Auth] Session exchange successful:', {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email
        } : null,
        session: data.session ? 'Present' : null
      });
      
      // Clear the state
      await AsyncStorage.removeItem('oauth_state');
      
      // Navigate to the appropriate screen
      console.log('[Auth] Navigating to home screen...');
      router.replace('/');
      
      return { session: data.session, user: data.user };
    } catch (error) {
      console.error('[Auth] Error in handleAuthCallback:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return {
    session,
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    handleAuthCallback,
    signOut,
  };
}