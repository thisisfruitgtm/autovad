import { useState, useEffect } from 'react';
import { Car } from '@/types/car';
import { useAuth } from './useAuth';
import { CarService } from '@/services/carService';

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
      const fetchedCars = await CarService.getCars();
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

      const newLikedState = await CarService.toggleLike(carId, user.id, car.is_liked);

      // Update local state
      setCars(prevCars =>
        prevCars.map(c =>
          c.id === carId
            ? {
                ...c,
                is_liked: newLikedState,
                likes_count: newLikedState ? c.likes_count + 1 : c.likes_count - 1,
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