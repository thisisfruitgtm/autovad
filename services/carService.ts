import { Car } from '@/types/car';

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

  static async getCars(userId?: string): Promise<Car[]> {
    console.log('🚗 CarService: Starting to fetch cars...');
    
    // Check if environment variables are available
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('⚠️ CarService: Environment variables not available, using mock data');
      return this.getEnhancedMockCars();
    }
    
    try {
      // Enhanced query to include likes information for authenticated users
      let url = `${SUPABASE_URL}/rest/v1/cars?select=*&status=eq.active&order=created_at.desc&limit=20`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await this.fetchWithRetry(url, { 
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ CarService: Successfully fetched ${data.length} cars from database`);
      
      // Fetch likes for the user if authenticated
      let userLikes: string[] = [];
      if (userId) {
        try {
          const likesUrl = `${SUPABASE_URL}/rest/v1/likes?select=car_id&user_id=eq.${userId}`;
          const likesResponse = await this.fetchWithRetry(likesUrl, { method: 'GET' });
          if (likesResponse.ok) {
            const likesData = await likesResponse.json();
            userLikes = likesData.map((like: any) => like.car_id);
            console.log(`✅ CarService: Fetched ${userLikes.length} user likes`);
          }
        } catch (error) {
          console.warn('⚠️ CarService: Failed to fetch user likes, continuing without:', error);
        }
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
      console.error('❌ CarService: Failed to fetch cars from database:', error);
      console.log('🎭 CarService: Using enhanced mock data as fallback...');
      
      return this.getEnhancedMockCars();
    }
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