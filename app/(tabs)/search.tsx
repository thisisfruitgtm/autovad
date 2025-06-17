import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, MapPin, Heart } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Car } from '@/types/car';
import { useAuth } from '@/hooks/useAuth';

interface FilterData {
  makes: string[];
  priceRanges: { label: string; min: number; max: number | null }[];
  fuelTypes: string[];
  locations: string[];
}

interface SearchFilters {
  searchQuery: string;
  selectedMake: string;
  selectedPriceRange: string;
  selectedFuelType: string;
  selectedLocation: string;
}

function SearchScreen() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    selectedMake: 'All',
    selectedPriceRange: 'All',
    selectedFuelType: 'All',
    selectedLocation: 'All',
  });
  const [filterData, setFilterData] = useState<FilterData>({
    makes: ['All'],
    priceRanges: [
      { label: 'All', min: 0, max: null },
      { label: '0-50k', min: 0, max: 50000 },
      { label: '50k-100k', min: 50000, max: 100000 },
      { label: '100k-200k', min: 100000, max: 200000 },
      { label: '200k+', min: 200000, max: null },
    ],
    fuelTypes: ['All'],
    locations: ['All'],
  });

  // Optimize tab focus behavior
  useFocusEffect(
    useCallback(() => {
      // Tab became active - refresh data if needed
      if (cars.length === 0 && !initialLoading && !filtering) {
        fetchCars(true);
      }
      return () => {
        // Tab lost focus - keep data in memory
      };
    }, [cars.length, initialLoading, filtering])
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const fetchCars = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setFiltering(true);
      }
      
      // Build query based on filters
      let query = supabase
        .from('cars')
        .select(`
          *,
          seller:users(id, name, avatar_url, rating, verified),
          likes:likes(user_id)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply search filter
      if (filters.searchQuery.trim()) {
        query = query.or(`make.ilike.%${filters.searchQuery}%,model.ilike.%${filters.searchQuery}%`);
      }

      // Apply make filter
      if (filters.selectedMake !== 'All') {
        query = query.eq('make', filters.selectedMake);
      }

      // Apply fuel type filter
      if (filters.selectedFuelType !== 'All') {
        query = query.eq('fuel_type', filters.selectedFuelType);
      }

      // Apply location filter
      if (filters.selectedLocation !== 'All') {
        query = query.ilike('location', `%${filters.selectedLocation}%`);
      }

      // Apply price range filter with static price ranges
      if (filters.selectedPriceRange !== 'All') {
        const staticPriceRanges = [
          { label: 'All', min: 0, max: null },
          { label: '0-50k', min: 0, max: 50000 },
          { label: '50k-100k', min: 50000, max: 100000 },
          { label: '100k-200k', min: 100000, max: 200000 },
          { label: '200k+', min: 200000, max: null },
        ];
        const priceRange = staticPriceRanges.find(r => r.label === filters.selectedPriceRange);
        if (priceRange) {
          query = query.gte('price', priceRange.min);
          if (priceRange.max) {
            query = query.lte('price', priceRange.max);
          }
        }
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Transform data and check if user liked each car
      const transformedCars: Car[] = data.map((car: any) => ({
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price,
        mileage: car.mileage,
        color: car.color,
        fuel_type: car.fuel_type,
        transmission: car.transmission,
        body_type: car.body_type,
        videos: car.videos || [],
        images: car.images || [],
        description: car.description,
        location: car.location,
        seller: car.seller ? {
          id: car.seller.id,
          name: car.seller.name,
          avatar_url: car.seller.avatar_url,
          rating: car.seller.rating || 0,
          verified: car.seller.verified || false,
        } : {
          id: 'demo-seller',
          name: 'Autovad Demo',
          avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          rating: 5.0,
          verified: true,
        },
        likes_count: car.likes_count || 0,
        comments_count: car.comments_count || 0,
        is_liked: user ? car.likes.some((like: any) => like.user_id === user.id) : false,
        created_at: car.created_at,
      }));

      setCars(transformedCars);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setInitialLoading(false);
      setFiltering(false);
      setRefreshing(false);
    }
  }, [filters, user]); // Remove filterData dependency

  const fetchFilterData = useCallback(async () => {
    try {
      // Fetch unique makes
      const { data: makesData } = await supabase
        .from('cars')
        .select('make')
        .eq('status', 'active');
      
      const uniqueMakes = Array.from(new Set(makesData?.map(c => c.make) || [])).sort();
      
      // Fetch unique fuel types
      const { data: fuelData } = await supabase
        .from('cars')
        .select('fuel_type')
        .eq('status', 'active');
      
      const uniqueFuelTypes = Array.from(new Set(fuelData?.map(c => c.fuel_type) || [])).sort();
      
      // Fetch unique locations (extract city from location string)
      const { data: locationData } = await supabase
        .from('cars')
        .select('location')
        .eq('status', 'active');
      
      const uniqueLocations = Array.from(new Set(
        locationData?.map(c => c.location.split(',')[0].trim()) || []
      )).sort();

      setFilterData(prev => ({
        ...prev,
        makes: ['All', ...uniqueMakes],
        fuelTypes: ['All', ...uniqueFuelTypes],
        locations: ['All', ...uniqueLocations],
      }));
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  }, []);

  const handleLike = async (carId: string) => {
    if (!user) return;

    try {
      const car = cars.find(c => c.id === carId);
      if (!car) return;

      if (car.is_liked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('car_id', carId);
        
        // Update likes count
        await supabase
          .from('cars')
          .update({ likes_count: Math.max(0, car.likes_count - 1) })
          .eq('id', carId);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({ user_id: user.id, car_id: carId });
        
        // Update likes count
        await supabase
          .from('cars')
          .update({ likes_count: car.likes_count + 1 })
          .eq('id', carId);
      }

      // Update local state
      setCars(prevCars =>
        prevCars.map(c =>
          c.id === carId
            ? {
                ...c,
                is_liked: !c.is_liked,
                likes_count: c.is_liked ? c.likes_count - 1 : c.likes_count + 1,
              }
            : c
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCars(false);
  }, [fetchCars]);

  useEffect(() => {
    // Only fetch filter data once on mount
    fetchFilterData();
    // Also fetch initial cars
    fetchCars(true);
  }, []);

  useEffect(() => {
    // Skip initial render and only filter when filter data is loaded
    if (filterData.makes.length > 1) {
      // Debounce filter changes to avoid excessive API calls
      const timeoutId = setTimeout(() => {
        fetchCars(false);
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [filters, user, fetchCars]); // Add fetchCars to dependencies

  const filteredCars = useMemo(() => {
    return cars; // Filtering is done on the server side
  }, [cars]);

  const FilterButton = ({ 
    title, 
    selected, 
    onPress 
  }: { 
    title: string; 
    selected: boolean; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, selected && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, selected && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCarPress = (carId: string) => {
    router.push(`/car/${carId}`);
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.loadingText}>Se încarcă mașinile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Descoperă Mașini</Text>
          {filtering && (
            <ActivityIndicator 
              size="small" 
              color="#F97316" 
              style={styles.filteringIndicator}
            />
          )}
        </View>
        <TouchableOpacity style={styles.filterIcon}>
          <Filter size={24} color="#F97316" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută mașini..."
            placeholderTextColor="#666"
            value={filters.searchQuery}
            onChangeText={(text) => updateFilter('searchQuery', text)}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Marcă</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {filterData.makes.map((make) => (
                <FilterButton
                  key={make}
                  title={make}
                  selected={filters.selectedMake === make}
                  onPress={() => updateFilter('selectedMake', make)}
                />
              ))}
            </View>
          </ScrollView>

          <Text style={styles.sectionTitle}>Preț</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {filterData.priceRanges.map((range) => (
                <FilterButton
                  key={range.label}
                  title={range.label}
                  selected={filters.selectedPriceRange === range.label}
                  onPress={() => updateFilter('selectedPriceRange', range.label)}
                />
              ))}
            </View>
          </ScrollView>

          <Text style={styles.sectionTitle}>Combustibil</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {filterData.fuelTypes.map((fuel) => (
                <FilterButton
                  key={fuel}
                  title={fuel}
                  selected={filters.selectedFuelType === fuel}
                  onPress={() => updateFilter('selectedFuelType', fuel)}
                />
              ))}
            </View>
          </ScrollView>

          <Text style={styles.sectionTitle}>Locație</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {filterData.locations.map((location) => (
                <FilterButton
                  key={location}
                  title={location}
                  selected={filters.selectedLocation === location}
                  onPress={() => updateFilter('selectedLocation', location)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>
            {filteredCars.length} Mașini Găsite
          </Text>
          
          <View style={styles.carGrid}>
            {filteredCars.map((car) => (
              <TouchableOpacity 
                key={car.id} 
                style={styles.carCard}
                onPress={() => handleCarPress(car.id)}
              >
                <Image source={{ uri: car.images[0] }} style={styles.carImage} />
                <TouchableOpacity 
                  style={styles.heartButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleLike(car.id);
                  }}
                >
                  <Heart 
                    size={20} 
                    color={car.is_liked ? '#F97316' : '#fff'} 
                    fill={car.is_liked ? '#F97316' : 'none'}
                  />
                </TouchableOpacity>
                <View style={styles.carInfo}>
                  <Text style={styles.carTitle}>{car.make} {car.model}</Text>
                  <Text style={styles.carYear}>{car.year}</Text>
                  <Text style={styles.carPrice}>{formatPrice(car.price)}</Text>
                  <View style={styles.carLocation}>
                    <MapPin size={14} color="#666" />
                    <Text style={styles.locationText}>{car.location}</Text>
                  </View>
                  <View style={styles.carStats}>
                    <Text style={styles.statsText}>{car.likes_count} likes</Text>
                    <Text style={styles.statsText}>{car.fuel_type}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Export memoized component for maximum performance
export default React.memo(SearchScreen);

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
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  filteringIndicator: {
    marginLeft: 12,
  },
  filterIcon: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 12,
    marginTop: 16,
  },
  filterRow: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  filterButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  filterButtonTextActive: {
    color: '#000',
  },
  resultsSection: {
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 16,
  },
  carGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  carCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  carInfo: {
    padding: 12,
  },
  carTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  carYear: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  carPrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#F97316',
    marginBottom: 8,
  },
  carLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  carStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
});