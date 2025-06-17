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
  Trophy
} from 'lucide-react-native';
import { mockUsers, mockCars } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useViewedCars } from '@/hooks/useViewedCars';
import { useTranslation } from '@/hooks/useTranslation';

function ProfileScreen() {
  const { user: authUser } = useAuth();
  const { viewedCount, minViewsRequired } = useViewedCars();
  const { t } = useTranslation();
  const [user] = useState(mockUsers[0]);
  const [userCars] = useState(mockCars.filter(car => car.seller?.id === user.id));

  // Optimize tab focus behavior
  useFocusEffect(
    useCallback(() => {
      // Tab became active - profile data is already loaded
      return () => {
        // Tab lost focus - keep data in memory
      };
    }, [])
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

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
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            {user.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#F97316" fill="#F97316" />
              <Text style={styles.rating}>{user.rating}</Text>
              <Text style={styles.ratingText}>• Verified Seller</Text>
            </View>
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#666" />
              <Text style={styles.location}>{user.location}</Text>
            </View>
            <View style={styles.joinedContainer}>
              <Calendar size={14} color="#666" />
              <Text style={styles.joined}>Joined {formatDate(user.joinedAt)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Edit size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>

        {/* Progress indicator for non-authenticated users */}
        {!authUser && (
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Browser Progress</Text>
            <Text style={styles.progressText}>
              {viewedCount}/{minViewsRequired} {t('feed.freeListings')}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((viewedCount / minViewsRequired) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressDescription}>
              Conectează-te pentru acces nelimitat la toate mașinile și funcțiile premium!
            </Text>
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <StatCard
            icon={<Car size={20} color="#000" />}
            value={user.totalListings}
            label="Active Listings"
          />
          <StatCard
            icon={<ShoppingBag size={20} color="#000" />}
            value={user.totalSold}
            label="Cars Sold"
            color="#10B981"
          />
          <StatCard
            icon={<Users size={20} color="#000" />}
            value={user.followers}
            label="Followers"
            color="#3B82F6"
          />
          <StatCard
            icon={<Trophy size={20} color="#000" />}
            value="Top Seller"
            label="Badge"
            color="#8B5CF6"
          />
        </View>

        {/* My Listings Section */}
        <View style={styles.listingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Listings</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.listingsRow}>
              {userCars.map((car) => (
                <TouchableOpacity key={car.id} style={styles.listingCard}>
                  <Image source={{ uri: car.images[0] }} style={styles.listingImage} />
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingTitle}>{car.make} {car.model}</Text>
                    <Text style={styles.listingPrice}>{formatPrice(car.price)}</Text>
                    <View style={styles.listingStats}>
                      <View style={styles.listingStat}>
                        <Heart size={12} color="#F97316" />
                        <Text style={styles.listingStatText}>{car.likes_count}</Text>
                      </View>
                      <View style={styles.listingStat}>
                        <Text style={styles.listingStatText}>{car.year}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Activity Section */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Heart size={16} color="#F97316" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                Your <Text style={styles.activityHighlight}>BMW M4</Text> received 15 new likes
              </Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Users size={16} color="#3B82F6" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                You gained 5 new followers
              </Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Car size={16} color="#10B981" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                <Text style={styles.activityHighlight}>Porsche 911 Turbo</Text> listing was viewed 45 times
              </Text>
              <Text style={styles.activityTime}>2 days ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
});