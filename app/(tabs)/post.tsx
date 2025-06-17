import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Camera, Image as ImageIcon, MapPin, DollarSign, X, Plus } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/lib/analytics';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';

const carMakes = ['Tesla', 'BMW', 'Mercedes-Benz', 'Porsche', 'Audi', 'Toyota', 'Honda', 'Ford', 'Volkswagen', 'Lamborghini', 'Ferrari'];
const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const transmissions = ['Manual', 'Automatic'];
const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Truck'];

function PostScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    color: '',
    fuelType: '',
    transmission: '',
    bodyType: '',
    description: '',
    location: '',
  });

  // Optimize tab focus behavior
  useFocusEffect(
    useCallback(() => {
      // Tab became active - post form data is already in state
      return () => {
        // Tab lost focus - keep form data in memory
      };
    }, [])
  );

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisiune necesară', 'Avem nevoie de acces la galeria foto pentru a adăuga imagini.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages].slice(0, 10)); // Max 10 images
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Eroare', 'Nu s-au putut selecta imaginile');
    }
  };

  const pickVideos = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisiune necesară', 'Avem nevoie de acces la galeria foto pentru a adăuga video-uri.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newVideo = result.assets[0].uri;
        setVideos(prev => [...prev, newVideo].slice(0, 3)); // Max 3 videos
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Eroare', 'Nu s-a putut selecta video-ul');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMedia = async (uri: string, type: 'image' | 'video'): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const fileExt = type === 'image' ? 'jpg' : 'mp4';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `cars/${user?.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, blob, {
          contentType: type === 'image' ? 'image/jpeg' : 'video/mp4',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  };

  const handlePost = async () => {
    if (!user) {
      Alert.alert('Eroare', 'Trebuie să fii autentificat pentru a posta o mașină');
      return;
    }

    // Validate required fields
    const requiredFields: (keyof typeof formData)[] = ['make', 'model', 'year', 'price', 'mileage', 'color', 'description', 'location'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      Alert.alert('Informații lipsă', 'Te rog completează toate câmpurile obligatorii');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Imagini necesare', 'Te rog adaugă cel puțin o imagine a mașinii');
      return;
    }

    setLoading(true);
    try {
      // Upload all media files
      const uploadedImages = await Promise.all(
        images.map(uri => uploadMedia(uri, 'image'))
      );
      
      const uploadedVideos = await Promise.all(
        videos.map(uri => uploadMedia(uri, 'video'))
      );

      // Create car listing
      const { data: car, error } = await supabase
        .from('cars')
        .insert({
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          price: parseFloat(formData.price),
          mileage: parseInt(formData.mileage),
          color: formData.color,
          fuel_type: formData.fuelType as any,
          transmission: formData.transmission as any,
          body_type: formData.bodyType as any,
          videos: uploadedVideos,
          images: uploadedImages,
          description: formData.description,
          location: formData.location,
          seller_id: user.id,
          seller_type: 'individual',
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await logActivity(user.id, 'create', 'car', car.id);

      Alert.alert(
        'Succes!',
        'Mașina ta a fost postată cu succes!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                make: '',
                model: '',
                year: '',
                price: '',
                mileage: '',
                color: '',
                fuelType: '',
                transmission: '',
                bodyType: '',
                description: '',
                location: '',
              });
              setImages([]);
              setVideos([]);
              
              // Navigate to car details
              router.push(`/car/${car.id}`);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error posting car:', error);
      Alert.alert('Eroare', 'Nu s-a putut posta mașina. Te rog încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const Dropdown = ({ 
    placeholder, 
    options, 
    value, 
    onSelect 
  }: { 
    placeholder: string; 
    options: string[]; 
    value: string; 
    onSelect: (value: string) => void; 
  }) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{placeholder}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsRow}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                value === option && styles.optionButtonActive
              ]}
              onPress={() => onSelect(option)}
            >
              <Text style={[
                styles.optionText,
                value === option && styles.optionTextActive
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authRequired}>
          <Text style={styles.authTitle}>Autentificare necesară</Text>
          <Text style={styles.authSubtitle}>
            Pentru a posta o mașină trebuie să fii autentificat
          </Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.authButtonText}>Conectează-te</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Postează mașina ta</Text>
        <TouchableOpacity 
          style={[styles.postButton, loading && styles.postButtonDisabled]} 
          onPress={handlePost}
          disabled={loading}
        >
          <Text style={styles.postButtonText}>
            {loading ? 'Se postează...' : 'Postează'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Media Section */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.mediaSection}>
          <Text style={styles.sectionTitle}>Media</Text>
          
          {/* Videos */}
          <View style={styles.mediaContainer}>
            <Text style={styles.mediaLabel}>Video-uri ({videos.length}/3)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.mediaRow}>
                {videos.map((video, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Text style={styles.videoPlaceholder}>Video {index + 1}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeVideo(index)}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {videos.length < 3 && (
                  <TouchableOpacity style={styles.addMediaButton} onPress={pickVideos}>
                    <Plus size={24} color="#F97316" />
                    <Text style={styles.addMediaText}>Adaugă video</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>

          {/* Images */}
          <View style={styles.mediaContainer}>
            <Text style={styles.mediaLabel}>Imagini ({images.length}/10)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.mediaRow}>
                {images.map((image, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Image source={{ uri: image }} style={styles.mediaPreview} />
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 10 && (
                  <TouchableOpacity style={styles.addMediaButton} onPress={pickImages}>
                    <Plus size={24} color="#F97316" />
                    <Text style={styles.addMediaText}>Adaugă imagini</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        {/* Car Details Form */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.formSection}>
          <Text style={styles.sectionTitle}>Detalii mașină</Text>
          
          <Dropdown
            placeholder="Marcă *"
            options={carMakes}
            value={formData.make}
            onSelect={(value) => handleInputChange('make', value)}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Model *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Introdu modelul"
              placeholderTextColor="#666"
              value={formData.model}
              onChangeText={(value) => handleInputChange('model', value)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>An *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2023"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={formData.year}
                onChangeText={(value) => handleInputChange('year', value)}
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Preț (RON) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="75000"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Kilometraj *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="25000"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={formData.mileage}
                onChangeText={(value) => handleInputChange('mileage', value)}
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Culoare *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Negru"
                placeholderTextColor="#666"
                value={formData.color}
                onChangeText={(value) => handleInputChange('color', value)}
              />
            </View>
          </View>

          <Dropdown
            placeholder="Tip combustibil"
            options={fuelTypes}
            value={formData.fuelType}
            onSelect={(value) => handleInputChange('fuelType', value)}
          />

          <Dropdown
            placeholder="Transmisie"
            options={transmissions}
            value={formData.transmission}
            onSelect={(value) => handleInputChange('transmission', value)}
          />

          <Dropdown
            placeholder="Tip caroserie"
            options={bodyTypes}
            value={formData.bodyType}
            onSelect={(value) => handleInputChange('bodyType', value)}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Locație *</Text>
            <View style={styles.locationInput}>
              <MapPin size={20} color="#F97316" />
              <TextInput
                style={[styles.textInput, { marginLeft: 8, flex: 1, padding: 0 }]}
                placeholder="București, România"
                placeholderTextColor="#666"
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descriere *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Descrie mașina ta: starea, caracteristicile, istoricul..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
            />
          </View>
        </Animated.View>

        <TouchableOpacity 
          style={[styles.postButtonLarge, loading && styles.postButtonDisabled]} 
          onPress={handlePost}
          disabled={loading}
        >
          <Text style={styles.postButtonLargeText}>
            {loading ? 'Se postează mașina...' : 'Postează mașina de vânzare'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Export memoized component for maximum performance
export default React.memo(PostScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  postButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mediaSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 20,
  },
  mediaContainer: {
    marginBottom: 20,
  },
  mediaLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginBottom: 12,
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaItem: {
    position: 'relative',
    marginRight: 12,
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  videoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMediaButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMediaText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#F97316',
    marginTop: 4,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 20,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
  },
  optionButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  optionButtonActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  optionTextActive: {
    color: '#000',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  postButtonLarge: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  postButtonLargeText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
});