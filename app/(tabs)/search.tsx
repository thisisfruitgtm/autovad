import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Search, Filter, Heart, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Car } from '../../types/car';

interface FilterOptions {
  makes: string[];
  years: string[];
  fuelTypes: string[];
  bodyTypes: string[];
  locations: string[];
  priceRanges: { label: string; min: number; max: number | null }[];
}

export default function SearchScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedMake, setSelectedMake] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('All');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All');
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    makes: ['All'],
    years: ['All'],
    fuelTypes: ['All'],
    bodyTypes: ['All'],
    locations: ['All'],
    priceRanges: [
      { label: 'All', min: 0, max: null },
      { label: 'Sub 25k', min: 0, max: 25000 },
      { label: '25k - 50k', min: 25000, max: 50000 },
      { label: '50k - 100k', min: 50000, max: 100000 },
      { label: '100k - 200k', min: 100000, max: 200000 },
      { label: 'Peste 200k', min: 200000, max: null },
    ],
  });

  // Fetch all cars and generate filter options
  const fetchCarsAndFilters = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          seller:users(id, name, avatar_url, rating, verified),
          likes:likes(user_id)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Transform data
      const transformedCars: Car[] = data.map((car: any) => ({
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        status: car.status,
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
      setFilteredCars(transformedCars);

      // Generate filter options from data
      const makes = Array.from(new Set(transformedCars.map(car => car.make))).sort();
      const years = Array.from(new Set(transformedCars.map(car => car.year.toString()))).sort((a, b) => parseInt(b) - parseInt(a));
      const fuelTypes = Array.from(new Set(transformedCars.map(car => car.fuel_type))).sort();
      const bodyTypes = Array.from(new Set(transformedCars.map(car => car.body_type))).sort();
      const locations = Array.from(new Set(transformedCars.map(car => car.location.split(',')[0].trim()))).sort();

      setFilterOptions(prev => ({
        ...prev,
        makes: ['All', ...makes],
        years: ['All', ...years],
        fuelTypes: ['All', ...fuelTypes],
        bodyTypes: ['All', ...bodyTypes],
        locations: ['All', ...locations],
      }));

    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Apply filters to cars
  const applyFilters = () => {
    let filtered = cars;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(car => 
        car.make.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query) ||
        `${car.make} ${car.model}`.toLowerCase().includes(query)
      );
    }

    // Make filter
    if (selectedMake !== 'All') {
      filtered = filtered.filter(car => car.make === selectedMake);
    }

    // Year filter
    if (selectedYear !== 'All') {
      filtered = filtered.filter(car => car.year.toString() === selectedYear);
    }

    // Fuel type filter
    if (selectedFuelType !== 'All') {
      filtered = filtered.filter(car => car.fuel_type === selectedFuelType);
    }

    // Body type filter
    if (selectedBodyType !== 'All') {
      filtered = filtered.filter(car => car.body_type === selectedBodyType);
    }

    // Location filter
    if (selectedLocation !== 'All') {
      filtered = filtered.filter(car => car.location.includes(selectedLocation));
    }

    // Price range filter
    if (selectedPriceRange !== 'All') {
      const priceRange = filterOptions.priceRanges.find(range => range.label === selectedPriceRange);
      if (priceRange) {
        filtered = filtered.filter(car => {
          const price = car.price;
          const inRange = price >= priceRange.min && (priceRange.max === null || price <= priceRange.max);
          return inRange;
        });
      }
    }

    setFilteredCars(filtered);
  };

  // Handle like toggle
  const handleLike = async (carId: string) => {
    if (!user) return;

    try {
      const car = cars.find(c => c.id === carId);
      if (!car) return;

      if (car.is_liked) {
        await supabase.from('likes').delete().eq('user_id', user.id).eq('car_id', carId);
      } else {
        await supabase.from('likes').insert({ user_id: user.id, car_id: carId });
      }

      // Update local state
      const updatedCars = cars.map(c =>
        c.id === carId
          ? {
              ...c,
              is_liked: !c.is_liked,
              likes_count: c.is_liked ? c.likes_count - 1 : c.likes_count + 1,
            }
          : c
      );
      setCars(updatedCars);
      applyFilters(); // Reapply filters to update filtered cars
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMake('All');
    setSelectedYear('All');
    setSelectedFuelType('All');
    setSelectedBodyType('All');
    setSelectedLocation('All');
    setSelectedPriceRange('All');
  };

  // Effects
  useEffect(() => {
    fetchCarsAndFilters();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedMake, selectedYear, selectedFuelType, selectedBodyType, selectedLocation, selectedPriceRange, cars]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCarsAndFilters();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const FilterButton = ({ title, selected, onPress }: { title: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.filterButton, selected && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, selected && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderCarItem = ({ item }: { item: Car }) => (
    <TouchableOpacity 
      style={styles.carCard}
      onPress={() => router.push(`/car/${item.id}`)}
    >
      <Image source={{ uri: item.images[0] }} style={styles.carImage} />
      <TouchableOpacity 
        style={styles.heartButton}
        onPress={() => handleLike(item.id)}
      >
        <Heart 
          size={20} 
          color={item.is_liked ? '#F97316' : '#fff'} 
          fill={item.is_liked ? '#F97316' : 'none'}
        />
      </TouchableOpacity>
      <View style={styles.carInfo}>
        <Text style={styles.carTitle}>{item.make} {item.model}</Text>
        <Text style={styles.carYear}>{item.year}</Text>
        <Text style={styles.carPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.carLocation}>
          <MapPin size={14} color="#666" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <View style={styles.carStats}>
          <Text style={styles.statsText}>{item.likes_count} likes</Text>
          <Text style={styles.statsText}>{item.fuel_type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Caută Vehicule</Text>
        <TouchableOpacity 
          style={styles.filterButtonHeader}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonHeaderText}>Filtrează</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută după marcă, model..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Marcă</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={filterOptions.makes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <FilterButton
                  title={item}
                  selected={selectedMake === item}
                  onPress={() => setSelectedMake(item)}
                />
              )}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>An</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={filterOptions.years}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <FilterButton
                  title={item}
                  selected={selectedYear === item}
                  onPress={() => setSelectedYear(item)}
                />
              )}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Preț</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={filterOptions.priceRanges}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <FilterButton
                  title={item.label}
                  selected={selectedPriceRange === item.label}
                  onPress={() => setSelectedPriceRange(item.label)}
                />
              )}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Combustibil</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={filterOptions.fuelTypes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <FilterButton
                  title={item}
                  selected={selectedFuelType === item}
                  onPress={() => setSelectedFuelType(item)}
                />
              )}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Tip Caroserie</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={filterOptions.bodyTypes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <FilterButton
                  title={item}
                  selected={selectedBodyType === item}
                  onPress={() => setSelectedBodyType(item)}
                />
              )}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Locație</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={filterOptions.locations}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <FilterButton
                  title={item}
                  selected={selectedLocation === item}
                  onPress={() => setSelectedLocation(item)}
                />
              )}
            />
          </View>

          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Șterge Filtrele</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>
          {filteredCars.length} {filteredCars.length === 1 ? 'Vehicul Găsit' : 'Vehicule Găsite'}
        </Text>
        
        <FlatList
          data={filteredCars}
          renderItem={renderCarItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Nu am găsit vehicule</Text>
              <Text style={styles.emptySubtitle}>
                Încearcă să modifici filtrele sau termenul de căutare
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
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
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  filterButtonHeader: {
    backgroundColor: '#F97316',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonHeaderText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
  filtersContainer: {
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 8,
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
  clearFiltersButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearFiltersText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 16,
  },
  row: {
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
    marginBottom: 8,
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
  },
  statsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
});