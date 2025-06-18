import { Car } from '@/types/car';
import { ErrorHandler } from '@/lib/errorHandler';

// Use environment variables for security
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ CarService: Missing Supabase environment variables');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL);
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', !!SUPABASE_ANON_KEY);
}

// Mock data as fallback
const mockCars: Car[] = [
  {
    id: 'mock-1',
    make: 'BMW',
    model: 'M4 Competition',
    price: 85000,
    year: 2023,
    mileage: 15000,
    color: 'Alpine White',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    body_type: 'Coupe',
    videos: [],
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'],
    description: 'BMW M4 Competition - performanță pură! Motor twin-turbo de 510 CP.',
    location: 'București',
    seller: {
      id: 'mock-seller-1',
      name: 'BMW Dealership',
      avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5.0,
      verified: true,
    },
    created_at: new Date().toISOString(),
    status: 'active' as const,
    is_liked: false,
    likes_count: 12,
    comments_count: 3,
  },
  {
    id: 'mock-2',
    make: 'Mercedes-Benz',
    model: 'G63 AMG',
    price: 180000,
    year: 2022,
    mileage: 8500,
    color: 'Obsidian Black',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    body_type: 'SUV',
    videos: [],
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'],
    description: 'Mercedes G63 AMG - legenda off-road! Motor V8 biturbo de 585 CP.',
    location: 'Cluj-Napoca',
    seller: {
      id: 'mock-seller-2',
      name: 'Mercedes Dealership',
      avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5.0,
      verified: true,
    },
    created_at: new Date().toISOString(),
    status: 'active' as const,
    is_liked: false,
    likes_count: 28,
    comments_count: 7,
  },
  {
    id: 'mock-3',
    make: 'Porsche',
    model: '911 Turbo S',
    price: 220000,
    year: 2023,
    mileage: 5200,
    color: 'Guards Red',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    body_type: 'Coupe',
    videos: [],
    images: ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'],
    description: 'Porsche 911 Turbo S - perfecțiunea sportivă! 650 CP, 0-100 km/h în 2.7 secunde.',
    location: 'Timișoara',
    seller: {
      id: 'mock-seller-3',
      name: 'Porsche Center',
      avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5.0,
      verified: true,
    },
    created_at: new Date().toISOString(),
    status: 'active' as const,
    is_liked: false,
    likes_count: 35,
    comments_count: 12,
  },
];

export class CarService {
  private static async fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        // console.log(`🔄 Attempt ${i + 1} to fetch from: ${url}`);
        const response = await fetch(url, {
          ...options,
          headers: {
            'apikey': SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY!}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
          },
        });
        
        if (response.ok) {
          // console.log(`✅ Fetch successful on attempt ${i + 1}`);
          return response;
        } else {
          console.warn(`⚠️ Attempt ${i + 1} failed with status: ${response.status}`);
          if (i === retries - 1) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`❌ Attempt ${i + 1} failed:`, error);
        if (i === retries - 1) throw error;
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    throw new Error('All retry attempts failed');
  }

  private static getEnhancedMockCars(): Car[] {
    // Enhanced mock data with more realistic values
    return mockCars.map(car => ({
      ...car,
      likes_count: Math.floor(Math.random() * 100) + 10,
      comments_count: Math.floor(Math.random() * 25) + 3,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  }

  static async getUserCars(userId: string): Promise<Car[]> {
    console.log('🚗 CarService: Starting to fetch user cars...');
    
    // Import supabase client directly
    const { supabase } = await import('@/lib/supabase');
    
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('seller_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log(`✅ CarService: Successfully fetched ${data.length} user cars`);
      
      // Transform data to match Car interface
      const transformedCars: Car[] = data.map((car: any) => ({
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price,
        mileage: car.mileage,
        color: car.color,
        fuel_type: car.fuel_type,
        transmission: car.transmission,
        body_type: car.body_type,
        videos: car.videos || [],
        images: car.images || [],
        description: car.description,
        location: car.location,
        status: car.status || 'active',
        seller: {
          id: userId,
          name: 'Tine',
          avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          rating: 5.0,
          verified: true,
        },
        created_at: car.created_at,
        is_liked: false,
        likes_count: car.likes_count || 0,
        comments_count: car.comments_count || 0,
      }));

      return transformedCars;
      
    } catch (error) {
      console.error('❌ CarService: Failed to fetch user cars:', error);
      return [];
    }
  }

  static async getCars(userId?: string): Promise<Car[]> {
    return await ErrorHandler.measurePerformance(async () => {
      console.log('🚗 CarService: Starting to fetch cars...');
      console.log('👤 CarService: User ID provided:', userId ? 'Yes' : 'No (unauthenticated)');
      
      // Import supabase client directly to avoid REST API caching issues
      const { supabase } = await import('@/lib/supabase');
      
      try {
        // Use Supabase client instead of REST API to avoid caching issues
        // Fetch ALL active cars regardless of authentication status
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(100); // Increased limit to show more cars

        if (error) {
          throw ErrorHandler.networkError(
            `Failed to fetch cars: ${error.message}`,
            { component: 'CarService', action: 'getCars', userId }
          );
        }

        console.log(`✅ CarService: Successfully fetched ${data.length} cars from database`);
        
        // Debug: Log the latest cars to see what's being fetched
        if (data.length > 0) {
          console.log('🔍 CarService: Latest 3 cars:');
          data.slice(0, 3).forEach((car: any, index: number) => {
            console.log(`  ${index + 1}. ${car.make} ${car.model} (${car.created_at}) - Status: ${car.status}`);
          });
        }
        
        // Fetch likes for the user if authenticated
        let userLikes: string[] = [];
        if (userId) {
          const likesResult = await ErrorHandler.withErrorHandling(
            async () => {
              const { data: likesData, error: likesError } = await supabase
                .from('likes')
                .select('car_id')
                .eq('user_id', userId);
                
              if (likesError) throw likesError;
              return likesData?.map((like: any) => like.car_id) || [];
            },
            { component: 'CarService', action: 'fetchUserLikes', userId },
            []
          );
          
          userLikes = likesResult || [];
          console.log(`✅ CarService: Fetched ${userLikes.length} user likes`);
        }
        
        // Transform data to match Car interface with enhanced seller info
        const transformedCars: Car[] = data.map((car: any) => ({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price,
          mileage: car.mileage,
          color: car.color,
          fuel_type: car.fuel_type,
          transmission: car.transmission,
          body_type: car.body_type,
          videos: car.videos || [],
          images: car.images || [],
          description: car.description,
          location: car.location,
          status: car.status || 'active',
          seller: {
            id: 'autovad-verified',
            name: 'Autovad Verified',
            avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            rating: 4.9,
            verified: true,
          },
          created_at: car.created_at,
          is_liked: userId ? userLikes.includes(car.id) : false,
          likes_count: car.likes_count || Math.floor(Math.random() * 50) + 5,
          comments_count: car.comments_count || Math.floor(Math.random() * 15) + 1,
        }));

        return transformedCars;
        
      } catch (error) {
        // Use ErrorHandler for consistent error logging
        await ErrorHandler.handle(
          error as Error,
          { component: 'CarService', action: 'getCars', userId }
        );
        
        console.log('🎭 CarService: Using enhanced mock data as fallback...');
        return this.getEnhancedMockCars();
      }
    }, 'fetchCars', { component: 'CarService', userId });
  }

  static async toggleLike(carId: string, userId: string, isLiked: boolean, accessToken?: string): Promise<boolean> {
    try {
      const url = `${SUPABASE_URL}/rest/v1/likes`;
      
      // Use user's access token if provided, otherwise fallback to anon key
      const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${SUPABASE_ANON_KEY!}`;
      
      if (isLiked) {
        // Unlike - delete the like
        await this.fetchWithRetry(`${url}?car_id=eq.${carId}&user_id=eq.${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': authHeader,
          },
        });
      } else {
        // Like - insert new like
        await this.fetchWithRetry(url, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
          },
          body: JSON.stringify({ car_id: carId, user_id: userId }),
        });
      }
      
      return !isLiked;
    } catch (error) {
      console.error('❌ CarService: Failed to toggle like:', error);
      return isLiked; // Return original state on error
    }
  }
} 