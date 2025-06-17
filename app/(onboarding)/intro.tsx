import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Car, Search, Heart, Users, ArrowRight, ChevronRight } from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Descoperă mașini premium',
    subtitle: 'Explorează cele mai frumoase mașini din România într-un format modern și captivant',
    icon: Car,
    color: '#F97316',
    image: 'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['Video prezentări', 'Poze HD', 'Detalii complete']
  },
  {
    id: 2,
    title: 'Conectează-te cu vânzători',
    subtitle: 'Găsește dealeri verificați și persoane fizice de încredere pentru următoarea ta mașină',
    icon: Users,
    color: '#3B82F6',
    image: 'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['Vânzători verificați', 'Evaluări reale', 'Contact direct']
  },
  {
    id: 3,
    title: 'Salvează favoritele',
    subtitle: 'Creează-ți colecția de mașini preferate și urmărește-le pentru actualizări',
    icon: Heart,
    color: '#EF4444',
    image: 'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['Lista de favorite', 'Notificări preț', 'Comparare rapidă']
  }
];

export default function IntroScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
    } else {
      router.replace('/(onboarding)/preview');
    }
  };

  const handleSkip = () => {
    router.replace('/(onboarding)/preview');
  };

  const onScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  const renderSlide = (slide: typeof slides[0], index: number) => {
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.8, 1, 0.8],
        Extrapolate.CLAMP
      );
      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <View key={slide.id} style={styles.slide}>
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image source={{ uri: slide.image }} style={styles.slideImage} />
          <View style={[styles.iconOverlay, { backgroundColor: slide.color }]}>
            <slide.icon size={32} color="#000" />
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(200)}
          style={styles.contentContainer}
        >
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>

          <View style={styles.featuresContainer}>
            {slide.features.map((feature, idx) => (
              <Animated.View
                key={idx}
                entering={FadeInDown.delay(300 + idx * 100)}
                style={styles.featureItem}
              >
                <View style={[styles.featureDot, { backgroundColor: slide.color }]} />
                <Text style={styles.featureText}>{feature}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Car size={32} color="#F97316" />
          <Text style={styles.logoText}>Autovad</Text>
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Sari</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentSlide ? '#F97316' : '#333',
                  width: index === currentSlide ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentSlide === slides.length - 1 ? 'Începe' : 'Următorul'}
          </Text>
          <ArrowRight size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginLeft: 8,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 48,
    alignItems: 'center',
  },
  slideImage: {
    width: width - 48,
    height: 280,
    borderRadius: 24,
    resizeMode: 'cover',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: -20,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  slideTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  featuresContainer: {
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  nextButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginRight: 8,
  },
});