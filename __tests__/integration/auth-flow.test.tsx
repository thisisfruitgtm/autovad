import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

// Mock components for testing
const MockLoginScreen = () => {
  const { signIn, signUp, signInWithGoogle, loading } = useAuth();
  
  return (
    <View>
      <TouchableOpacity
        testID="email-signin-button"
        onPress={() => signIn('test@example.com', 'password123')}
        disabled={loading}
      >
        <Text>{loading ? 'Loading...' : 'Sign In with Email'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="email-signup-button"
        onPress={() => signUp('newuser@example.com', 'password123', 'New User')}
        disabled={loading}
      >
        <Text>{loading ? 'Loading...' : 'Sign Up with Email'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="google-signin-button"
        onPress={() => signInWithGoogle()}
        disabled={loading}
      >
        <Text>{loading ? 'Loading...' : 'Sign In with Google'}</Text>
      </TouchableOpacity>
      
      <Text testID="error-message">Error placeholder</Text>
    </View>
  );
};

const MockProtectedScreen = () => {
  const { user, signOut } = useAuth();
  
  if (!user) {
    return <Text testID="not-authenticated">Please log in</Text>;
  }
  
  return (
    <View>
      <Text testID="welcome-message">Welcome, {user.email}!</Text>
      <TouchableOpacity testID="signout-button" onPress={signOut}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  describe('Email Authentication Flow', () => {
    it('should complete sign in flow successfully', async () => {
      // Mock successful sign in
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' },
          },
          session: { access_token: 'test-token' },
        },
        error: null,
      });

      const { getByTestId, queryByTestId } = render(<MockLoginScreen />);

      // Initial state
      expect(getByTestId('email-signin-button')).toBeTruthy();
      expect(queryByTestId('error-message')).toBeNull();

      // Trigger sign in
      fireEvent.press(getByTestId('email-signin-button'));

      // Should show loading state
      await waitFor(() => {
        expect(getByTestId('email-signin-button')).toHaveTextContent('Loading...');
      });

      // Should complete successfully
      await waitFor(() => {
        expect(getByTestId('email-signin-button')).toHaveTextContent('Sign In with Email');
        expect(queryByTestId('error-message')).toBeNull();
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle sign in error gracefully', async () => {
      // Mock sign in error
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const { getByTestId } = render(<MockLoginScreen />);

      fireEvent.press(getByTestId('email-signin-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toHaveTextContent('Invalid credentials');
      });
    });

    it('should complete sign up flow successfully', async () => {
      // Mock successful sign up
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: {
          user: {
            id: 'user-2',
            email: 'newuser@example.com',
            user_metadata: { full_name: 'New User' },
          },
          session: null, // Usually null for email confirmation
        },
        error: null,
      });

      const { getByTestId, queryByTestId } = render(<MockLoginScreen />);

      fireEvent.press(getByTestId('email-signup-button'));

      await waitFor(() => {
        expect(queryByTestId('error-message')).toBeNull();
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: { full_name: 'New User' },
        },
      });
    });
  });

  describe('Google OAuth Flow', () => {
    it('should complete Google sign in flow successfully', async () => {
      // Mock successful OAuth
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: 'https://oauth-url.com' },
        error: null,
      });

      const { getByTestId } = render(<MockLoginScreen />);

      fireEvent.press(getByTestId('google-signin-button'));

      await waitFor(() => {
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: 'test://redirect',
          },
        });
      });
    });

    it('should handle OAuth error gracefully', async () => {
      // Mock OAuth error
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: null },
        error: { message: 'OAuth provider error' },
      });

      const { getByTestId } = render(<MockLoginScreen />);

      fireEvent.press(getByTestId('google-signin-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toHaveTextContent('OAuth provider error');
      });
    });
  });

  describe('Authentication State Management', () => {
    it('should show protected content when authenticated', async () => {
      // Mock authenticated user
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' },
          },
        },
        error: null,
      });

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token',
            user: {
              id: 'user-1',
              email: 'test@example.com',
            },
          },
        },
        error: null,
      });

      const { getByTestId, queryByTestId } = render(<MockProtectedScreen />);

      await waitFor(() => {
        expect(getByTestId('welcome-message')).toHaveTextContent('Welcome, test@example.com!');
        expect(getByTestId('signout-button')).toBeTruthy();
        expect(queryByTestId('not-authenticated')).toBeNull();
      });
    });

    it('should show login prompt when not authenticated', async () => {
      // Mock no user
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { getByTestId, queryByTestId } = render(<MockProtectedScreen />);

      await waitFor(() => {
        expect(getByTestId('not-authenticated')).toHaveTextContent('Please log in');
        expect(queryByTestId('welcome-message')).toBeNull();
        expect(queryByTestId('signout-button')).toBeNull();
      });
    });

    it('should complete sign out flow successfully', async () => {
      // Mock sign out
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      // Start with authenticated user
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      const { getByTestId, rerender } = render(<MockProtectedScreen />);

      await waitFor(() => {
        expect(getByTestId('welcome-message')).toBeTruthy();
      });

      // Trigger sign out
      fireEvent.press(getByTestId('signout-button'));

      // Mock user as null after sign out
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Re-render to reflect state change
      rerender(<MockProtectedScreen />);

      await waitFor(() => {
        expect(supabase.auth.signOut).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors during authentication', async () => {
      // Mock network error
      (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(
        new Error('Network request failed')
      );

      const { getByTestId } = render(<MockLoginScreen />);

      fireEvent.press(getByTestId('email-signin-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toHaveTextContent('Network request failed');
      });
    });

    it('should prevent multiple simultaneous sign in attempts', async () => {
      // Mock slow sign in
      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise(resolve => {
        resolveSignIn = resolve;
      });
      (supabase.auth.signInWithPassword as jest.Mock).mockReturnValue(signInPromise);

      const { getByTestId } = render(<MockLoginScreen />);

      // First attempt
      fireEvent.press(getByTestId('email-signin-button'));

      await waitFor(() => {
        expect(getByTestId('email-signin-button')).toHaveTextContent('Loading...');
      });

      // Second attempt should be ignored
      fireEvent.press(getByTestId('email-signin-button'));

      // Should still be loading
      expect(getByTestId('email-signin-button')).toHaveTextContent('Loading...');
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(1);

      // Resolve the promise
      resolveSignIn!({
        data: { user: null, session: null },
        error: { message: 'Test complete' },
      });
    });

    it('should clear errors when starting new authentication attempt', async () => {
      // Mock initial error
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Initial error' },
      });

      const { getByTestId } = render(<MockLoginScreen />);

      // First attempt with error
      fireEvent.press(getByTestId('email-signin-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toHaveTextContent('Initial error');
      });

      // Mock successful second attempt
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {
          user: { id: 'user-1', email: 'test@example.com' },
          session: { access_token: 'test-token' },
        },
        error: null,
      });

      // Second attempt
      fireEvent.press(getByTestId('email-signin-button'));

      await waitFor(() => {
        // Error should be cleared
        expect(getByTestId('email-signin-button')).toHaveTextContent('Loading...');
      });

      await waitFor(() => {
        // Should complete successfully without error
        expect(getByTestId('email-signin-button')).toHaveTextContent('Sign In with Email');
      });
    });
  });

  describe('Session Management', () => {
    it('should handle session expiration gracefully', async () => {
      // Mock expired session
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired' },
      });

      const { getByTestId } = render(<MockProtectedScreen />);

      await waitFor(() => {
        expect(getByTestId('not-authenticated')).toBeTruthy();
      });
    });

    it('should refresh session automatically', async () => {
      // Mock session refresh
      const mockSubscription = {
        data: { subscription: { unsubscribe: jest.fn() } },
      };
      
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue(mockSubscription);

      render(<MockProtectedScreen />);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });
}); 