import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Heart, MapPin, Calendar } from 'lucide-react-native';
import { mockCars } from '@/data/mockData';
import { Car } from '@/types/car';

function LikedScreen() {
  const [likedCars] = useState<Car[]>(mockCars.filter(car => car.is_liked));

  // Optimize tab focus behavior
  useFocusEffect(
    useCallback(() => {
      // Tab became active - liked data is already loaded
      return () => {
        // Tab lost focus - keep data in memory
      };
    }, [])
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Liked Cars</Text>
        <View style={styles.heartIcon}>
          <Heart size={24} color="#F97316" fill="#F97316" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {likedCars.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={64} color="#333" />
            <Text style={styles.emptyTitle}>No Liked Cars Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start exploring and like cars you're interested in
            </Text>
          </View>
        ) : (
          <View style={styles.carsList}>
            {likedCars.map((car) => (
              <TouchableOpacity key={car.id} style={styles.carCard}>
                <Image source={{ uri: car.images[0] }} style={styles.carImage} />
                
                <TouchableOpacity style={styles.heartButton}>
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
});