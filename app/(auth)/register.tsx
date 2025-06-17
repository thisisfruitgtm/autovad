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
import { 
  Car, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  Heart, 
  MessageCircle, 
  Search, 
  Star,
  Shield,
  Zap,
  Bell
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { signUp, signInWithGoogle } = useAuth();
  const { t } = useTranslation();
  
  // Animation values
  const translateX = useSharedValue(0);
  const autoScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Eroare', t('auth.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Eroare', t('auth.passwordsDontMatch'));
      return;
    }

    if (password.length < 6) {
      Alert.alert('Eroare', t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, name);
      if (error) {
        Alert.alert(t('auth.registrationFailed'), error.message);
      } else {
        Alert.alert(
          'Succes',
          t('auth.accountCreated'),
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } catch (error) {
      Alert.alert('Eroare', 'A apărut o eroare neașteptată');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert(t('auth.registrationFailed'), error instanceof Error ? error.message : 'An error occurred');
      }
    } catch (error) {
      Alert.alert('Eroare', 'A apărut o eroare neașteptată');
    } finally {
      setLoading(false);
    }
  };

  const premiumFeatures = [
    {
      icon: Heart,
      title: 'Salvează nelimitat',
      description: 'Creează liste de favorite fără restricții',
      color: '#EF4444',
    },
    {
      icon: MessageCircle,
      title: 'Contact direct',
      description: 'Comunică instant cu vânzătorii',
      color: '#3B82F6',
    },
    {
      icon: Bell,
      title: 'Notificări personalizate',
      description: 'Primește alerte pentru mașinile dorite',
      color: '#8B5CF6',
    },
    {
      icon: Search,
      title: 'Căutare avansată',
      description: 'Filtre detaliate și căutare inteligentă',
      color: '#10B981',
    },
    {
      icon: Star,
      title: 'Evaluări și recenzii',
      description: 'Vezi și lasă evaluări pentru vânzători',
      color: '#F59E0B',
    },
    {
      icon: Shield,
      title: 'Profil verificat',
      description: 'Câștigă încrederea în comunitate',
      color: '#F97316',
    },
  ];

  const slideWidth = screenWidth - 48; // Minus padding
  const totalSlides = premiumFeatures.length;

  // Auto-scroll function
  const startAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearTimeout(autoScrollTimer.current);
    }
    
    autoScrollTimer.current = setTimeout(() => {
      const nextSlide = (currentSlide + 1) % totalSlides;
      goToSlide(nextSlide);
    }, 3500); // Change slide every 3.5 seconds
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
              <Text style={styles.welcomeTitle}>Alătură-te comunității!</Text>
              <Text style={styles.subtitle}>
                Creează-ți contul gratuit și descoperă toate beneficiile
              </Text>
            </Animated.View>

            {/* Premium Features Slider */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.featuresSection}>
              <View style={styles.featuresHeader}>
                <Zap size={24} color="#F97316" />
                <Text style={styles.featuresTitle}>Ce primești gratuit:</Text>
              </View>
              
              <View style={styles.sliderContainer}>
                <GestureDetector gesture={panGesture}>
                  <Animated.View style={[styles.slider, animatedStyle]}>
                    {premiumFeatures.map((feature, index) => (
                      <View key={index} style={[styles.slide, { width: slideWidth }]}>
                        <View style={styles.featureCard}>
                          <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                            <feature.icon size={20} color={feature.color} />
                          </View>
                          <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>{feature.title}</Text>
                            <Text style={styles.featureDescription}>{feature.description}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </Animated.View>
                </GestureDetector>
                
                {/* Pagination Indicators */}
                <View style={styles.pagination}>
                  {premiumFeatures.map((_, index) => (
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

            {/* Registration Form */}
            <Animated.View entering={FadeInDown.delay(400)} style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.fullName')}</Text>
                <View style={styles.inputContainer}>
                  <User size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder={t('auth.enterFullName')}
                    placeholderTextColor="#666"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.email')}</Text>
                <View style={styles.inputContainer}>
                  <Mail size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder={t('auth.enterEmail')}
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.password')}</Text>
                <View style={styles.passwordContainer}>
                  <Lock size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t('auth.createPassword')}
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
                <View style={styles.passwordContainer}>
                  <Lock size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t('auth.confirmYourPassword')}
                    placeholderTextColor="#666"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#666" />
                    ) : (
                      <Eye size={20} color="#666" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>
                  {loading ? t('auth.creatingAccount') : 'Creează cont gratuit'}
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
                <Text style={styles.footerText}>{t('auth.alreadyHaveAccount')}</Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.linkText}>{t('auth.signIn')}</Text>
                  </TouchableOpacity>
                </Link>
              </View>
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
  featuresSection: {
    marginBottom: 32,
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginLeft: 8,
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
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
  },
  paginationDotActive: {
    backgroundColor: '#F97316',
    width: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputIcon: {
    marginLeft: 16,
  },
  inputWithIcon: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
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
    paddingLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
  },
  eyeButton: {
    padding: 16,
  },
  registerButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
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
});