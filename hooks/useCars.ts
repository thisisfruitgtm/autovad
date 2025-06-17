import { useState, useEffect } from 'react';
import { Car } from '@/types/car';
import { useAuth } from './useAuth';
import { CarService } from '@/services/carService';
import { supabase } from '@/lib/supabase';

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

  const refreshCars = () => {
    fetchCars();
  };

  const likeCar = async (carId: string) => {
    if (!user) return;

    try {
      const car = cars.find(c => c.id === carId);
      if (!car) return;

      console.log(`💖 useCars: Toggling like for car ${carId}, current state: ${car.is_liked}`);

      if (car.is_liked) {
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
      } else {
        // Like - insert new like
        const { error } = await supabase
          .from('likes')
          .insert({ car_id: carId, user_id: user.id });

        if (error) {
          console.error('❌ useCars: Error liking car:', error);
          return;
        }

        console.log('✅ useCars: Successfully liked car');
      }

      // Update local state
      setCars(prevCars =>
        prevCars.map(c =>
          c.id === carId
            ? {
                ...c,
                is_liked: !c.is_liked,
                likes_count: c.is_liked ? c.likes_count - 1 : c.likes_count + 1,
              }
            : c
        )
      );
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