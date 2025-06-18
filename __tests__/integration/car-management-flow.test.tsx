import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useCars } from '../../hooks/useCars';
import { useAuth } from '../../hooks/useAuth';
import { CarService } from '../../services/carService';
import { CarPost } from '../../components/CarPost';

// Mock car listing component
const MockCarListScreen = () => {
  const { cars, loading, error, refreshCars, likeCar } = useCars();
  
  if (loading) {
    return <Text testID="loading-indicator">Loading cars...</Text>;
  }
  
  if (error) {
    return <Text testID="error-message">{error}</Text>;
  }
  
  return (
    <View testID="car-list-screen">
      <TouchableOpacity testID="refresh-button" onPress={refreshCars}>
        <Text>Refresh</Text>
      </TouchableOpacity>
      
      <FlatList
        testID="cars-list"
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View testID={`car-item-${item.id}`}>
                         <Text testID={`car-title-${item.id}`}>{item.make} {item.model}</Text>
            <Text testID={`car-price-${item.id}`}>{item.price} €</Text>
            <TouchableOpacity
              testID={`like-button-${item.id}`}
              onPress={() => likeCar(item.id)}
            >
              <Text>{item.is_liked ? 'Unlike' : 'Like'}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      
      {cars.length === 0 && (
        <Text testID="empty-state">No cars available</Text>
      )}
    </View>
  );
};

// Mock car detail component
const MockCarDetailScreen = ({ carId }: { carId: string }) => {
  const { cars, likeCar, viewCar } = useCars();
  const car = cars.find(c => c.id === carId);
  
  React.useEffect(() => {
    if (carId) {
      viewCar(carId);
    }
  }, [carId, viewCar]);
  
  if (!car) {
    return <Text testID="car-not-found">Car not found</Text>;
  }
  
  return (
    <View testID="car-detail-screen">
             <Text testID="car-detail-title">{car.make} {car.model}</Text>
      <Text testID="car-detail-price">{car.price} €</Text>
      <Text testID="car-detail-description">{car.description}</Text>
      <Text testID="car-detail-location">{car.location}</Text>
      <Text testID="car-detail-likes">{car.likes_count} likes</Text>
      
      <TouchableOpacity
        testID="detail-like-button"
        onPress={() => likeCar(car.id)}
      >
        <Text>{car.is_liked ? 'Unlike' : 'Like'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity testID="contact-seller-button">
        <Text>Contact Seller</Text>
      </TouchableOpacity>
    </View>
  );
};

const mockCars = [
  {
    id: 'car-1',
    make: 'BMW',
    model: 'X5',
    year: 2020,
    price: 50000,
    mileage: 50000,
    color: 'Negru',
    fuel_type: 'Petrol' as const,
    transmission: 'Automatic' as const,
    body_type: 'SUV' as const,
    videos: [],
    images: ['https://example.com/image1.jpg'],
    description: 'BMW X5 în stare excelentă, full options',
    location: 'București',
    status: 'active' as const,
    likes_count: 5,
    comments_count: 2,
    is_liked: false,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'car-2',
    make: 'Audi',
    model: 'A4',
    year: 2019,
    price: 35000,
    mileage: 60000,
    color: 'Alb',
    fuel_type: 'Diesel' as const,
    transmission: 'Manual' as const,
    body_type: 'Sedan' as const,
    videos: [],
    images: ['https://example.com/image2.jpg'],
    description: 'Audi A4 foarte bine întreținută',
    location: 'Cluj-Napoca',
    status: 'active' as const,
    likes_count: 3,
    comments_count: 1,
    is_liked: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

describe('Car Management Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
      },
      loading: false,
    });
    
    // Mock CarService
    (CarService.getCars as jest.Mock).mockResolvedValue(mockCars);
  });

  describe('Car Listing Flow', () => {
    it('should display loading state initially', () => {
      // Mock loading state
      (CarService.getCars as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { getByTestId } = render(<MockCarListScreen />);
      
      expect(getByTestId('loading-indicator')).toHaveTextContent('Loading cars...');
    });

    it('should display cars list after loading', async () => {
      const { getByTestId, queryByTestId } = render(<MockCarListScreen />);

      await waitFor(() => {
        expect(queryByTestId('loading-indicator')).toBeNull();
        expect(getByTestId('car-list-screen')).toBeTruthy();
      });

      // Check if cars are displayed
      expect(getByTestId('car-item-car-1')).toBeTruthy();
      expect(getByTestId('car-item-car-2')).toBeTruthy();
      
      expect(getByTestId('car-title-car-1')).toHaveTextContent('BMW X5 2020');
      expect(getByTestId('car-price-car-1')).toHaveTextContent('50000 €');
      
      expect(getByTestId('car-title-car-2')).toHaveTextContent('Audi A4 2019');
      expect(getByTestId('car-price-car-2')).toHaveTextContent('35000 €');
    });

    it('should handle empty cars list', async () => {
      (CarService.getCars as jest.Mock).mockResolvedValue([]);

      const { getByTestId } = render(<MockCarListScreen />);

      await waitFor(() => {
        expect(getByTestId('empty-state')).toHaveTextContent('No cars available');
      });
    });

    it('should handle error state', async () => {
      (CarService.getCars as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { getByTestId } = render(<MockCarListScreen />);

      await waitFor(() => {
        expect(getByTestId('error-message')).toHaveTextContent('Failed to load cars');
      });
    });

    it('should refresh cars list', async () => {
      const { getByTestId } = render(<MockCarListScreen />);

      await waitFor(() => {
        expect(getByTestId('car-list-screen')).toBeTruthy();
      });

      // Clear previous calls
      jest.clearAllMocks();
      (CarService.getCars as jest.Mock).mockResolvedValue(mockCars);

      // Trigger refresh
      fireEvent.press(getByTestId('refresh-button'));

      await waitFor(() => {
        expect(CarService.getCars).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Like/Unlike Flow', () => {
    it('should like a car successfully', async () => {
      const { getByTestId } = render(<MockCarListScreen />);

      await waitFor(() => {
        expect(getByTestId('car-list-screen')).toBeTruthy();
      });

      // Initial state - car-1 is not liked
      expect(getByTestId('like-button-car-1')).toHaveTextContent('Like');

      // Mock successful like
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn(() => Promise.resolve({ error: null })),
        insert: jest.fn(() => Promise.resolve({ error: null })),
      });

      // Like the car
      fireEvent.press(getByTestId('like-button-car-1'));

      await waitFor(() => {
        expect(getByTestId('like-button-car-1')).toHaveTextContent('Unlike');
      });
    });

    it('should unlike a car with confirmation', async () => {
      const { getByTestId } = render(<MockCarListScreen />);

      await waitFor(() => {
        expect(getByTestId('car-list-screen')).toBeTruthy();
      });

      // Initial state - car-2 is liked
      expect(getByTestId('like-button-car-2')).toHaveTextContent('Unlike');

             // Mock Alert.alert to auto-confirm
       const mockAlert = require('react-native').Alert;
       mockAlert.alert.mockImplementation((title: string, message: string, buttons: any[]) => {
         const confirmButton = buttons.find((b: any) => b.text === 'Șterge');
         if (confirmButton) {
           confirmButton.onPress();
         }
       });

      // Mock successful unlike
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null })),
          })),
        })),
      });

      // Unlike the car
      fireEvent.press(getByTestId('like-button-car-2'));

      await waitFor(() => {
        expect(getByTestId('like-button-car-2')).toHaveTextContent('Like');
      });
    });

    it('should handle like error gracefully', async () => {
      const { getByTestId } = render(<MockCarListScreen />);

      await waitFor(() => {
        expect(getByTestId('car-list-screen')).toBeTruthy();
      });

      // Mock like error
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn(() => Promise.resolve({ error: null })),
        insert: jest.fn(() => Promise.resolve({ error: new Error('Database error') })),
      });

      // Try to like the car
      fireEvent.press(getByTestId('like-button-car-1'));

      await waitFor(() => {
        // Should remain in original state
        expect(getByTestId('like-button-car-1')).toHaveTextContent('Like');
      });
    });
  });

  describe('Car Detail Flow', () => {
    it('should display car details correctly', async () => {
      const { getByTestId } = render(<MockCarDetailScreen carId="car-1" />);

      await waitFor(() => {
        expect(getByTestId('car-detail-screen')).toBeTruthy();
      });

      expect(getByTestId('car-detail-title')).toHaveTextContent('BMW X5 2020');
      expect(getByTestId('car-detail-price')).toHaveTextContent('50000 €');
      expect(getByTestId('car-detail-description')).toHaveTextContent('BMW X5 în stare excelentă, full options');
      expect(getByTestId('car-detail-location')).toHaveTextContent('București');
      expect(getByTestId('car-detail-likes')).toHaveTextContent('5 likes');
    });

    it('should handle non-existent car', async () => {
      const { getByTestId } = render(<MockCarDetailScreen carId="non-existent" />);

      await waitFor(() => {
        expect(getByTestId('car-not-found')).toHaveTextContent('Car not found');
      });
    });

    it('should record car view', async () => {
      const mockViewCar = jest.fn();
      
      // Mock useCars to return viewCar function
      const mockUseCars = {
        cars: mockCars,
        loading: false,
        error: null,
        likeCar: jest.fn(),
        viewCar: mockViewCar,
      };
      
      (require('../../hooks/useCars').useCars as jest.Mock).mockReturnValue(mockUseCars);

      render(<MockCarDetailScreen carId="car-1" />);

      await waitFor(() => {
        expect(mockViewCar).toHaveBeenCalledWith('car-1');
      });
    });

    it('should like/unlike from detail screen', async () => {
      const { getByTestId } = render(<MockCarDetailScreen carId="car-1" />);

      await waitFor(() => {
        expect(getByTestId('car-detail-screen')).toBeTruthy();
      });

      // Initial state - not liked
      expect(getByTestId('detail-like-button')).toHaveTextContent('Like');

      // Mock successful like
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn(() => Promise.resolve({ error: null })),
        insert: jest.fn(() => Promise.resolve({ error: null })),
      });

      // Like the car
      fireEvent.press(getByTestId('detail-like-button'));

      await waitFor(() => {
        expect(getByTestId('detail-like-button')).toHaveTextContent('Unlike');
      });
    });
  });

  describe('Real-time Updates Flow', () => {
    it('should update car list when new car is added', async () => {
      const { getByTestId } = render(<MockCarListScreen />);

      await waitFor(() => {
        expect(getByTestId('car-list-screen')).toBeTruthy();
      });

      // Initially 2 cars
      expect(getByTestId('car-item-car-1')).toBeTruthy();
      expect(getByTestId('car-item-car-2')).toBeTruthy();

             // Mock new car added
       const newCar = {
         ...mockCars[0],
         id: 'car-3',
         make: 'Mercedes',
         model: 'C-Class',
         year: 2021,
         price: 45000,
       };

      (CarService.getCars as jest.Mock).mockResolvedValue([...mockCars, newCar]);

      // Simulate real-time update
      const mockDeviceEventEmitter = require('react-native').DeviceEventEmitter;
      mockDeviceEventEmitter.emit('carPosted', { carId: 'car-3' });

      await waitFor(() => {
        expect(CarService.getCars).toHaveBeenCalled();
      });
    });

    it('should update like count in real-time', async () => {
      const { getByTestId } = render(<MockCarListScreen />);

      await waitFor(() => {
        expect(getByTestId('car-list-screen')).toBeTruthy();
      });

      // Simulate real-time like update
      const mockDeviceEventEmitter = require('react-native').DeviceEventEmitter;
      mockDeviceEventEmitter.emit('likeStateChanged', { 
        carId: 'car-1', 
        isLiked: true 
      });

      await waitFor(() => {
        expect(getByTestId('like-button-car-1')).toHaveTextContent('Unlike');
      });
    });
  });

  describe('Error Recovery Flow', () => {
    it('should retry after network error', async () => {
      // Mock initial error
      (CarService.getCars as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { getByTestId } = render(<MockCarListScreen />);

      await waitFor(() => {
        expect(getByTestId('error-message')).toHaveTextContent('Failed to load cars');
      });

      // Mock successful retry
      (CarService.getCars as jest.Mock).mockResolvedValue(mockCars);

      // Trigger refresh
      fireEvent.press(getByTestId('refresh-button'));

      await waitFor(() => {
        expect(getByTestId('car-list-screen')).toBeTruthy();
        expect(getByTestId('car-item-car-1')).toBeTruthy();
      });
    });

    it('should handle partial data loading', async () => {
      // Mock partial data (only one car)
      (CarService.getCars as jest.Mock).mockResolvedValue([mockCars[0]]);

      const { getByTestId, queryByTestId } = render(<MockCarListScreen />);

      await waitFor(() => {
        expect(getByTestId('car-item-car-1')).toBeTruthy();
        expect(queryByTestId('car-item-car-2')).toBeNull();
      });
    });
  });

  describe('Performance and User Experience', () => {
    it('should show loading states during operations', async () => {
      // Mock slow loading
      let resolveGetCars: (value: any) => void;
      const getCarsPromise = new Promise(resolve => {
        resolveGetCars = resolve;
      });
      (CarService.getCars as jest.Mock).mockReturnValue(getCarsPromise);

      const { getByTestId } = render(<MockCarListScreen />);

      // Should show loading immediately
      expect(getByTestId('loading-indicator')).toHaveTextContent('Loading cars...');

      // Resolve the promise
      resolveGetCars!(mockCars);

      await waitFor(() => {
        expect(getByTestId('car-list-screen')).toBeTruthy();
      });
    });

    it('should handle rapid user interactions gracefully', async () => {
      const { getByTestId } = render(<MockCarListScreen />);

      await waitFor(() => {
        expect(getByTestId('car-list-screen')).toBeTruthy();
      });

      // Mock like operation
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn(() => Promise.resolve({ error: null })),
        insert: jest.fn(() => Promise.resolve({ error: null })),
      });

      // Rapid clicks on like button
      const likeButton = getByTestId('like-button-car-1');
      fireEvent.press(likeButton);
      fireEvent.press(likeButton);
      fireEvent.press(likeButton);

      // Should handle gracefully without crashes
      await waitFor(() => {
        expect(getByTestId('car-list-screen')).toBeTruthy();
      });
    });
  });
}); 