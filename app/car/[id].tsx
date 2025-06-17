import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  ArrowLeft, 
  Heart, 
  Share, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Star,
  Shield,
  Building,
  User,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  Car
} from 'lucide-react-native';
import { VideoCarousel } from '@/components/VideoCarousel';
import ImageViewing from 'react-native-image-viewing';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { logActivity } from '@/lib/analytics';

const { width } = Dimensions.get('window');

type Car = Database['public']['Tables']['cars']['Row'] & {
  seller: Database['public']['Tables']['users']['Row'];
  brand?: Database['public']['Tables']['brands']['Row'] | null;
  is_liked?: boolean;
};

export default function CarDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [showFullScreenGallery, setShowFullScreenGallery] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchCarDetails();
      logCarView();
    }
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch car with seller and brand info
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select(`
          *,
          seller:users(*),
          brand:brands(*)
        `)
        .eq('id', id)
        .single();

      if (carError) throw carError;

      // Check if current user liked this car
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('car_id', id)
          .single();

        setCar({
          ...carData,
          is_liked: !!likeData,
        });
      } else {
        setCar(carData);
      }
    } catch (error) {
      console.error('Error fetching car details:', error);
      Alert.alert('Eroare', 'Nu s-au putut încărca detaliile mașinii');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const logCarView = async () => {
    try {
      await supabase.from('car_views').insert({
        user_id: user?.id || null,
        car_id: id,
      });

      if (user) {
        await logActivity(user.id, 'view', 'car', id);
      }
    } catch (error) {
      console.error('Error logging car view:', error);
    }
  };

  const handleLike = async () => {
    if (!user || !car) return;

    try {
      if (car.is_liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('car_id', car.id);

        await logActivity(user.id, 'unlike', 'car', car.id);
      } else {
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            car_id: car.id,
          });

        await logActivity(user.id, 'like', 'car', car.id);
      }

      setCar(prev => prev ? {
        ...prev,
        is_liked: !prev.is_liked,
        likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1,
      } : null);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = () => {
    Alert.alert('Distribuie', 'Funcția de distribuire va fi disponibilă în curând!');
  };

  const handleCall = () => {
    const phone = car?.brand?.phone || car?.seller?.email;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Contact', 'Informațiile de contact nu sunt disponibile');
    }
  };

  const handleMessage = () => {
    Alert.alert('Mesaj', 'Funcția de mesagerie va fi disponibilă în curând!');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ro-RO').format(mileage);
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return t('common.hoursAgo', { count: diffInHours });
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return t('common.daysAgo', { count: diffInDays });
    }
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    // Hide video when scrolled past the image gallery (approximately 300px)
    setIsVideoVisible(scrollY < 300);
  };

  const openFullScreenGallery = () => {
    setGalleryStartIndex(0);
    setIsVideoVisible(false); // Pause video when opening gallery
    setShowFullScreenGallery(true);
  };

  const closeFullScreenGallery = () => {
    setShowFullScreenGallery(false);
    setIsVideoVisible(true); // Resume video when closing gallery
  };

  const renderGalleryHeader = () => (
    <View style={styles.galleryHeader}>
      <Car size={18} color="rgba(255, 255, 255, 0.9)" />
      <Text style={styles.galleryHeaderText}>Autovad</Text>
    </View>
  );

  if (loading || !car) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('actions.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allImages = [...(car.videos || []), ...(car.images || [])];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {/* Image Gallery - Full Screen */}
        <View style={styles.imageGallery}>
          {allImages.length > 0 ? (
            <>
              <VideoCarousel 
                videos={car.videos || []} 
                images={car.images || []} 
                isVisible={isVideoVisible}
              />
              {/* Full Screen Gallery Button */}
              <TouchableOpacity 
                style={styles.fullScreenButton}
                onPress={openFullScreenGallery}
              >
                <Search size={22} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>Nicio imagine disponibilă</Text>
            </View>
          )}
        </View>

        {/* Car Info */}
        <View style={styles.carInfo}>
          <View style={styles.carHeader}>
            <View style={styles.carTitleSection}>
              <Text style={styles.carTitle}>{car.make} {car.model}</Text>
              <Text style={styles.carYear}>{car.year}</Text>
            </View>
            <Text style={styles.carPrice}>{formatPrice(car.price)}</Text>
          </View>

          {/* Key Specs */}
          <View style={styles.specsContainer}>
            <View style={styles.specItem}>
              <Gauge size={20} color="#F97316" />
              <Text style={styles.specLabel}>Kilometraj</Text>
              <Text style={styles.specValue}>{formatMileage(car.mileage)} km</Text>
            </View>
            <View style={styles.specItem}>
              <Fuel size={20} color="#F97316" />
              <Text style={styles.specLabel}>Combustibil</Text>
              <Text style={styles.specValue}>{car.fuel_type}</Text>
            </View>
            <View style={styles.specItem}>
              <Settings size={20} color="#F97316" />
              <Text style={styles.specLabel}>Transmisie</Text>
              <Text style={styles.specValue}>{car.transmission}</Text>
            </View>
          </View>

          {/* Additional Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Culoare:</Text>
              <Text style={styles.detailValue}>{car.color}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tip caroserie:</Text>
              <Text style={styles.detailValue}>{car.body_type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Locație:</Text>
              <View style={styles.locationContainer}>
                <MapPin size={16} color="#F97316" />
                <Text style={styles.detailValue}>{car.location}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Postat:</Text>
              <View style={styles.dateContainer}>
                <Calendar size={16} color="#666" />
                <Text style={styles.detailValue}>{getTimeAgo(car.created_at)}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Descriere</Text>
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text 
                style={styles.description}
                numberOfLines={showFullDescription ? undefined : 3}
              >
                {car.description}
              </Text>
              {car.description.length > 150 && (
                              <Text style={styles.showMoreText}>
                {showFullDescription ? t('actions.showLess') : t('actions.showMore')}
              </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Seller Info */}
          <View style={styles.sellerContainer}>
            <Text style={styles.sectionTitle}>
              {car.seller_type === 'brand' ? 'Dealer' : 'Vânzător'}
            </Text>
            
            {car.seller_type === 'brand' && car.brand ? (
              <View style={styles.brandInfo}>
                <View style={styles.brandHeader}>
                  <View style={styles.brandLogo}>
                    {car.brand.logo_url ? (
                      <Image source={{ uri: car.brand.logo_url }} style={styles.brandLogoImage} />
                    ) : (
                      <Building size={32} color="#F97316" />
                    )}
                  </View>
                  <View style={styles.brandDetails}>
                    <View style={styles.brandNameContainer}>
                      <Text style={styles.brandName}>{car.brand.name}</Text>
                      {car.brand.verified && (
                        <Shield size={16} color="#F97316" />
                      )}
                    </View>
                    <View style={styles.brandRating}>
                      <Star size={16} color="#F97316" fill="#F97316" />
                      <Text style={styles.ratingText}>{car.brand.rating.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.brandStats}>
                      {car.brand.total_cars} anunțuri • {car.brand.total_sold} vândute
                    </Text>
                  </View>
                </View>
                {car.brand.description && (
                  <Text style={styles.brandDescription}>{car.brand.description}</Text>
                )}
                {car.brand.address && (
                  <View style={styles.brandLocation}>
                    <MapPin size={16} color="#666" />
                    <Text style={styles.brandLocationText}>{car.brand.address}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.sellerInfo}>
                <View style={styles.sellerAvatar}>
                  {car.seller?.avatar_url ? (
                    <Image source={{ uri: car.seller.avatar_url }} style={styles.avatarImage} />
                  ) : (
                    <User size={24} color="#F97316" />
                  )}
                </View>
                <View style={styles.sellerDetails}>
                  <View style={styles.sellerNameContainer}>
                    <Text style={styles.sellerName}>{car.seller?.name || 'Vânzător necunoscut'}</Text>
                    {car.seller?.verified && (
                      <Shield size={16} color="#F97316" />
                    )}
                  </View>
                  <View style={styles.sellerRating}>
                    <Star size={16} color="#F97316" fill="#F97316" />
                    <Text style={styles.ratingText}>{car.seller?.rating?.toFixed(1) || '0.0'}</Text>
                  </View>
                  <Text style={styles.sellerStats}>
                    {car.seller?.total_listings || 0} anunțuri • {car.seller?.total_sold || 0} vândute
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Heart size={20} color="#F97316" />
              <Text style={styles.statText}>{car.likes_count} aprecieri</Text>
            </View>
            <View style={styles.statItem}>
              <Eye size={20} color="#666" />
              <Text style={styles.statText}>{car.views_count} vizualizări</Text>
            </View>
            <View style={styles.statItem}>
              <MessageCircle size={20} color="#666" />
              <Text style={styles.statText}>{car.comments_count} comentarii</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Header - Overlay */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Heart 
              size={24} 
              color={car.is_liked ? '#F97316' : '#fff'} 
              fill={car.is_liked ? '#F97316' : 'none'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Actions */}
      <View style={styles.contactActions}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
          <MessageCircle size={24} color="#fff" />
          <Text style={styles.messageButtonText}>Mesaj</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Phone size={24} color="#000" />
          <Text style={styles.callButtonText}>Sună</Text>
        </TouchableOpacity>
      </View>

      {/* Full Screen Gallery Modal */}
      <ImageViewing
        images={allImages.map(uri => ({ uri }))}
        imageIndex={galleryStartIndex}
        visible={showFullScreenGallery}
        onRequestClose={closeFullScreenGallery}
        HeaderComponent={renderGalleryHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  imageGallery: {
    height: 450,
    backgroundColor: '#1a1a1a',
    marginTop: 0,
    position: 'relative',
  },
  fullScreenButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  noImageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  carInfo: {
    padding: 24,
    backgroundColor: '#000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  carHeader: {
    marginBottom: 28,
  },
  carTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    letterSpacing: -0.5,
  },
  carYear: {
    fontSize: 20,
    fontFamily: 'Inter-Medium',
    color: '#888',
  },
  carPrice: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#F97316',
    letterSpacing: -1,
  },
  specsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  specItem: {
    alignItems: 'center',
    flex: 1,
  },
  specLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#888',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  specValue: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
  },
  detailsContainer: {
    marginBottom: 28,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#888',
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionContainer: {
    marginBottom: 28,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    lineHeight: 26,
  },
  showMoreText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#F97316',
    marginTop: 12,
  },
  sellerContainer: {
    marginBottom: 28,
  },
  brandInfo: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  brandLogoImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  brandDetails: {
    flex: 1,
  },
  brandNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandName: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginRight: 8,
    letterSpacing: -0.5,
  },
  brandRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginLeft: 6,
  },
  brandStats: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#888',
  },
  brandDescription: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    lineHeight: 22,
    marginBottom: 12,
  },
  brandLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLocationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#888',
    marginLeft: 6,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sellerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sellerName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginRight: 8,
    letterSpacing: -0.5,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sellerStats: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#888',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginLeft: 10,
  },
  contactActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 16,
    paddingBottom: 34,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#333',
  },
  messageButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginLeft: 10,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  callButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginLeft: 10,
  },
  galleryHeader: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
    zIndex: 1000,
  },
  galleryHeaderText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
  },
});