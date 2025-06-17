import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Car, Heart, MessageCircle, Share, User, Lock } from 'lucide-react-native';
import { CarPost } from '@/components/CarPost';
import { useCars } from '@/hooks/useCars';
import { useOnboarding } from '@/hooks/useOnboarding';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';

const { height } = Dimensions.get('window');

export default function PreviewScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { cars, loading, refreshCars } = useCars();
  const { incrementPreviewCarsViewed, previewCarsViewed, completeOnboarding } = useOnboarding();

  useEffect(() => {
    // Cars will be loaded automatically by useCars hook
    // If needed, we can refresh them
    if (cars.length === 0) {
      refreshCars();
    }
  }, []);

  useEffect(() => {
    // After viewing 5 cars, redirect to login
    if (previewCarsViewed >= 5) {
      completeOnboarding();
      router.replace('/(auth)/login');
    }
  }, [previewCarsViewed]);

  const handleLike = (carId: string) => {
    // Redirect to login when trying to like
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  const handleComment = (carId: string) => {
    // Redirect to login when trying to comment
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  const handleShare = (carId: string) => {
    // Redirect to login when trying to share
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  const handleCarView = async (carId: string) => {
    await incrementPreviewCarsViewed();
  };

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
      handleCarView(viewableItems[0].item.id);
    }
  };

  const renderCarPost = ({ item }: { item: any }) => (
    <CarPost
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
        likes_count: item.likes_count || 0,
        comments_count: item.comments_count || 0,
        is_liked: false,
        created_at: item.created_at,
      }}
      onLike={handleLike}
      onComment={handleComment}
      onShare={handleShare}
      onView={handleCarView}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Car size={48} color="#F97316" />
          <Text style={styles.loadingText}>Se încarcă mașini demo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Preview Header */}
      <Animated.View 
        entering={SlideInUp.delay(300)}
        style={styles.previewHeader}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Car size={24} color="#F97316" />
            <Text style={styles.logoText}>Autovad</Text>
          </View>
          <View style={styles.previewBadge}>
            <Text style={styles.previewText}>Previzualizare</Text>
          </View>
        </View>
      </Animated.View>

      {/* Car Feed */}
      <FlatList
        data={cars}
        renderItem={renderCarPost}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
      />

      {/* Progress Indicator */}
      <Animated.View 
        entering={FadeInDown.delay(500)}
        style={styles.progressContainer}
      >
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(previewCarsViewed / 5) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {previewCarsViewed} din 5 mașini preview
        </Text>
      </Animated.View>

      {/* Auth Prompt Overlay */}
      {previewCarsViewed >= 4 && (
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={styles.authOverlay}
        >
          <View style={styles.authPrompt}>
            <Lock size={32} color="#F97316" />
            <Text style={styles.authTitle}>Încă o mașină și gata!</Text>
            <Text style={styles.authSubtitle}>
              Următoarea mașină te va redirecționa către autentificare
            </Text>
            <TouchableOpacity 
              style={styles.authButton}
              onPress={() => {
                completeOnboarding();
                router.replace('/(auth)/login');
              }}
            >
              <Text style={styles.authButtonText}>Continuă</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
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
    marginTop: 16,
  },
  previewHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginLeft: 8,
  },
  previewBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F97316',
  },
  previewText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F97316',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  authOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingTop: 32,
  },
  authPrompt: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  authTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
  },
  authButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000',
    textAlign: 'center',
  },
});