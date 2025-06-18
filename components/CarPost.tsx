import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Car } from '@/types/car';
import { VideoCarousel } from './VideoCarousel';
import { Heart, MessageCircle, Share, MapPin, Fuel, Gauge, Building, User, Shield } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface CarPostProps {
  car: Car & {
    seller?: any;
    brand?: any;
    seller_type?: 'individual' | 'brand';
  };
  onLike: (carId: string) => void;
  onComment: (carId: string) => void;
  onShare: (carId: string) => void;
  onView?: (carId: string) => void;
  isVisible?: boolean;
}

export function CarPost({ car, onLike, onComment, onShare, onView, isVisible = true }: CarPostProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { t, currentLanguage } = useTranslation();

  const formatPrice = (price: number) => {
    const locale = currentLanguage === 'ro' ? 'ro-RO' : 'en-US';
    const currency = currentLanguage === 'ro' ? 'RON' : 'USD';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    const locale = currentLanguage === 'ro' ? 'ro-RO' : 'en-US';
    return new Intl.NumberFormat(locale).format(mileage);
  };

  const handleCarPress = () => {
    router.push(`/car/${car.id}`);
  };

  // Handle demo cars without seller
  const seller = car.seller || {
    id: 'demo',
    name: 'Autovad Demo',
    avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    rating: 5.0,
    verified: true,
  };

  return (
    <View style={styles.container}>
      <VideoCarousel videos={car.videos} images={car.images} isVisible={isVisible} />
      
      {/* Overlay Content */}
      <View style={styles.overlay}>
        {/* Top Info */}
        <Animated.View 
          entering={FadeInDown.delay(100)}
          style={styles.topInfo}
        >
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(car.price)}</Text>
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{car.year}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Bottom Info */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={styles.bottomInfo}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
            locations={[0, 0.5, 1]}
            style={styles.gradientBackground}
          />
          <View style={styles.leftSection}>
            <TouchableOpacity onPress={handleCarPress} activeOpacity={0.8}>
              <Text style={styles.carTitle}>
                {car.make} {car.model}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.specs}>
              <View style={styles.specItem}>
                <Gauge size={16} color="#F97316" />
                <Text style={styles.specText}>
                  {formatMileage(car.mileage)} {t('units.km')}
                </Text>
              </View>
              <View style={styles.specItem}>
                <Fuel size={16} color="#F97316" />
                <Text style={styles.specText}>{car.fuel_type}</Text>
              </View>
              <View style={styles.specItem}>
                <MapPin size={16} color="#F97316" />
                <Text style={styles.specText}>{car.location}</Text>
              </View>
            </View>

            <View style={styles.sellerInfo}>
              <View style={styles.avatar}>
                {car.seller_type === 'brand' && car.brand ? (
                  <Building size={20} color="#000" />
                ) : (
                  <User size={20} color="#000" />
                )}
              </View>
              <View style={styles.sellerDetails}>
                <View style={styles.sellerNameContainer}>
                  <Text style={styles.sellerName}>
                    {car.seller_type === 'brand' && car.brand ? car.brand.name : seller.name}
                  </Text>
                  {((car.seller_type === 'brand' && car.brand?.verified) || 
                    (car.seller_type === 'individual' && seller.verified)) && (
                    <Shield size={12} color="#F97316" />
                  )}
                </View>
                <Text style={styles.sellerRating}>
                  ⭐ {car.seller_type === 'brand' && car.brand ? car.brand.rating : seller.rating}
                </Text>
              </View>
            </View>

            <View style={styles.descriptionContainer}>
              <Text 
                style={styles.description}
                numberOfLines={showFullDescription ? undefined : 2}
              >
                {car.description}
              </Text>
              {car.description.length > 100 && (
                <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
                  <Text style={styles.showMore}>
                    {showFullDescription ? t('actions.showLess') : t('actions.showMore')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.rightSection}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onLike(car.id)}
              testID="like-button"
            >
              <Heart 
                size={32} 
                color={car.is_liked ? '#F97316' : '#fff'} 
                fill={car.is_liked ? '#F97316' : 'none'}
              />
              <Text style={styles.actionText}>{car.likes_count || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onComment(car.id)}
              testID="comment-button"
            >
              <MessageCircle size={32} color="#fff" />
              <Text style={styles.actionText}>{car.comments_count || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onShare(car.id)}
            >
              <Share size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  topInfo: {
    alignSelf: 'flex-start',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  price: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#F97316',
    marginRight: 12,
  },
  yearBadge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  yearText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    left: -16,
    right: -16,
    bottom: -100,
    top: -50,
    zIndex: 0,
  },
  leftSection: {
    flex: 1,
    marginRight: 16,
    zIndex: 1,
  },
  carTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
    textDecorationLine: 'underline',
    textDecorationColor: '#F97316',
  },
  specs: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginLeft: 4,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginRight: 4,
  },
  sellerRating: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#ccc',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    lineHeight: 20,
  },
  showMore: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F97316',
    marginTop: 4,
  },
  rightSection: {
    alignItems: 'center',
    zIndex: 1,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginTop: 4,
  },
});