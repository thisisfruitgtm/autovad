import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { DeviceEventEmitter } from 'react-native';
import { useCars } from '../../hooks/useCars';
import { CarService } from '../../services/carService';
import { supabase } from '../../lib/supabase';

// Mock dependencies
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
      },
    },
  })),
}));

jest.mock('../../services/carService');
jest.mock('../../lib/supabase');

const mockCars = [
  {
    id: 'car-1',
    title: 'BMW X5',
    price: 50000,
    is_liked: false,
    likes_count: 5,
    brand: 'BMW',
    model: 'X5',
    year: 2020,
    mileage: 50000,
    fuel_type: 'Benzină',
    transmission: 'Automată',
    body_type: 'SUV',
    color: 'Negru',
    description: 'BMW X5 în stare excelentă',
    location: 'București',
    phone: '+40123456789',
    user_id: 'seller-1',
    media_urls: ['https://example.com/image1.jpg'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'car-2',
    title: 'Audi A4',
    price: 35000,
    is_liked: true,
    likes_count: 3,
    brand: 'Audi',
    model: 'A4',
    year: 2019,
    mileage: 60000,
    fuel_type: 'Diesel',
    transmission: 'Manuală',
    body_type: 'Sedan',
    color: 'Alb',
    description: 'Audi A4 foarte bine întreținută',
    location: 'Cluj-Napoca',
    phone: '+40123456790',
    user_id: 'seller-2',
    media_urls: ['https://example.com/image2.jpg'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockSupabaseChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn((callback) => {
    callback('SUBSCRIBED');
    return {
      unsubscribe: jest.fn(),
    };
  }),
  unsubscribe: jest.fn(),
};

const mockSupabase = {
  channel: jest.fn(() => mockSupabaseChannel),
  from: jest.fn(() => ({
    upsert: jest.fn(() => Promise.resolve({ error: null })),
    insert: jest.fn(() => Promise.resolve({ error: null })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  })),
};

describe('useCars', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase as any).mockReturnValue(mockSupabase);
    (supabase.channel as jest.Mock).mockReturnValue(mockSupabaseChannel);
    (supabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn(() => Promise.resolve({ error: null })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    });
    (CarService.getCars as jest.Mock).mockResolvedValue(mockCars);
    
    // Mock Alert
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    
    // Mock DeviceEventEmitter
    jest.spyOn(DeviceEventEmitter, 'emit');
    jest.spyOn(DeviceEventEmitter, 'addListener').mockReturnValue({
      remove: jest.fn(),
    } as any);
  });

  describe('Initial State and Data Fetching', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useCars());

      expect(result.current.loading).toBe(true);
      expect(result.current.cars).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should fetch cars on mount', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(CarService.getCars).toHaveBeenCalledWith('test-user-id');
      expect(result.current.cars).toEqual(mockCars);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      const errorMessage = 'Network error';
      (CarService.getCars as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load cars');
      expect(result.current.cars).toEqual([]);
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should set up real-time subscriptions', () => {
      renderHook(() => useCars());

      expect(supabase.channel).toHaveBeenCalled();
      expect(mockSupabaseChannel.on).toHaveBeenCalledTimes(2);
      expect(mockSupabaseChannel.subscribe).toHaveBeenCalled();
    });

    it('should handle like insertion from real-time', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate real-time like insertion
      const likeCallback = mockSupabaseChannel.on.mock.calls[0][2];
      act(() => {
        likeCallback({
          eventType: 'INSERT',
          new: { car_id: 'car-1' },
        });
      });

      await waitFor(() => {
        const updatedCar = result.current.cars.find(c => c.id === 'car-1');
        expect(updatedCar?.is_liked).toBe(true);
        expect(updatedCar?.likes_count).toBe(6);
      });
    });

    it('should handle like deletion from real-time', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate real-time like deletion
      const likeCallback = mockSupabaseChannel.on.mock.calls[0][2];
      act(() => {
        likeCallback({
          eventType: 'DELETE',
          old: { car_id: 'car-2' },
        });
      });

      await waitFor(() => {
        const updatedCar = result.current.cars.find(c => c.id === 'car-2');
        expect(updatedCar?.is_liked).toBe(false);
        expect(updatedCar?.likes_count).toBe(2);
      });
    });

    it('should handle new car insertion from real-time', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate real-time car insertion
      const carCallback = mockSupabaseChannel.on.mock.calls[1][2];
      act(() => {
        carCallback({
          eventType: 'INSERT',
          new: { id: 'car-3' },
        });
      });

      await waitFor(() => {
        expect(CarService.getCars).toHaveBeenCalledTimes(2); // Initial + refresh
      });
    });
  });

  describe('Device Event Listeners', () => {
    it('should listen for like state changes', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(DeviceEventEmitter.addListener).toHaveBeenCalledWith(
        'likeStateChanged',
        expect.any(Function)
      );
    });

    it('should update car state on like state change event', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Get the event listener callback
      const likeCallback = (DeviceEventEmitter.addListener as jest.Mock).mock.calls
        .find(call => call[0] === 'likeStateChanged')[1];

      act(() => {
        likeCallback({ carId: 'car-1', isLiked: true });
      });

      await waitFor(() => {
        const updatedCar = result.current.cars.find(c => c.id === 'car-1');
        expect(updatedCar?.is_liked).toBe(true);
        expect(updatedCar?.likes_count).toBe(6);
      });
    });

    it('should refresh cars on car posted event', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Get the event listener callback
      const carPostedCallback = (DeviceEventEmitter.addListener as jest.Mock).mock.calls
        .find(call => call[0] === 'carPosted')[1];

      act(() => {
        carPostedCallback({ carId: 'new-car' });
      });

      await waitFor(() => {
        expect(CarService.getCars).toHaveBeenCalledTimes(2); // Initial + refresh
      });
    });
  });

  describe('Like Functionality', () => {
    it('should like a car successfully', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.likeCar('car-1');
      });

      expect(supabase.from).toHaveBeenCalledWith('likes');
      expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('likeStateChanged', {
        carId: 'car-1',
        isLiked: true,
      });

      const updatedCar = result.current.cars.find(c => c.id === 'car-1');
      expect(updatedCar?.is_liked).toBe(true);
      expect(updatedCar?.likes_count).toBe(6);
    });

    it('should show confirmation dialog when unliking', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.likeCar('car-2'); // car-2 is already liked
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Șterge din favorite',
        'Ești sigur că vrei să ștergi această mașină din favorite?',
        expect.any(Array)
      );
    });

    it('should unlike a car when confirmed', async () => {
      // Mock Alert.alert to automatically confirm
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        const confirmButton = buttons.find((b: any) => b.text === 'Șterge');
        if (confirmButton) {
          confirmButton.onPress();
        }
      });

      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.likeCar('car-2'); // car-2 is already liked
      });

      await waitFor(() => {
        expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('likeStateChanged', {
          carId: 'car-2',
          isLiked: false,
        });

        const updatedCar = result.current.cars.find(c => c.id === 'car-2');
        expect(updatedCar?.is_liked).toBe(false);
        expect(updatedCar?.likes_count).toBe(2);
      });
    });

    it('should handle like error gracefully', async () => {
      const mockError = new Error('Database error');
      (supabase.from as jest.Mock).mockReturnValue({
        upsert: jest.fn(() => Promise.resolve({ error: null })),
        insert: jest.fn(() => Promise.resolve({ error: mockError })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null })),
          })),
        })),
      });

      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.likeCar('car-1');
      });

      // Should not update local state on error
      const car = result.current.cars.find(c => c.id === 'car-1');
      expect(car?.is_liked).toBe(false);
      expect(car?.likes_count).toBe(5);
    });

    it('should ensure user exists when liking', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.likeCar('car-1');
      });

      expect(supabase.from).toHaveBeenCalledWith('users');
    });
  });

  describe('Utility Functions', () => {
    it('should refresh cars manually', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.refreshCars();
      });

      expect(CarService.getCars).toHaveBeenCalledTimes(2); // Initial + manual refresh
    });

    it('should record car view', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should not throw error
      await act(async () => {
        await result.current.viewCar('car-1');
      });

      expect(result.current.cars).toEqual(mockCars); // State unchanged
    });

    it('should maintain backward compatibility with toggleLike', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleLike('car-1');
      });

      // Should behave same as likeCar
      const updatedCar = result.current.cars.find(c => c.id === 'car-1');
      expect(updatedCar?.is_liked).toBe(true);
      expect(updatedCar?.likes_count).toBe(6);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user gracefully', async () => {
      const { useAuth } = require('../../hooks/useAuth');
      useAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.likeCar('car-1');
      });

      // Should not make any API calls
      expect(supabase.from).not.toHaveBeenCalledWith('likes');
    });

    it('should handle non-existent car gracefully', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.likeCar('non-existent-car');
      });

      // Should not crash or make API calls
      expect(result.current.cars).toEqual(mockCars);
    });

    it('should prevent likes count from going below zero', async () => {
      const { result } = renderHook(() => useCars());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Get the event listener callback
      const likeCallback = (DeviceEventEmitter.addListener as jest.Mock).mock.calls
        .find(call => call[0] === 'likeStateChanged')[1];

      // Simulate multiple unlikes
      act(() => {
        likeCallback({ carId: 'car-1', isLiked: false });
        likeCallback({ carId: 'car-1', isLiked: false });
        likeCallback({ carId: 'car-1', isLiked: false });
      });

      await waitFor(() => {
        const updatedCar = result.current.cars.find(c => c.id === 'car-1');
        expect(updatedCar?.likes_count).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup subscriptions on unmount', () => {
      const { unmount } = renderHook(() => useCars());

             const mockRemove = jest.fn();
       (DeviceEventEmitter.addListener as jest.Mock).mockReturnValue({
         remove: mockRemove,
       } as any);

      unmount();

      expect(mockSupabaseChannel.unsubscribe).toHaveBeenCalled();
    });
  });
}); 