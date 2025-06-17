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

  const signInWithGoogle = async (): Promise<{ session?: Session | null; user?: User | null; error?: unknown }> => {
    try {
      // Use different redirect URLs for development and production
      let redirectTo: string;
      
      if (__DEV__) {
        // For development, use a fixed scheme that doesn't depend on IP
        redirectTo = 'exp://localhost/--/auth/callback';
      } else {
        // For production, use the custom scheme
        redirectTo = makeRedirectUri({ 
          scheme: 'autovad',
          path: 'auth/callback'
        });
      }
      
      console.log('[Auth] Using redirect URL:', redirectTo);
      console.log('[Auth] Environment: ', __DEV__ ? 'Development' : 'Production');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      if (error) {
        console.error('[Auth] OAuth initiation error:', error);
        return { error };
      }
      
      if (data?.url) {
        console.log('[Auth] Opening OAuth URL:', data.url);
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        console.log('[Auth] WebBrowser result:', result);
        
        if (result.type === 'success' && result.url) {
          console.log('[Auth] Success URL received:', result.url);
          try {
            const authResult = await handleAuthCallback(result.url);
            return { session: authResult.session, user: authResult.user };
          } catch (callbackError) {
            console.error('[Auth] Callback handling error:', callbackError);
            return { error: callbackError };
          }
        } else if (result.type === 'cancel') {
          console.log('[Auth] User cancelled OAuth flow');
          return { error: new Error('User cancelled authentication') };
        } else {
          console.error('[Auth] Unexpected WebBrowser result:', result);
          return { error: new Error('Authentication flow failed') };
        }
      }
      
      return { error: new Error('No OAuth URL received from Supabase') };
    } catch (error) {
      console.error('[Auth] Error in signInWithGoogle:', error);
      return { error };
    }
  };

  const handleAuthCallback = async (url: string) => {
    try {
      console.log('[Auth] Handling auth callback with URL:', url);
      
      // Extract tokens directly from URL fragment or query params
      const { queryParams } = Linking.parse(url);
      
      // Check for tokens in URL fragment (common for implicit flow)
      let params = queryParams;
      if (url.includes('#')) {
        const fragmentPart = url.split('#')[1];
        if (fragmentPart) {
          const fragmentParams = new URLSearchParams(fragmentPart);
          params = Object.fromEntries(fragmentParams);
          console.log('[Auth] Found fragment params:', params);
        }
      }
      
      console.log('[Auth] URL params:', params);
      
      // Check for access_token and refresh_token (direct token response)
      if (params?.access_token && params?.refresh_token) {
        console.log('[Auth] Found tokens in URL, setting session...');
        
        const { data, error } = await supabase.auth.setSession({
          access_token: params.access_token as string,
          refresh_token: params.refresh_token as string,
        });
        
        if (error) {
          console.error('[Auth] Error setting session:', error);
          throw error;
        }
        
        console.log('[Auth] Session set successfully');
        router.replace('/(tabs)');
        return { session: data.session, user: data.user };
      }
      
      // Check for authorization code (PKCE flow)
      if (params?.code) {
        console.log('[Auth] Found authorization code, exchanging for session...');
        
        const { data, error } = await supabase.auth.exchangeCodeForSession(params.code as string);
        
        if (error) {
          console.error('[Auth] Error exchanging code for session:', error);
          throw error;
        }
        
        console.log('[Auth] Session exchange successful');
        router.replace('/(tabs)');
        return { session: data.session, user: data.user };
      }
      
      // Check for error in callback
      if (params?.error) {
        console.error('[Auth] OAuth error:', params.error, params.error_description);
        throw new Error(params.error_description as string || params.error as string);
      }
      
      console.warn('[Auth] No tokens or code found in callback URL');
      throw new Error('No authentication data found in callback');
      
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