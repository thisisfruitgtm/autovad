import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import Constants from 'expo-constants';

// Get configuration from environment variables or app.json
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   Constants.expoConfig?.extra?.supabaseUrl;

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                       Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your environment variables or app.json configuration.');
}

// console.log('🔧 Supabase Config:', {
//   url: supabaseUrl,
//   hasKey: !!supabaseAnonKey,
//   keyLength: supabaseAnonKey?.length
// });

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'Autovad-mobile-app',
    },
  },
  // React Native specific configuration
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});