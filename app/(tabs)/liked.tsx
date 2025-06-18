import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Heart, MapPin, Calendar } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { CarService } from '@/services/carService';
import { Car } from '@/types/car';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeOut,
  Layout,
  SlideOutRight,
  runOnJS,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';

function LikedScreen() {
  const { user, loading: authLoading } = useAuth();
  const [likedCars, setLikedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch liked cars from Supabase
  const fetchLikedCars = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('likes')
        .select(`
          car_id,
          cars!inner (
            *,
            seller:users(id, name, avatar_url, rating, verified)
          )
        `)
        .eq('user_id', user.id)
        .eq('cars.status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedCars: Car[] = data.map((like: any) => {
        const car = like.cars;
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
          videos: car.videos || [],
          images: car.images || [],
          description: car.description,
          location: car.location,
          seller: car.seller ? {
            id: car.seller.id,
            name: car.seller.name,
            avatar_url: car.seller.avatar_url,
            rating: car.seller.rating || 0,
            verified: car.seller.verified || false,
          } : undefined,
          likes_count: car.likes_count || 0,
          comments_count: car.comments_count || 0,
          is_liked: true,
          created_at: car.created_at,
        };
      });

      setLikedCars(transformedCars);
    } catch (error) {
      console.error('Error fetching liked cars:', error);
      setLikedCars([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchLikedCars();
      }
      // Tab became active - refresh liked cars
      return () => {
        // Tab lost focus - no cleanup needed
      };
    }, [user])
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleUnlike = async (car: Car) => {
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
              // Remove from database - Realtime will handle the main feed update
              const { error } = await supabase
                .from('likes')
                .delete()
                .eq('car_id', car.id)
                .eq('user_id', user!.id);

              if (error) throw error;

              // Emit event to notify other components
              DeviceEventEmitter.emit('likeStateChanged', { carId: car.id, isLiked: false });

              // Remove from local state to trigger animation
              setLikedCars(prev => prev.filter(c => c.id !== car.id));
              
            } catch (error) {
              console.error('Error unliking car:', error);
              Alert.alert('Eroare', 'Nu s-a putut șterge mașina din favorite. Te rog încearcă din nou.');
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authRequired}>
          <Text style={styles.authTitle}>Autentificare necesară</Text>
          <Text style={styles.authSubtitle}>
            Pentru a vedea mașinile favorite trebuie să fii autentificat
          </Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.authButtonText}>Conectează-te</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (authLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mașini favorite</Text>
          <View style={styles.heartIcon}>
            <Heart size={24} color="#F97316" fill="#F97316" />
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>Se încarcă...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mașini favorite</Text>
        <View style={styles.heartIcon}>
          <Heart size={24} color="#F97316" fill="#F97316" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {likedCars.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={64} color="#333" />
            <Text style={styles.emptyTitle}>Nicio mașină favorită</Text>
            <Text style={styles.emptySubtitle}>
              Începe să explorezi și să adaugi mașini la favorite
            </Text>
          </View>
        ) : (
          <View style={styles.carsList}>
            {likedCars.map((car, index) => (
              <Animated.View
                key={car.id}
                entering={FadeInDown.delay(index * 100)}
                exiting={SlideOutRight.duration(300)}
                layout={Layout.springify().damping(15).stiffness(150)}
              >
                <TouchableOpacity 
                  style={styles.carCard}
                  onPress={() => router.push(`/car/${car.id}`)}
                >
                  <Image source={{ uri: car.images[0] }} style={styles.carImage} />
                  
                  <TouchableOpacity 
                    style={styles.heartButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleUnlike(car);
                    }}
                  >
                    <Heart size={20} color="#F97316" fill="#F97316" />
                  </TouchableOpacity>

                  <View style={styles.carInfo}>
                    <View style={styles.carHeader}>
                      <Text style={styles.carTitle}>{car.make} {car.model}</Text>
                      <Text style={styles.carYear}>{car.year}</Text>
                    </View>
                    
                    <Text style={styles.carPrice}>{formatPrice(car.price)}</Text>
                    
                    <View style={styles.carSpecs}>
                      <View style={styles.specItem}>
                        <Text style={styles.specLabel}>Mileage</Text>
                        <Text style={styles.specValue}>{formatMileage(car.mileage)} mi</Text>
                      </View>
                      <View style={styles.specItem}>
                        <Text style={styles.specLabel}>Fuel</Text>
                        <Text style={styles.specValue}>{car.fuel_type}</Text>
                      </View>
                      <View style={styles.specItem}>
                        <Text style={styles.specLabel}>Type</Text>
                        <Text style={styles.specValue}>{car.body_type}</Text>
                      </View>
                    </View>

                    <View style={styles.carMeta}>
                      <View style={styles.metaItem}>
                        <MapPin size={14} color="#666" />
                        <Text style={styles.metaText}>{car.location}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Calendar size={14} color="#666" />
                        <Text style={styles.metaText}>{getTimeAgo(new Date(car.created_at))}</Text>
                      </View>
                    </View>

                    <View style={styles.sellerInfo}>
                      <View style={styles.sellerAvatar}>
                        <Text style={styles.sellerInitials}>
                          {car.seller?.name.split(' ').map(n => n[0]).join('') || 'U'}
                        </Text>
                      </View>
                      <View style={styles.sellerDetails}>
                        <Text style={styles.sellerName}>{car.seller?.name || 'Unknown'}</Text>
                        <Text style={styles.sellerRating}>⭐ {car.seller?.rating || 0}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Export memoized component for maximum performance
export default React.memo(LikedScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  heartIcon: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  carsList: {
    paddingBottom: 20,
  },
  carCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
  },
  carInfo: {
    padding: 16,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  carYear: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  carPrice: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#F97316',
    marginBottom: 12,
  },
  carSpecs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  specItem: {
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  carMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerInitials: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  sellerRating: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  authRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  authTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  authSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  authButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
});