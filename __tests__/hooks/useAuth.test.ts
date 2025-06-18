import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../../hooks/useAuth';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { 
          user: { 
            id: 'test-user-id', 
            email: 'test@example.com',
            user_metadata: {
              full_name: 'Test User',
              avatar_url: 'https://example.com/avatar.jpg'
            }
          } 
        },
        error: null
      })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('should handle user authentication', async () => {
    const { result } = renderHook(() => useAuth());
    
    // Wait for auth check to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeDefined();
  });

  it('should handle sign out', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.signOut();
    });
    
    expect(result.current.user).toBeNull();
  });

  it('should handle auth errors gracefully', async () => {
    // Mock error scenario
    const mockSupabase = require('@/lib/supabase').supabase;
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Auth error')
    });

    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });
}); 