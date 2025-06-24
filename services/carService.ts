import { Car } from '@/types/car';
import { ErrorHandler } from '@/lib/errorHandler';
import { mediaOptimizer } from '@/lib/mediaOptimization';
import { 
  SecurityManager, 
  SecurityValidator, 
  NetworkSecurity, 
  rateLimiter,
  SecurityMonitor,
  SecurityError 
} from '@/lib/security';

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
    // Security: Validate URL before making request
    if (!NetworkSecurity.validateUrl(url)) {
      throw new SecurityError('Invalid URL: not in allowed origins', 'INVALID_URL', 400);
    }

    // Security: Rate limiting
    const identifier = `fetch_${url}`;
    if (rateLimiter.isRateLimited(identifier)) {
      throw new SecurityError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
    }

    // Security: Check if device is blocked
    if (SecurityMonitor.isBlocked(identifier)) {
      throw new SecurityError('Device temporarily blocked', 'DEVICE_BLOCKED', 403);
    }

    for (let i = 0; i < retries; i++) {
      try {
        // Security: Create secure request
        const secureOptions = await SecurityManager.createSecureRequest(url, {
          ...options,
          headers: {
            'apikey': SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY!}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
          },
        });

        const response = await fetch(url, secureOptions);
        
        if (response.ok) {
          return response;
        } else {
          console.warn(`⚠️ Attempt ${i + 1} failed with status: ${response.status}`);
          if (i === retries - 1) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`❌ Attempt ${i + 1} failed:`, error);
        
        // Security: Record failed attempts
        if (error instanceof SecurityError) {
          SecurityMonitor.recordFailedAttempt(identifier, error.message);
        }
        
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
    
    // Security: Validate user ID
    if (!SecurityValidator.validateUUID(userId)) {
      throw new SecurityError('Invalid user ID format', 'INVALID_USER_ID', 400);
    }
    
    // Import supabase client directly
    const { supabase } = await import('@/lib/supabase');
    
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('seller_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20); // Optimized: 20 cars per request

      if (error) {
        throw error;
      }

      console.log(`✅ CarService: Successfully fetched ${data.length} user cars`);
      
      // Transform data to match Car interface with optimized media
      const transformedCars: Car[] = data.map((car: any) => {
        // Optimize media for reduced egress costs
        const optimizedMedia = mediaOptimizer.getOptimizedCarMedia(car);
        
        return {
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
          videos: optimizedMedia.videos.map(v => v.url),
          images: optimizedMedia.images,
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
        };
      });

      return transformedCars;
    } catch (error) {
      console.error('❌ CarService: Error fetching user cars:', error);
      ErrorHandler.handle(error as Error, { component: 'CarService', action: 'getUserCars', userId });
      return [];
    }
  }

  static async getCars(userId?: string): Promise<Car[]> {
    console.log('🚗 CarService: Starting to fetch cars...');
    
    // Security: Validate user ID if provided
    if (userId && !SecurityValidator.validateUUID(userId)) {
      throw new SecurityError('Invalid user ID format', 'INVALID_USER_ID', 400);
    }

    // Import supabase client directly
    const { supabase } = await import('@/lib/supabase');
    
    try {
      let query = supabase
        .from('cars')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20); // Optimized: 20 cars per request

      // If user ID is provided, also get their liked cars
      if (userId) {
        // Get user's liked cars
        const { data: likedCars, error: likedError } = await supabase
          .from('likes')
          .select('car_id')
          .eq('user_id', userId);

        if (likedError) {
          console.warn('⚠️ Could not fetch liked cars:', likedError);
        }

        const likedCarIds = likedCars?.map(like => like.car_id) || [];

        // Get all cars and mark liked ones
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        console.log(`✅ CarService: Successfully fetched ${data.length} cars`);

        // Transform data to match Car interface with optimized media
        const transformedCars: Car[] = data.map((car: any) => {
          // Optimize media for reduced egress costs
          const optimizedMedia = mediaOptimizer.getOptimizedCarMedia(car);
          
          return {
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
            videos: optimizedMedia.videos.map(v => v.url),
            images: optimizedMedia.images,
            description: car.description,
            location: car.location,
            status: car.status || 'active',
            seller: {
              id: car.seller_id || 'unknown',
              name: 'Autovad Verified',
              avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
              rating: 4.9,
              verified: true,
            },
            created_at: car.created_at,
            is_liked: likedCarIds.includes(car.id),
            likes_count: car.likes_count || 0,
            comments_count: car.comments_count || 0,
          };
        });

        return transformedCars;
      } else {
        // No user ID, just get cars without like status
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        console.log(`✅ CarService: Successfully fetched ${data.length} cars`);

        // Transform data to match Car interface with optimized media
        const transformedCars: Car[] = data.map((car: any) => {
          // Optimize media for reduced egress costs
          const optimizedMedia = mediaOptimizer.getOptimizedCarMedia(car);
          
          return {
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
            videos: optimizedMedia.videos.map(v => v.url),
            images: optimizedMedia.images,
            description: car.description,
            location: car.location,
            status: car.status || 'active',
            seller: {
              id: car.seller_id || 'unknown',
              name: 'Autovad Verified',
              avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
              rating: 4.9,
              verified: true,
            },
            created_at: car.created_at,
            is_liked: false,
            likes_count: car.likes_count || 0,
            comments_count: car.comments_count || 0,
          };
        });

        return transformedCars;
      }
    } catch (error) {
      console.error('❌ CarService: Error fetching cars:', error);
      ErrorHandler.handle(error as Error, { component: 'CarService', action: 'getCars', userId });
      
      // Return mock data as fallback
      console.log('🔄 CarService: Returning mock data as fallback');
      return this.getEnhancedMockCars();
    }
  }

  static async toggleLike(carId: string, userId: string, isLiked: boolean, accessToken?: string): Promise<boolean> {
    console.log(`💖 CarService: Toggling like for car ${carId}, current state: ${isLiked}`);
    
    // Security: Validate inputs
    if (!SecurityValidator.validateUUID(carId)) {
      throw new SecurityError('Invalid car ID format', 'INVALID_CAR_ID', 400);
    }
    
    if (!SecurityValidator.validateUUID(userId)) {
      throw new SecurityError('Invalid user ID format', 'INVALID_USER_ID', 400);
    }

    // Import supabase client directly
    const { supabase } = await import('@/lib/supabase');
    
    try {
      if (isLiked) {
        // Unlike - delete the like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('car_id', carId)
          .eq('user_id', userId);

        if (error) {
          console.error('❌ CarService: Error unliking car:', error);
          return false;
        }

        console.log('✅ CarService: Successfully unliked car');
        return true;
      } else {
        // Like - insert the like
        const { error } = await supabase
          .from('likes')
          .insert({ car_id: carId, user_id: userId });

        if (error) {
          console.error('❌ CarService: Error liking car:', error);
          return false;
        }

        console.log('✅ CarService: Successfully liked car');
        return true;
      }
    } catch (error) {
      console.error('❌ CarService: Error toggling like:', error);
      ErrorHandler.handle(error as Error, { component: 'CarService', action: 'toggleLike', userId });
      return false;
    }
  }

  static async uploadVideo(file: File): Promise<{ uploadId: string; url: string }> {
    console.log('📹 CarService: Starting video upload...');
    
    // Security: Validate file upload
    const fileValidation = SecurityValidator.validateFileUpload(file, 'video');
    if (!fileValidation.valid) {
      throw new SecurityError(`File validation failed: ${fileValidation.errors.join(', ')}`, 'INVALID_FILE', 400);
    }

    try {
      const response = await this.fetchWithRetry(`${SUPABASE_URL}/storage/v1/object/car-media`, {
        method: 'POST',
        body: JSON.stringify({
          name: `videos/${Date.now()}-${file.name}`,
          bucket: 'car-media',
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ CarService: Video upload successful');
      
      return {
        uploadId: data.id,
        url: data.url,
      };
    } catch (error) {
      console.error('❌ CarService: Error uploading video:', error);
      ErrorHandler.handle(error as Error, { component: 'CarService', action: 'uploadVideo' });
      throw error;
    }
  }

  static async getAssetId(uploadId: string): Promise<{ assetId: string; uploadStatus: string }> {
    console.log('🔍 CarService: Getting asset ID for upload:', uploadId);
    
    // Security: Validate upload ID
    if (!SecurityValidator.sanitizeString(uploadId)) {
      throw new SecurityError('Invalid upload ID', 'INVALID_UPLOAD_ID', 400);
    }

    try {
      const response = await this.fetchWithRetry(`${SUPABASE_URL}/storage/v1/object/car-media/${uploadId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to get asset ID: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ CarService: Asset ID retrieved successfully');
      
      return {
        assetId: data.id,
        uploadStatus: data.status,
      };
    } catch (error) {
      console.error('❌ CarService: Error getting asset ID:', error);
      ErrorHandler.handle(error as Error, { component: 'CarService', action: 'getAssetId' });
      throw error;
    }
  }

  static async pollAsset(assetId: string): Promise<{ status: string; playbackId?: string; processing?: boolean }> {
    console.log('🔄 CarService: Polling asset status:', assetId);
    
    // Security: Validate asset ID
    if (!SecurityValidator.sanitizeString(assetId)) {
      throw new SecurityError('Invalid asset ID', 'INVALID_ASSET_ID', 400);
    }

    try {
      const response = await this.fetchWithRetry(`${SUPABASE_URL}/storage/v1/object/car-media/${assetId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to poll asset: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ CarService: Asset status retrieved');
      
      return {
        status: data.status,
        playbackId: data.playback_id,
        processing: data.status === 'processing',
      };
    } catch (error) {
      console.error('❌ CarService: Error polling asset:', error);
      ErrorHandler.handle(error as Error, { component: 'CarService', action: 'pollAsset' });
      throw error;
    }
  }
} 