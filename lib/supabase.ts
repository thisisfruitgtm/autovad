import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import Constants from 'expo-constants';
import { SecurityValidator, DeviceSecurity, SecurityMonitor } from './security';

// Get configuration from environment variables or app.json
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   Constants.expoConfig?.extra?.supabaseUrl;

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                       Constants.expoConfig?.extra?.supabaseAnonKey;

// Security: Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Missing Supabase credentials. Please check your environment variables or app.json configuration.');
  SecurityMonitor.recordFailedAttempt('supabase_config', 'Missing credentials');
  throw error;
}

// Security: Validate URL format
if (!SecurityValidator.validateUrl(supabaseUrl)) {
  const error = new Error('Invalid Supabase URL format');
  SecurityMonitor.recordFailedAttempt('supabase_config', 'Invalid URL format');
  throw error;
}

// Security: Validate key format (basic check)
if (supabaseAnonKey.length < 100) {
  const error = new Error('Invalid Supabase key format');
  SecurityMonitor.recordFailedAttempt('supabase_config', 'Invalid key format');
  throw error;
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
      ...DeviceSecurity.getSecureHeaders(),
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

// Security: Add auth state change listener for monitoring
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('🔐 User signed in successfully');
  } else if (event === 'SIGNED_OUT') {
    console.log('🔐 User signed out');
    // Clear any sensitive data
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('🔐 Token refreshed');
  } else if (event === 'USER_UPDATED') {
    console.log('🔐 User updated');
  }
});

// Export a secure wrapper for common operations
export const secureSupabase = {
  // Secure query wrapper
  async secureQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    context: string
  ): Promise<{ data: T | null; error: any }> {
    try {
      const result = await queryFn();
      
      if (result.error) {
        SecurityMonitor.recordFailedAttempt(`supabase_${context}`, result.error.message);
      }
      
      return result;
    } catch (error) {
      SecurityMonitor.recordFailedAttempt(`supabase_${context}`, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  },

  // Secure insert wrapper
  async secureInsert<T>(
    table: string,
    data: any,
    context: string
  ): Promise<{ data: T[] | null; error: any }> {
    // Security: Sanitize input data
    const sanitizedData = SecurityValidator.sanitizeObject(data);
    
    return this.secureQuery(
      async () => await supabase.from(table).insert(sanitizedData).select(),
      context
    );
  },

  // Secure update wrapper
  async secureUpdate<T>(
    table: string,
    data: any,
    filter: any,
    context: string
  ): Promise<{ data: T[] | null; error: any }> {
    // Security: Sanitize input data
    const sanitizedData = SecurityValidator.sanitizeObject(data);
    const sanitizedFilter = SecurityValidator.sanitizeObject(filter);
    
    return this.secureQuery(
      async () => await supabase.from(table).update(sanitizedData).match(sanitizedFilter).select(),
      context
    );
  },

  // Secure delete wrapper
  async secureDelete<T>(
    table: string,
    filter: any,
    context: string
  ): Promise<{ data: T[] | null; error: any }> {
    // Security: Sanitize filter
    const sanitizedFilter = SecurityValidator.sanitizeObject(filter);
    
    return this.secureQuery(
      async () => await supabase.from(table).delete().match(sanitizedFilter).select(),
      context
    );
  },
};