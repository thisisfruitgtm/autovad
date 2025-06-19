import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { 
  Settings, 
  Edit, 
  Car, 
  Heart, 
  Users, 
  Star,
  MapPin,
  Calendar,
  ShoppingBag,
  Trophy,
  MoreVertical,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import { mockUsers, mockCars } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useViewedCars } from '@/hooks/useViewedCars';
import { useTranslation } from '@/hooks/useTranslation';
import { CarService } from '@/services/carService';
import { Car as CarType } from '@/types/car';
import { supabase } from '@/lib/supabase';
import Animated, { FadeInDown } from 'react-native-reanimated';

function ProfileScreen() {
  const { user } = useAuth();
  const { viewedCount, minViewsRequired } = useViewedCars();
  const { t } = useTranslation();
  const [userCars, setUserCars] = useState<CarType[]>([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch user cars
  const fetchUserCars = async () => {
    if (!user) return;
    
    setLoadingCars(true);
    try {
      const cars = await CarService.getUserCars(user.id);
      setUserCars(cars);
    } catch (error) {
      console.error('Error fetching user cars:', error);
    } finally {
      setLoadingCars(false);
    }
  };

  // Update car status
  const updateCarStatus = async (carId: string, newStatus: 'active' | 'inactive' | 'sold') => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('cars')
        .update({ status: newStatus })
        .eq('id', carId)
        .eq('seller_id', user?.id);

      if (error) throw error;

      // Update local state
      setUserCars(prev => 
        prev.map(car => 
          car.id === carId 
            ? { ...car, status: newStatus }
            : car
        )
      );

      const statusMessages = {
        active: 'Anunțul a fost activat',
        inactive: 'Anunțul a fost dezactivat', 
        sold: 'Mașina a fost marcată ca vândută'
      };

      Alert.alert('Succes', statusMessages[newStatus]);
    } catch (error) {
      console.error('Error updating car status:', error);
      Alert.alert('Eroare', 'Nu s-a putut actualiza statusul anunțului');
    } finally {
      setUpdatingStatus(false);
      setShowStatusModal(false);
      setSelectedCar(null);
    }
  };

  // Handle status change
  const handleStatusChange = (car: CarType) => {
    setSelectedCar(car);
    setShowStatusModal(true);
  };

  // Optimize tab focus behavior
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchUserCars();
      }
      return () => {
        // Tab lost focus - keep data in memory
      };
    }, [user])
  );

  // Listen for new car posts
  useEffect(() => {
    const handleCarPosted = () => {
      if (user) {
        fetchUserCars();
      }
    };

    const { DeviceEventEmitter } = require('react-native');
    const subscription = DeviceEventEmitter.addListener('carPosted', handleCarPosted);

    return () => {
      subscription.remove();
    };
  }, [user]);

  // If user is not authenticated, show auth required screen
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View entering={FadeInDown} style={styles.authRequired}>
          <Text style={styles.authTitle}>Profil</Text>
          <Text style={styles.authSubtitle}>
            Pentru a-ți vedea profilul trebuie să fii autentificat
          </Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.authButtonText}>Conectează-te</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }



  const StatCard = ({ 
    icon, 
    value, 
    label, 
    color = '#F97316' 
  }: { 
    icon: React.ReactNode; 
    value: string | number; 
    label: string; 
    color?: string; 
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#F97316" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: user.user_metadata?.avatar_url || user.user_metadata?.picture || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }} 
              style={styles.avatar} 
            />
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Utilizator'}
            </Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#F97316" fill="#F97316" />
              <Text style={styles.rating}>5.0</Text>
              <Text style={styles.ratingText}>• Verified User</Text>
            </View>
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#666" />
              <Text style={styles.location}>România</Text>
            </View>
            <View style={styles.joinedContainer}>
              <Calendar size={14} color="#666" />
              <Text style={styles.joined}>
                Membru din {new Date(user.created_at).toLocaleDateString('ro-RO', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Edit size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.bio}>
            Utilizator AutoVad verificat. Pasionat de mașini și tehnologie.
          </Text>
        </View>



        {/* Stats Section */}
        <View style={styles.statsSection}>
          <StatCard
            icon={<Car size={20} color="#000" />}
            value={userCars.filter(car => car.status === 'active').length}
            label="Anunțuri Active"
          />
          <StatCard
            icon={<ShoppingBag size={20} color="#000" />}
            value={userCars.filter(car => car.status === 'sold').length}
            label="Mașini Vândute"
            color="#10B981"
          />
          <StatCard
            icon={<Users size={20} color="#000" />}
            value={userCars.length}
            label="Total Anunțuri"
            color="#3B82F6"
          />
          <StatCard
            icon={<Trophy size={20} color="#000" />}
            value={userCars.length > 0 ? "Activ" : "Nou"}
            label="Status"
            color="#8B5CF6"
          />
        </View>

        {/* My Listings Section */}
        <View style={styles.listingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Anunțurile Mele</Text>
            {userCars.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Vezi Toate</Text>
              </TouchableOpacity>
            )}
          </View>

          {loadingCars ? (
            <View style={styles.loadingCars}>
              <ActivityIndicator size="small" color="#F97316" />
              <Text style={styles.loadingCarsText}>Se încarcă anunțurile...</Text>
            </View>
          ) : userCars.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.listingsRow}>
                {userCars.map((car) => (
                  <View key={car.id} style={styles.listingCard}>
                    <TouchableOpacity 
                      style={styles.listingContent}
                      onPress={() => router.push(`/car/${car.id}`)}
                    >
                      <Image source={{ uri: car.images[0] }} style={styles.listingImage} />
                      <View style={styles.listingInfo}>
                        <View style={styles.listingHeader}>
                          <Text style={styles.listingTitle}>{car.make} {car.model}</Text>
                          <TouchableOpacity 
                            style={styles.statusButton}
                            onPress={() => handleStatusChange(car)}
                          >
                            <MoreVertical size={16} color="#666" />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.listingPrice}>
                          {new Intl.NumberFormat('ro-RO', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 0,
                          }).format(car.price)}
                        </Text>
                        <View style={styles.listingStats}>
                          <View style={styles.listingStat}>
                            <Heart size={12} color="#F97316" />
                            <Text style={styles.listingStatText}>{car.likes_count}</Text>
                          </View>
                          <View style={styles.listingStat}>
                            <Text style={styles.listingStatText}>{car.year}</Text>
                          </View>
                        </View>
                        <View style={styles.statusIndicator}>
                          <View style={[
                            styles.statusDot, 
                            { backgroundColor: car.status === 'active' ? '#10B981' : car.status === 'sold' ? '#F97316' : '#666' }
                          ]} />
                          <Text style={styles.statusText}>
                            {car.status === 'active' ? 'Activ' : car.status === 'sold' ? 'Vândut' : 'Inactiv'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyListings}>
              <Car size={48} color="#666" />
              <Text style={styles.emptyListingsText}>Nu ai anunțuri încă</Text>
              <Text style={styles.emptyListingsSubtext}>
                Adaugă prima ta mașină pentru a începe să vinzi
              </Text>
              <TouchableOpacity 
                style={styles.postFirstCarButton}
                onPress={() => router.push('/(tabs)/post')}
              >
                <Text style={styles.postFirstCarButtonText}>Adaugă Mașina</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Activity Section */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Activitate Recentă</Text>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Users size={16} color="#F97316" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                Te-ai alăturat comunității AutoVad
              </Text>
              <Text style={styles.activityTime}>
                {new Date(user.created_at).toLocaleDateString('ro-RO')}
              </Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Car size={16} color="#3B82F6" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                Profil verificat cu succes
              </Text>
              <Text style={styles.activityTime}>
                {new Date(user.created_at).toLocaleDateString('ro-RO')}
              </Text>
            </View>
          </View>

          <View style={styles.emptyActivity}>
            <Text style={styles.emptyActivityText}>
              Adaugă prima ta mașină pentru a vedea mai multă activitate aici!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Status Change Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Schimbă statusul pentru {selectedCar?.make} {selectedCar?.model}
            </Text>
            
            <View style={styles.statusOptions}>
              <TouchableOpacity
                style={[styles.statusOption, selectedCar?.status === 'active' && styles.statusOptionActive]}
                onPress={() => selectedCar && updateCarStatus(selectedCar.id, 'active')}
                disabled={updatingStatus}
              >
                <Eye size={20} color={selectedCar?.status === 'active' ? '#000' : '#10B981'} />
                <Text style={[styles.statusOptionText, selectedCar?.status === 'active' && styles.statusOptionTextActive]}>
                  Activează anunțul
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusOption, selectedCar?.status === 'inactive' && styles.statusOptionActive]}
                onPress={() => selectedCar && updateCarStatus(selectedCar.id, 'inactive')}
                disabled={updatingStatus}
              >
                <EyeOff size={20} color={selectedCar?.status === 'inactive' ? '#000' : '#666'} />
                <Text style={[styles.statusOptionText, selectedCar?.status === 'inactive' && styles.statusOptionTextActive]}>
                  Dezactivează anunțul
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusOption, selectedCar?.status === 'sold' && styles.statusOptionActive]}
                onPress={() => selectedCar && updateCarStatus(selectedCar.id, 'sold')}
                disabled={updatingStatus}
              >
                <CheckCircle size={20} color={selectedCar?.status === 'sold' ? '#000' : '#F97316'} />
                <Text style={[styles.statusOptionText, selectedCar?.status === 'sold' && styles.statusOptionTextActive]}>
                  Marchează ca vândută
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowStatusModal(false)}
              disabled={updatingStatus}
            >
              <Text style={styles.modalCloseButtonText}>Anulează</Text>
            </TouchableOpacity>

            {updatingStatus && (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color="#F97316" />
                <Text style={styles.modalLoadingText}>Se actualizează...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Export memoized component for maximum performance
export default React.memo(ProfileScreen);

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
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F97316',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginLeft: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joined: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  bioSection: {
    marginBottom: 24,
  },
  bio: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    lineHeight: 24,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  listingsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#F97316',
  },
  listingsRow: {
    flexDirection: 'row',
  },
  listingCard: {
    width: 160,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  listingInfo: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#F97316',
    marginBottom: 8,
  },
  listingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listingStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingStatText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  activitySection: {
    marginBottom: 32,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    lineHeight: 20,
  },
  activityHighlight: {
    fontFamily: 'Inter-SemiBold',
    color: '#F97316',
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  progressSection: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#F97316',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 4,
  },
  progressDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Auth required styles
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
  // Empty listings styles
  emptyListings: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyListingsText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyListingsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  postFirstCarButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  postFirstCarButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  // Empty activity styles
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginTop: 16,
  },
  emptyActivityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Loading cars styles
  loadingCars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingCarsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
  },
  // New listing card styles
  listingContent: {
    flex: 1,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  statusButton: {
    padding: 4,
    marginLeft: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusOptions: {
    marginBottom: 20,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#333',
  },
  statusOptionActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  statusOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginLeft: 12,
  },
  statusOptionTextActive: {
    color: '#000',
  },
  modalCloseButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  modalLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  modalLoadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
  },
});