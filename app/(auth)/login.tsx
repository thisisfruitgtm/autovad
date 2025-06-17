import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Car, Eye, EyeOff, Heart, MessageCircle, Search, Star, Shield } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { signIn, signInWithGoogle } = useAuth();
  const { t } = useTranslation();
  
  // Animation values
  const translateX = useSharedValue(0);
  const autoScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Eroare', t('auth.fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert(t('auth.loginFailed'), error.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Eroare', 'A apărut o eroare neașteptată');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('[GoogleSignIn] Button pressed');
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      
      // Type guard to check if result has error property
      if (result && 'error' in result && result.error) {
        console.error('[GoogleSignIn] Error:', result.error);
        Alert.alert(
          t('auth.loginFailed'),
          result.error instanceof Error ? result.error.message : 'An error occurred during Google sign in'
        );
      } else {
        // Success case - user should be automatically redirected by useAuth
        console.log('[GoogleSignIn] Success');
      }
    } catch (error) {
      console.error('[GoogleSignIn] Exception:', error);
      Alert.alert('Eroare', 'A apărut o eroare neașteptată');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Heart,
      title: 'Salvează favoritele',
      description: 'Creează-ți lista de mașini preferate',
      color: '#EF4444',
    },
    {
      icon: MessageCircle,
      title: 'Contactează vânzătorii',
      description: 'Comunică direct cu dealerii și persoanele fizice',
      color: '#3B82F6',
    },
    {
      icon: Search,
      title: 'Căutare avansată',
      description: 'Filtrează după preț, marcă, locație și multe altele',
      color: '#10B981',
    },
    {
      icon: Star,
      title: 'Evaluări și recenzii',
      description: 'Vezi evaluările altor cumpărători',
      color: '#F59E0B',
    },
  ];

  const slideWidth = screenWidth - 48; // Minus padding
  const totalSlides = benefits.length;

  // Auto-scroll function
  const startAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearTimeout(autoScrollTimer.current);
    }
    
    autoScrollTimer.current = setTimeout(() => {
      const nextSlide = (currentSlide + 1) % totalSlides;
      goToSlide(nextSlide);
    }, 3000); // Change slide every 3 seconds
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    translateX.value = withTiming(-index * slideWidth, { duration: 800 });
    startAutoScroll();
  };

  // Gesture handler
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newTranslateX = -currentSlide * slideWidth + event.translationX;
      translateX.value = newTranslateX;
    })
    .onEnd((event) => {
      const threshold = slideWidth * 0.3;
      let newIndex = currentSlide;

      if (event.translationX > threshold && currentSlide > 0) {
        newIndex = currentSlide - 1;
      } else if (event.translationX < -threshold && currentSlide < totalSlides - 1) {
        newIndex = currentSlide + 1;
      }

      runOnJS(goToSlide)(newIndex);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Start auto-scroll on mount
  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollTimer.current) {
        clearTimeout(autoScrollTimer.current);
      }
    };
  }, []);

  // Reset auto-scroll when slide changes
  useEffect(() => {
    startAutoScroll();
  }, [currentSlide]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
              <View style={styles.logoContainer}>
                <Car size={48} color="#F97316" />
                <Text style={styles.logoText}>Autovad</Text>
              </View>
              <Text style={styles.welcomeTitle}>{t('auth.welcome')}</Text>
              <Text style={styles.subtitle}>
                {t('auth.welcomeSubtitle')}
              </Text>
            </Animated.View>

            {/* Benefits Slider */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>De ce să te conectezi?</Text>
              
              <View style={styles.sliderContainer}>
                <GestureDetector gesture={panGesture}>
                  <Animated.View style={[styles.slider, animatedStyle]}>
                    {benefits.map((benefit, index) => (
                      <View key={index} style={[styles.slide, { width: slideWidth }]}>
                        <View style={styles.benefitItem}>
                          <View style={[styles.benefitIcon, { backgroundColor: `${benefit.color}20` }]}>
                            <benefit.icon size={24} color={benefit.color} />
                          </View>
                          <View style={styles.benefitContent}>
                            <Text style={styles.benefitTitle}>{benefit.title}</Text>
                            <Text style={styles.benefitDescription}>{benefit.description}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </Animated.View>
                </GestureDetector>
                
                {/* Pagination Indicators */}
                <View style={styles.pagination}>
                  {benefits.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.paginationDot,
                        currentSlide === index && styles.paginationDotActive
                      ]}
                      onPress={() => goToSlide(index)}
                    />
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* Login Form */}
            <Animated.View entering={FadeInDown.delay(400)} style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.email')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.enterEmail')}
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.password')}</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t('auth.enterPassword')}
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#666" />
                    ) : (
                      <Eye size={20} color="#666" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? t('auth.signingIn') : t('auth.signIn')}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('auth.or')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[styles.googleButton, loading && styles.googleButtonDisabled]}
                onPress={handleGoogleSignIn}
                disabled={loading}
              >
                <Text style={styles.googleButtonText}>{t('auth.signInWithGoogle')}</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>{t('auth.dontHaveAccount')}</Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Text style={styles.linkText}>{t('auth.signUp')}</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Debug Link - Only in development */}
              {__DEV__ && (
                <View style={styles.debugContainer}>
                  <TouchableOpacity 
                    style={styles.debugButton}
                    onPress={() => router.push('/debug-oauth' as any)}
                  >
                    <Text style={styles.debugText}>🔧 Debug OAuth</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginLeft: 12,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsSection: {
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  sliderContainer: {
    height: 120,
    position: 'relative',
  },
  slider: {
    flexDirection: 'row',
    height: '100%',
  },
  slide: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  paginationDotActive: {
    backgroundColor: '#F97316',
    width: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
  },
  eyeButton: {
    padding: 16,
  },
  loginButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  linkText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F97316',
  },
  debugContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  debugButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  debugText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#888',
  },
});