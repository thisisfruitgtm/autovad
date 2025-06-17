import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { CarPost } from '@/components/CarPost';
import { useCars } from '@/hooks/useCars';
import { useAuth } from '@/hooks/useAuth';
import { useViewedCars } from '@/hooks/useViewedCars';
import { useTranslation } from '@/hooks/useTranslation';
import { Car, X, RefreshCw } from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

// Memoized CarPost component for better performance
const MemoizedCarPost = React.memo(CarPost);

function Feed() {
  const { user } = useAuth();
  const { cars, loading, error, likeCar, viewCar, refreshCars } = useCars();
  const { viewedCount, shouldShowLogin, incrementViewedCount, resetViewedCount, minViewsRequired } = useViewedCars();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [isTabFocused, setIsTabFocused] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();
  const viewedCarsRef = useRef(new Set<string>());
  const hasUserInteracted = useRef(false);
  
  // Loading animation values
  const loadingRotation = useSharedValue(0);
  const loadingOpacity = useSharedValue(1);

  // console.log('🏠 Feed: Component rendering in tabs');

  // Debug logs for Supabase connection - commented out for cleaner output
  // useEffect(() => {
  //   console.log('🔧 Feed Debug - Environment Variables:');
  //   console.log('  EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
  //   console.log('  EXPO_PUBLIC_SUPABASE_ANON_KEY length:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.length || 0);
  //   console.log('  Has Supabase URL:', !!process.env.EXPO_PUBLIC_SUPABASE_URL);
  //   console.log('  Has Supabase Key:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
  //   
  //   // Test basic network connectivity
  //   console.log('🌐 Testing network connectivity...');
  //   fetch('https://httpbin.org/get')
  //     .then(response => {
  //       console.log('✅ Network test successful:', response.status);
  //       return response.json();
  //     })
  //     .then(data => {
  //       console.log('📡 Network test data:', data.origin);
  //     })
  //     .catch(error => {
  //       console.error('❌ Network test failed:', error);
  //     });
  //   
  //   // Test Supabase endpoint directly
  //   console.log('🔍 Testing Supabase endpoint...');
  //   const supabaseUrl = 'https://mktfybjfxzhvpmnepshq.supabase.co';
  //   const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdGZ5YmpmeHpodnBtbmVwc2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNTkwMDksImV4cCI6MjA2NTYzNTAwOX0.Z8jufqlJIEkJ4SQkricOqIC4XnCFz0Odq2QRB9Wpm_8';
  //   
  //   fetch(`${supabaseUrl}/rest/v1/cars?limit=1`, {
  //     method: 'GET',
  //     headers: {
  //       'apikey': supabaseKey,
  //       'Authorization': `Bearer ${supabaseKey}`,
  //       'Content-Type': 'application/json',
  //       'Accept': 'application/json',
  //     },
  //   })
  //     .then(response => {
  //       console.log('🎯 Supabase test response status:', response.status);
  //       console.log('🎯 Supabase test response headers:', Object.fromEntries(response.headers.entries()));
  //       return response.text();
  //     })
  //     .then(text => {
  //       console.log('🎯 Supabase test response body:', text.substring(0, 200));
  //       try {
  //         const json = JSON.parse(text);
  //         console.log('✅ Supabase test successful, cars found:', json.length);
  //       } catch (e) {
  //         console.log('⚠️ Supabase response is not JSON:', text);
  //       }
  //     })
  //     .catch(error => {
  //       console.error('❌ Supabase test failed:', error);
  //       console.error('❌ Error details:', {
  //         name: error.name,
  //         message: error.message,
  //         stack: error.stack?.substring(0, 200),
  //       });
  //     });
  // }, []);

  // console.log('🏠 Feed render - user:', !!user, 'viewedCount:', viewedCount, 'cars:', cars.length, 'loading:', loading, 'error:', error);

  // Enhanced loading animation
  useEffect(() => {
    if (loading) {
      loadingRotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
      loadingOpacity.value = withRepeat(
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      loadingRotation.value = 0;
      loadingOpacity.value = 1;
    }
  }, [loading]);

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${loadingRotation.value}deg` }],
    opacity: loadingOpacity.value,
  }));

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCars();
    } catch (error) {
      console.error('Error refreshing cars:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshCars]);

  const viewabilityConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 60, // Item must be 60% visible to count as viewed
    minimumViewTime: 500, // Item must be visible for at least 500ms
  });

  const onViewableItemsChangedRef = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      // For paginated FlatList, take the first visible item as it's the main one
      const currentVisibleItem = viewableItems[0];
      
      if (currentVisibleItem && currentVisibleItem.isViewable) {
        // Update current visible index for video control
        setCurrentVisibleIndex(currentVisibleItem.index || 0);
        
        // Track views for non-authenticated users when cars come into view
        if (!user && !viewedCarsRef.current.has(currentVisibleItem.item.id)) {
          viewedCarsRef.current.add(currentVisibleItem.item.id);
          incrementViewedCount();
        }
      }
    }
  });

  const onScrollBeginDrag = () => {
    // User started scrolling - no action needed
  };

  const onMomentumScrollEnd = () => {
    // Scroll momentum ended - no action needed
  };

  useEffect(() => {
    if (shouldShowLogin && !user && !showLoginModal) {
      setShowLoginModal(true);
    }
  }, [shouldShowLogin, user, showLoginModal]);

  // Reset viewed count when user logs in
  useEffect(() => {
    if (user) {
      resetViewedCount();
      setShowLoginModal(false);
      // Also clear the viewed cars set
      viewedCarsRef.current.clear();
    }
  }, [user, resetViewedCount]);

  // Optimize tab focus behavior
  useFocusEffect(
    useCallback(() => {
      // Tab became active
      setIsTabFocused(true);
      return () => {
        // Tab lost focus - pause all videos
        setIsTabFocused(false);
      };
    }, [])
  );

  const handleLike = useCallback(async (carId: string) => {
    if (!user) {
      Alert.alert(
        'Conectează-te pentru a aprecia',
        'Pentru a aprecia mașini și a accesa toate funcțiile, te rog să te conectezi.',
        [
          { text: 'Mai târziu', style: 'cancel' },
          { text: 'Conectează-te', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }
    await likeCar(carId);
  }, [user, likeCar]);

  const handleComment = useCallback((carId: string) => {
    if (!user) {
      Alert.alert(
        'Conectează-te pentru a comenta',
        'Pentru a comenta și a interacționa cu comunitatea, te rog să te conectezi.',
        [
          { text: 'Mai târziu', style: 'cancel' },
          { text: 'Conectează-te', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }
    Alert.alert('Comments', 'Comments feature coming soon!');
  }, [user]);

  const handleShare = useCallback((carId: string) => {
    Alert.alert('Share', 'Share feature coming soon!');
  }, []);

  const handleCarView = useCallback(async (carId: string) => {
    await viewCar(carId);
  }, [viewCar]);

  const handleLoginModalClose = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const handleLoginFromModal = useCallback(() => {
    setShowLoginModal(false);
    router.push('/(auth)/login');
  }, []);

  const renderCarPost = useCallback(({ item, index }: { item: any; index: number }) => (
    <MemoizedCarPost
      car={{
        id: item.id,
        make: item.make,
        model: item.model,
        year: item.year,
        price: item.price,
        mileage: item.mileage,
        color: item.color,
        fuel_type: item.fuel_type,
        transmission: item.transmission,
        body_type: item.body_type,
        videos: item.videos || [],
        images: item.images || [],
        description: item.description,
        location: item.location,
        seller: item.seller,
        likes_count: item.likes_count,
        comments_count: item.comments_count,
        is_liked: item.is_liked || false,
        created_at: item.created_at,
      }}
      onLike={handleLike}
      onComment={handleComment}
      onShare={handleShare}
      onView={handleCarView}
      isVisible={index === currentVisibleIndex && isTabFocused}
    />
  ), [currentVisibleIndex, isTabFocused, handleLike, handleComment, handleShare, handleCarView]);

  // Memoize FlatList props for better performance
  const flatListProps = useMemo(() => ({
    data: cars,
    renderItem: renderCarPost,
    keyExtractor: (item: any) => item.id,
    pagingEnabled: true,
    showsVerticalScrollIndicator: false,
    snapToInterval: height,
    snapToAlignment: 'start' as const,
    decelerationRate: 'fast' as const,
    onViewableItemsChanged: onViewableItemsChangedRef.current,
    viewabilityConfig: viewabilityConfigRef.current,
    onScrollBeginDrag,
    onMomentumScrollEnd,
    // Pull to refresh
    refreshing,
    onRefresh: handleRefresh,
    // Performance optimizations
    removeClippedSubviews: true,
    maxToRenderPerBatch: 1,
    windowSize: 3,
    initialNumToRender: 1,
    updateCellsBatchingPeriod: 50,
    getItemLayout: (_: any, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
  }), [cars, renderCarPost, height, onScrollBeginDrag, onMomentumScrollEnd, refreshing, handleRefresh]);

  if (loading) {
    return (
      <Animated.View 
        entering={FadeInUp.delay(100)} 
        style={styles.loadingContainer}
      >
        <Animated.View style={loadingAnimatedStyle}>
          <Car size={64} color="#F97316" />
        </Animated.View>
        <Animated.Text 
          entering={FadeInDown.delay(300)}
          style={styles.loadingText}
        >
          {t('feed.loadingCars')}
        </Animated.Text>
        <Animated.View 
          entering={FadeInDown.delay(500)}
          style={styles.loadingSubtitle}
        >
          <Text style={styles.loadingSubtitleText}>
            Se încarcă cele mai noi mașini pentru tine...
          </Text>
        </Animated.View>
      </Animated.View>
    );
  }

  if (error) {
    return (
      <Animated.View 
        entering={FadeInUp.delay(100)} 
        style={styles.errorContainer}
      >
        <Animated.View entering={FadeInDown.delay(200)}>
          <RefreshCw size={64} color="#EF4444" />
        </Animated.View>
        <Animated.Text 
          entering={FadeInDown.delay(300)}
          style={styles.errorText}
        >
          {t('feed.failedToLoad')}
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(400)}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <RefreshCw size={20} color="#000" />
            <Text style={styles.retryButtonText}>{t('feed.retry')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  }

  if (cars.length === 0) {
    return (
      <Animated.View 
        entering={FadeInUp.delay(100)} 
        style={styles.emptyContainer}
      >
        <Animated.View entering={FadeInDown.delay(200)}>
          <Car size={80} color="#333" />
        </Animated.View>
        <Animated.Text 
          entering={FadeInDown.delay(300)}
          style={styles.emptyTitle}
        >
          {t('feed.noCarsAvailable')}
        </Animated.Text>
        <Animated.Text 
          entering={FadeInDown.delay(400)}
          style={styles.emptySubtitle}
        >
          {t('feed.beFirstToPost')}
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(500)}>
          <TouchableOpacity style={styles.exploreButton} onPress={handleRefresh}>
            <RefreshCw size={20} color="#F97316" />
            <Text style={styles.exploreButtonText}>Reîncarcă</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList {...flatListProps} />

      {/* Login Modal */}
      <Modal
        visible={showLoginModal}
        transparent
        animationType="slide"
        onRequestClose={handleLoginModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={handleLoginModalClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
            
            <Car size={64} color="#F97316" />
            
            <Text style={styles.modalTitle}>{t('feed.likeWhatYouSee')}</Text>
            <Text style={styles.modalSubtitle}>
              Ai văzut {viewedCount} din {minViewsRequired} {t('feed.freeListings')}.
            </Text>
            <Text style={styles.modalDescription}>
              {t('feed.joinCommunity')}
            </Text>
            
            <TouchableOpacity style={styles.loginButton} onPress={handleLoginFromModal}>
              <Text style={styles.loginButtonText}>{t('feed.signUpNow')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.laterButton} onPress={handleLoginModalClose}>
              <Text style={styles.laterButtonText}>{t('feed.continueBrowsing')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>




      
    </View>
  );
}

// Export memoized component for maximum performance
export default React.memo(Feed);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  loadingSubtitle: {
    alignItems: 'center',
    marginTop: 16,
  },
  loadingSubtitleText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#F97316',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    textAlign: 'center',
  },
  laterButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
  },
  laterButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
    textAlign: 'center',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#F97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 24,
  },
  exploreButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F97316',
  },
});