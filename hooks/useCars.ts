import { useState, useEffect } from 'react';
import { Car } from '@/types/car';
import { useAuth } from './useAuth';
import { CarService } from '@/services/carService';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import { DeviceEventEmitter } from 'react-native';

export function useCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCars = async () => {
    // console.log('🚀 useCars: Starting to fetch cars...');
    // console.log('👤 useCars: User authenticated:', !!user);
    
    setLoading(true);
    setError(null);

    try {
      // console.log('🎭 useCars: Fetching cars using CarService...');
      const fetchedCars = await CarService.getCars(user?.id);
      setCars(fetchedCars);
      // console.log(`✅ useCars: Loaded ${fetchedCars.length} cars`);
    } catch (error) {
      console.error('❌ useCars: Error in fetchCars:', error);
      setError('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [user]);

  // Listen for like state changes from other components
  useEffect(() => {
    const likeSubscription = DeviceEventEmitter.addListener('likeStateChanged', ({ carId, isLiked }) => {
      console.log('🔔 useCars: Like state change event received:', { carId, isLiked });
      setCars(prevCars =>
        prevCars.map(c =>
          c.id === carId
            ? {
                ...c,
                is_liked: isLiked,
                likes_count: isLiked ? c.likes_count + 1 : Math.max(0, c.likes_count - 1),
              }
            : c
        )
      );
    });

    // Listen for new car posts to refresh the feed
    const carPostedSubscription = DeviceEventEmitter.addListener('carPosted', ({ carId }) => {
      console.log('🔔 useCars: New car posted event received:', { carId });
      console.log('🔄 useCars: Refreshing cars list...');
      fetchCars();
    });

    return () => {
      likeSubscription.remove();
      carPostedSubscription.remove();
    };
  }, []);

  // Real-time subscription to likes changes and new cars
  useEffect(() => {
    console.log('🔄 useCars: Setting up real-time subscriptions');

    // Create a unique channel name to avoid conflicts
    const channelName = `realtime_changes_${Date.now()}`;
    
    const realtimeSubscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: user ? `user_id=eq.${user.id}` : undefined,
        },
        (payload) => {
          console.log('🔔 useCars: Likes change detected:', payload);
          
          if (payload.eventType === 'DELETE') {
            // Unlike - update car to not liked
            const carId = payload.old.car_id;
            setCars(prevCars =>
              prevCars.map(c =>
                c.id === carId
                  ? {
                      ...c,
                      is_liked: false,
                      likes_count: Math.max(0, c.likes_count - 1),
                    }
                  : c
              )
            );
          } else if (payload.eventType === 'INSERT') {
            // Like - update car to liked
            const carId = payload.new.car_id;
            setCars(prevCars =>
              prevCars.map(c =>
                c.id === carId
                  ? {
                      ...c,
                      is_liked: true,
                      likes_count: c.likes_count + 1,
                    }
                  : c
              )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cars',
        },
        (payload) => {
          console.log('🔔 useCars: New car detected:', payload);
          console.log('🔄 useCars: Refreshing cars list due to new car...');
          fetchCars();
        }
      )
      .subscribe((status) => {
        console.log('🔄 useCars: Subscription status:', status);
      });

    return () => {
      console.log('🔄 useCars: Cleaning up real-time subscriptions');
      realtimeSubscription.unsubscribe();
    };
  }, [user?.id]); // Only depend on user.id to avoid unnecessary re-subscriptions

  const refreshCars = () => {
    fetchCars();
  };

  const likeCar = async (carId: string) => {
    if (!user) return;

    try {
      const car = cars.find(c => c.id === carId);
      if (!car) return;

      console.log(`💖 useCars: Toggling like for car ${carId}, current state: ${car.is_liked}`);

      // Ensure user exists in users table (fallback safety check)
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email || 'unknown@autovad.com',
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (userError) {
        console.warn('⚠️ useCars: Could not ensure user exists:', userError);
        // Continue anyway, the trigger should handle this
      }

      if (car.is_liked) {
        // Show confirmation popup for unlike
        Alert.alert(
          'Șterge din favorite',
          'Ești sigur că vrei să ștergi această mașină din favorite?',
          [
            {
              text: 'Anulează',
              style: 'cancel'
            },
            {
              text: 'Șterge',
              style: 'destructive',
              onPress: async () => {
                try {
                  // Unlike - delete the like
                  const { error } = await supabase
                    .from('likes')
                    .delete()
                    .eq('car_id', carId)
                    .eq('user_id', user.id);

                  if (error) {
                    console.error('❌ useCars: Error unliking car:', error);
                    return;
                  }

                  console.log('✅ useCars: Successfully unliked car');

                  // Update local state
                  setCars(prevCars =>
                    prevCars.map(c =>
                      c.id === carId
                        ? {
                            ...c,
                            is_liked: false,
                            likes_count: c.likes_count - 1,
                          }
                        : c
                    )
                  );

                  // Emit event to notify other components
                  DeviceEventEmitter.emit('likeStateChanged', { carId, isLiked: false });
                } catch (error) {
                  console.error('❌ useCars: Error unliking car:', error);
                  Alert.alert('Eroare', 'Nu s-a putut șterge mașina din favorite. Te rog încearcă din nou.');
                }
              }
            }
          ]
        );
      } else {
        // Like without confirmation
        const { error } = await supabase
          .from('likes')
          .insert({ car_id: carId, user_id: user.id });

        if (error) {
          console.error('❌ useCars: Error liking car:', error);
          return;
        }

        console.log('✅ useCars: Successfully liked car');

        // Update local state
        setCars(prevCars =>
          prevCars.map(c =>
            c.id === carId
              ? {
                  ...c,
                  is_liked: true,
                  likes_count: c.likes_count + 1,
                }
              : c
          )
        );

        // Emit event to notify other components
        DeviceEventEmitter.emit('likeStateChanged', { carId, isLiked: true });
      }
    } catch (error) {
      console.error('❌ useCars: Error toggling like:', error);
    }
  };

  const viewCar = async (carId: string) => {
    try {
      // console.log('👁️ useCars: Recording car view for:', carId);
      // Here you could add logic to record car views in the database
      // For now, just log it
    } catch (error) {
      console.error('❌ useCars: Error recording car view:', error);
    }
  };

  // Keep the old toggleLike for backward compatibility
  const toggleLike = async (carId: string) => {
    await likeCar(carId);
  };

  return {
    cars,
    loading,
    error,
    refreshCars,
    toggleLike,
    likeCar,
    viewCar,
  };
}