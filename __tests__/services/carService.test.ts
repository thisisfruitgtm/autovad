import { CarService } from '../../services/carService';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: [
                {
                  id: 'test-car-1',
                  make: 'Tesla',
                  model: 'Model 3',
                  year: 2023,
                  price: 50000,
                  status: 'active',
                  created_at: '2024-01-01T00:00:00Z',
                  likes_count: 5,
                  comments_count: 2,
                },
              ],
              error: null,
            })),
          })),
        })),
      })),
    })),
  },
}));

describe('CarService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCars', () => {
    it('should fetch cars successfully for authenticated users', async () => {
      const cars = await CarService.getCars('test-user-id');
      
      expect(cars).toBeDefined();
      expect(Array.isArray(cars)).toBe(true);
      expect(cars.length).toBeGreaterThan(0);
      
      if (cars.length > 0) {
        const car = cars[0];
        expect(car).toHaveProperty('id');
        expect(car).toHaveProperty('make');
        expect(car).toHaveProperty('model');
        expect(car).toHaveProperty('status');
        expect(car.status).toBe('active');
      }
    });

    it('should fetch cars successfully for unauthenticated users', async () => {
      const cars = await CarService.getCars();
      
      expect(cars).toBeDefined();
      expect(Array.isArray(cars)).toBe(true);
      // Should still return cars for public access
    });

    it('should handle errors gracefully', async () => {
      // Mock error scenario
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => ({
                data: null,
                error: new Error('Database connection failed'),
              }),
            }),
          }),
        }),
      });

      const cars = await CarService.getCars();
      
      // Should fallback to mock data or return empty array
      expect(cars).toBeDefined();
      expect(Array.isArray(cars)).toBe(true);
    });
  });

  describe('getUserCars', () => {
    it('should fetch user-specific cars', async () => {
      const cars = await CarService.getUserCars('test-user-id');
      
      expect(cars).toBeDefined();
      expect(Array.isArray(cars)).toBe(true);
    });

    it('should return empty array for invalid user ID', async () => {
      const cars = await CarService.getUserCars('');
      
      expect(cars).toBeDefined();
      expect(Array.isArray(cars)).toBe(true);
      expect(cars.length).toBe(0);
    });
  });

  describe('toggleLike', () => {
    it('should handle like toggle for authenticated users', async () => {
      const result = await CarService.toggleLike('test-car-1', 'test-user-1', false);
      
      // Should return the new like state
      expect(typeof result).toBe('boolean');
    });

    it('should handle errors in like toggle gracefully', async () => {
      const result = await CarService.toggleLike('invalid-car', 'invalid-user', false);
      
      // Should return original state on error
      expect(typeof result).toBe('boolean');
    });
  });
}); 