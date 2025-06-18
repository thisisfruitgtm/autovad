import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { 
  Camera, 
  Image as ImageIcon, 
  MapPin, 
  DollarSign, 
  X, 
  Plus, 
  ArrowLeft, 
  ArrowRight,
  Check,
  Video,
  StopCircle,
  Circle
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/lib/analytics';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import Animated, { FadeInDown, FadeInRight, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { DeviceEventEmitter } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const carMakes = ['Tesla', 'BMW', 'Mercedes-Benz', 'Porsche', 'Audi', 'Toyota', 'Honda', 'Ford', 'Volkswagen', 'Lamborghini', 'Ferrari', 'Dacia', 'Renault', 'Peugeot', 'Opel', 'Skoda', 'Hyundai', 'Kia', 'Nissan', 'Mazda'];
const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG'];
const transmissions = ['Manual', 'Automatic'];
const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Truck', 'Van', 'Estate'];

// Media compression helper
class MediaCompressor {
  static async compressImage(uri: string): Promise<string> {
    try {
      console.log('🔄 Compressing image:', uri);
      
      const manipulatedImage = await manipulateAsync(
        uri,
        [
          { resize: { width: 1280, height: 720 } }, // 720p max resolution
        ],
        {
          compress: 0.8, // 80% quality
          format: SaveFormat.JPEG,
        }
      );
      
      console.log('✅ Image compressed successfully');
      return manipulatedImage.uri;
    } catch (error) {
      console.error('❌ Error compressing image:', error);
      return uri; // Return original if compression fails
    }
  }

  static async compressVideo(uri: string): Promise<string> {
    try {
      console.log('🔄 Video ready for upload:', uri);
      // For now, return the original URI
      // In production, you might want to use FFmpeg or similar for video compression
      return uri;
    } catch (error) {
      console.error('❌ Error processing video:', error);
      return uri;
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Custom Camera Component with Enhanced UX
function CustomCamera({ onVideoRecorded, onClose }: { onVideoRecorded: (uri: string) => void; onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isReady, setIsReady] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [recordingPaused, setRecordingPaused] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const recordingInterval = useRef<number | null>(null);

  const stopRecording = useCallback(() => {
    if (!cameraRef.current || !isRecording) return;
    try {
      cameraRef.current.stopRecording();
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording, stopRecording]);

  if (!permission) {
    return <View style={styles.cameraContainer}><ActivityIndicator size="large" color="#F97316" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.cameraContainer}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.cameraPermissionContainer}>
          <Animated.View entering={FadeInDown.delay(400)} style={styles.permissionIconContainer}>
            <Camera size={64} color="#F97316" />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(600)} style={styles.cameraPermissionTitle}>
            Acces la cameră necesar
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(800)} style={styles.cameraPermissionText}>
            Pentru a filma prezentarea mașinii tale, avem nevoie de acces la cameră
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(1000)}>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Permite accesul</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    
    try {
      setIsRecording(true);
      setRecordingTime(0);
      
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });
      
      if (video) {
        const compressedVideo = await MediaCompressor.compressVideo(video.uri);
        onVideoRecorded(compressedVideo);
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Eroare', 'Nu s-a putut înregistra video-ul');
    } finally {
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
        onCameraReady={() => setIsReady(true)}
      />
      
      {/* Camera Ready Overlay */}
      {!isReady && (
        <Animated.View entering={FadeInDown} style={styles.cameraLoadingOverlay}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.cameraLoadingText}>Pregătesc camera...</Text>
        </Animated.View>
      )}
      
      {/* Header overlay */}
      <Animated.View entering={FadeInDown.delay(500)} style={styles.cameraHeader}>
        <TouchableOpacity style={styles.cameraCloseButton} onPress={onClose}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
        <Animated.View style={[styles.cameraTimer, isRecording && styles.cameraTimerActive]}>
          <Animated.View style={[styles.recordingDot, { opacity: isRecording ? 1 : 0 }]} />
          <Text style={styles.cameraTimerText}>{formatTime(recordingTime)}/1:00</Text>
        </Animated.View>
        <TouchableOpacity 
          style={styles.cameraFlipButton} 
          onPress={() => setFacing(current => current === 'back' ? 'front' : 'back')}
        >
          <Camera size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Recording Progress Circle */}
      {isRecording && (
        <Animated.View entering={FadeInDown} style={styles.recordingProgressContainer}>
          <View style={styles.recordingProgressBackground}>
            <View 
              style={[
                styles.recordingProgressFill,
                { 
                  transform: [{ 
                    rotate: `${(recordingTime / 60) * 360}deg` 
                  }] 
                }
              ]} 
            />
          </View>
        </Animated.View>
      )}

      {/* Center Guidelines */}
      <View style={styles.cameraGuidelines}>
        <View style={styles.guidelineHorizontal} />
        <View style={styles.guidelineVertical} />
      </View>

      {/* Recording Tips */}
      {!isRecording && isReady && (
        <Animated.View entering={FadeInDown.delay(800)} style={styles.recordingTips}>
          <Text style={styles.recordingTipsText}>💡 Filmează mașina din toate unghiurile</Text>
        </Animated.View>
      )}

      {/* Bottom controls overlay */}
      <Animated.View entering={FadeInDown.delay(600)} style={styles.cameraControls}>
        <View style={styles.cameraControlsInner}>
          {/* Gallery Button */}
          <TouchableOpacity style={styles.galleryButton}>
            <ImageIcon size={24} color="#fff" />
          </TouchableOpacity>
          
          {/* Record Button */}
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordButtonActive]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={recordingTime >= 60}
          >
            <Animated.View style={[
              styles.recordButtonInner,
              isRecording && styles.recordButtonInnerActive
            ]}>
              {isRecording ? (
                <StopCircle size={28} color="#fff" />
              ) : (
                <Circle size={28} color="#fff" fill="#F97316" />
              )}
            </Animated.View>
          </TouchableOpacity>
          
          {/* Flash Button */}
          <TouchableOpacity 
            style={styles.flashButton}
            onPress={() => setFlashMode(current => 
              current === 'off' ? 'on' : current === 'on' ? 'auto' : 'off'
            )}
          >
            <Text style={styles.flashButtonText}>
              {flashMode === 'off' ? '⚡' : flashMode === 'on' ? '💡' : '🔆'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Recording Controls */}
        {isRecording && (
          <Animated.View entering={FadeInDown} style={styles.recordingControls}>
            <TouchableOpacity 
              style={styles.pauseButton}
              onPress={() => setRecordingPaused(!recordingPaused)}
            >
              <Text style={styles.pauseButtonText}>
                {recordingPaused ? '▶️' : '⏸️'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

// Step Progress Indicator
function StepProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.progressStep,
            index < currentStep ? styles.progressStepCompleted : 
            index === currentStep ? styles.progressStepActive : styles.progressStepInactive
          ]}
        >
          {index < currentStep ? (
            <Check size={16} color="#000" />
          ) : (
            <Text style={[
              styles.progressStepText,
              index === currentStep ? styles.progressStepTextActive : styles.progressStepTextInactive
            ]}>
              {index + 1}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

function PostScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [videoUri, setVideoUri] = useState<string>('');
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  
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

  const totalSteps = 3;
  const stepTitles = [
    'Detalii mașină',
    'Video prezentare',
    'Fotografii'
  ];

  // Optimize tab focus behavior
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Keep form data in memory when tab loses focus
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

      setCompressing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1, // We'll compress manually
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets) {
        const compressedImages = await Promise.all(
          result.assets.map(asset => MediaCompressor.compressImage(asset.uri))
        );
        setImages(prev => [...prev, ...compressedImages].slice(0, 10)); // Max 10 images
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Eroare', 'Nu s-au putut selecta imaginile');
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoRecorded = (uri: string) => {
    setVideoUri(uri);
    setShowCamera(false);
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 0: // Car details
        return !!(formData.make && formData.model && formData.year && formData.price && formData.mileage && formData.color && formData.description && formData.location);
      case 1: // Video
        return !!videoUri;
      case 2: // Images
        return images.length > 0;
      default:
        return false;
    }
  };

  const uploadMedia = async (uri: string, type: 'image' | 'video'): Promise<string> => {
    try {
      console.log(`🔄 Uploading ${type}:`, uri);
      
      // Check if URI exists and get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log(`📁 File info for ${type}:`, { 
        exists: fileInfo.exists, 
        size: fileInfo.exists ? (fileInfo as any).size : 'N/A',
        uri: fileInfo.uri 
      });
      
      if (!fileInfo.exists) {
        throw new Error(`File does not exist: ${uri}`);
      }
      
      if (fileInfo.exists && (fileInfo as any).size === 0) {
        throw new Error(`File is empty (0 bytes): ${uri}`);
      }

      // Create file object for React Native using fetch approach
      const fileExt = type === 'image' ? 'jpg' : 'mp4';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `cars/${user?.id}/${fileName}`;

      console.log(`⬆️ Uploading to path: ${filePath}`);
      console.log(`📦 File size: ${fileInfo.exists ? (fileInfo as any).size : 'unknown'} bytes`);

      // Use direct fetch with FormData for React Native compatibility
      const formData = new FormData();
      
      // Create proper file object for React Native
      const fileObject = {
        uri: uri,
        type: type === 'image' ? 'image/jpeg' : 'video/mp4',
        name: fileName
      };
      
      formData.append('', fileObject as any);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('No authentication token available');
      }

      const uploadUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/car-media/${filePath}`;
      console.log(`📤 Uploading to URL: ${uploadUrl}`);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-upsert': 'true',
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload response error:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const data = await uploadResponse.json();
      console.log(`📤 Upload response:`, data);

      const { data: { publicUrl } } = supabase.storage
        .from('car-media')
        .getPublicUrl(filePath);

      console.log(`✅ ${type} uploaded successfully:`, publicUrl);
      return publicUrl;
    } catch (error) {
      console.error(`❌ Error uploading ${type}:`, error);
      throw error;
    }
  };

  const handlePost = async () => {
    if (!user) {
      Alert.alert('Eroare', 'Trebuie să fii autentificat pentru a posta o mașină');
      return;
    }

    if (!canProceedFromStep(0) || !canProceedFromStep(1) || !canProceedFromStep(2)) {
      Alert.alert('Informații incomplete', 'Te rog completează toate pașii înainte de a posta');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    
    try {
      const totalSteps = 1 + images.length + 1; // video + images + database
      let completedSteps = 0;

      // Upload video
      setUploadStatus('Se încarcă video-ul...');
      const uploadedVideo = await uploadMedia(videoUri, 'video');
      completedSteps++;
      setUploadProgress((completedSteps / totalSteps) * 100);
      
      // Upload all images
      setUploadStatus(`Se încarcă imaginile (0/${images.length})...`);
      const uploadedImages = [];
      for (let i = 0; i < images.length; i++) {
        setUploadStatus(`Se încarcă imaginile (${i + 1}/${images.length})...`);
        const uploadedImage = await uploadMedia(images[i], 'image');
        uploadedImages.push(uploadedImage);
        completedSteps++;
        setUploadProgress((completedSteps / totalSteps) * 100);
      }

      // Create car listing
      setUploadStatus('Se salvează anunțul...');
      console.log('🔄 Attempting to save car with data:', {
        make: formData.make,
        model: formData.model,
        transmission: formData.transmission,
        status: 'active'
      });
      
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
          videos: [uploadedVideo],
          images: uploadedImages,
          description: formData.description,
          location: formData.location,
          seller_id: user.id,
          seller_type: 'individual',
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Car posted successfully: ${car.make} ${car.model} (ID: ${car.id}) at ${car.created_at}`);

      completedSteps++;
      setUploadProgress(100);
      setUploadStatus('Gata!');

      // Log activity
      await logActivity(user.id, 'create', 'car', car.id);

      // Notify other components that a new car was posted
      DeviceEventEmitter.emit('carPosted', { carId: car.id });

      Alert.alert(
        'Succes!',
        'Mașina ta a fost postată cu succes!',
        [
          {
            text: 'Vezi postarea',
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
              setVideoUri('');
              setCurrentStep(0);
              setUploadProgress(0);
              setUploadStatus('');
              
              // Navigate to car details
              router.push(`/car/${car.id}`);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error posting car:', error);
      setUploadStatus('Eroare la încărcare');
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
        <Animated.View entering={FadeInDown} style={styles.authRequired}>
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
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (showCamera) {
    return (
      <CustomCamera
        onVideoRecorded={handleVideoRecorded}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
            </ScrollView>
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
            <View style={styles.centeredContent}>
              <Animated.Text entering={FadeInDown.delay(200)} style={styles.stepTitle}>
                Video prezentare
              </Animated.Text>
              <Animated.Text entering={FadeInDown.delay(400)} style={styles.stepSubtitle}>
                Filmează mașina ta (maxim 60 secunde)
              </Animated.Text>
              
              {/* Video Tips */}
              <Animated.View entering={FadeInDown.delay(600)} style={styles.videoTipsContainer}>
                <Text style={styles.videoTipsTitle}>🎬 Sfaturi pentru video de calitate</Text>
                <Text style={styles.videoTipsText}>• Filmează în lumină bună</Text>
                <Text style={styles.videoTipsText}>• Arată exteriorul din toate unghiurile</Text>
                <Text style={styles.videoTipsText}>• Include interiorul și portbagajul</Text>
                <Text style={styles.videoTipsText}>• Pornește motorul să se audă</Text>
              </Animated.View>
              
              <Animated.View entering={FadeInDown.delay(800)} style={styles.videoContainer}>
                {videoUri ? (
                  <Animated.View entering={FadeInDown} style={styles.videoPreview}>
                    <View style={styles.videoPreviewHeader}>
                      <View style={styles.videoSuccessIcon}>
                        <Check size={32} color="#000" />
                      </View>
                      <Text style={styles.videoText}>Video înregistrat cu succes!</Text>
                    </View>
                    
                    <View style={styles.videoPreviewInfo}>
                                             <Text style={styles.videoSubtext}>Durată: ~60s</Text>
                      <Text style={styles.videoQualityText}>✅ Calitate HD</Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.rerecordButton}
                      onPress={() => setShowCamera(true)}
                    >
                      <Video size={20} color="#000" />
                      <Text style={styles.rerecordButtonText}>Înregistrează din nou</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ) : (
                  <TouchableOpacity 
                    style={styles.cameraButton}
                    onPress={() => setShowCamera(true)}
                  >
                    <Animated.View style={styles.cameraButtonIcon}>
                      <Video size={48} color="#F97316" />
                    </Animated.View>
                    <Text style={styles.cameraButtonText}>Începe înregistrarea</Text>
                    <Text style={styles.cameraButtonSubtext}>
                      Prezintă mașina ta în 60 de secunde
                    </Text>
                    <View style={styles.recordingHints}>
                      <Text style={styles.recordingHintText}>📱 Ține telefonul orizontal</Text>
                      <Text style={styles.recordingHintText}>🔊 Vorbește clar despre mașină</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </Animated.View>
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
            <View style={styles.centeredContent}>
              <Text style={styles.stepTitle}>Fotografii</Text>
              <Text style={styles.stepSubtitle}>Adaugă până la 10 fotografii ({images.length}/10)</Text>
              
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Photo Upload Tips */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.photoTipsContainer}>
                  <Text style={styles.photoTipsTitle}>📸 Sfaturi pentru fotografii de calitate</Text>
                  <Text style={styles.photoTipsText}>• Fotografiază în lumină naturală</Text>
                  <Text style={styles.photoTipsText}>• Include exteriorul și interiorul</Text>
                  <Text style={styles.photoTipsText}>• Arată eventualele defecte</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400)} style={styles.imagesGrid}>
                  {images.map((image, index) => (
                    <Animated.View 
                      key={index} 
                      entering={FadeInDown.delay(index * 100)}
                      style={styles.imageItem}
                    >
                      <Image source={{ uri: image }} style={styles.imagePreview} />
                      <View style={styles.imageOverlay}>
                        <TouchableOpacity 
                          style={styles.removeImageButton}
                          onPress={() => removeImage(index)}
                        >
                          <X size={16} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.imageIndex}>
                          <Text style={styles.imageIndexText}>{index + 1}</Text>
                        </View>
                      </View>
                      {index === 0 && (
                        <View style={styles.primaryImageBadge}>
                          <Text style={styles.primaryImageText}>PRINCIPALĂ</Text>
                        </View>
                      )}
                    </Animated.View>
                  ))}
                  
                  {images.length < 10 && (
                    <Animated.View entering={FadeInDown.delay(images.length * 100)}>
                      <TouchableOpacity 
                        style={[styles.addImageButton, compressing && styles.addImageButtonLoading]} 
                        onPress={pickImages}
                        disabled={compressing}
                      >
                        {compressing ? (
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#F97316" />
                            <Text style={styles.loadingText}>Procesez...</Text>
                          </View>
                        ) : (
                          <>
                            <View style={styles.addImageIcon}>
                              <Plus size={28} color="#F97316" />
                            </View>
                            <Text style={styles.addImageText}>Adaugă fotografii</Text>
                            <Text style={styles.addImageSubtext}>
                              {images.length === 0 ? 'Prima fotografie va fi principală' : `${10 - images.length} rămase`}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </Animated.View>

                {/* Photo Organization */}
                {images.length > 1 && (
                  <Animated.View entering={FadeInDown.delay(600)} style={styles.photoOrganization}>
                    <Text style={styles.organizationTitle}>Organizează fotografiile</Text>
                    <Text style={styles.organizationSubtitle}>
                      Ține apăsat și trage pentru a schimba ordinea
                    </Text>
                    <View style={styles.photoReorderHint}>
                      <Text style={styles.reorderHintText}>💡 Prima fotografie va fi afișată ca principală</Text>
                    </View>
                  </Animated.View>
                )}
              </ScrollView>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => currentStep > 0 ? prevStep() : router.back()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Postează mașina</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress */}
        <StepProgress currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step indicator */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepCounter}>Pasul {currentStep + 1} din {totalSteps}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {renderStepContent()}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.navButton} onPress={prevStep}>
              <ArrowLeft size={18} color="#fff" />
              <Text style={styles.navButtonText}>Înapoi</Text>
            </TouchableOpacity>
          )}
          
          <View style={{ flex: 1 }} />
          
          {currentStep < totalSteps - 1 ? (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonPrimary, !canProceedFromStep(currentStep) && styles.navButtonDisabled]} 
              onPress={nextStep}
              disabled={!canProceedFromStep(currentStep)}
            >
              <Text style={styles.navButtonTextPrimary}>Continuă</Text>
              <ArrowRight size={18} color="#000" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonPrimary, (!canProceedFromStep(currentStep) || loading) && styles.navButtonDisabled]} 
              onPress={handlePost}
              disabled={!canProceedFromStep(currentStep) || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Text style={styles.navButtonTextPrimary}>Postează</Text>
                  <Check size={18} color="#000" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Upload Progress Modal */}
        {loading && (
          <View style={styles.progressOverlay}>
            <Animated.View entering={FadeInDown} style={styles.progressModal}>
              <ActivityIndicator size="large" color="#F97316" style={styles.progressSpinner} />
              <Text style={styles.progressTitle}>Se postează mașina...</Text>
              <Text style={styles.progressStatus}>{uploadStatus}</Text>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <Animated.View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${uploadProgress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
              </View>
              
              <Text style={styles.progressNote}>
                Te rog nu închide aplicația în timpul încărcării
              </Text>
            </Animated.View>
          </View>
        )}
      </KeyboardAvoidingView>
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
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  progressStepCompleted: {
    backgroundColor: '#F97316',
  },
  progressStepActive: {
    backgroundColor: '#F97316',
  },
  progressStepInactive: {
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#555',
  },
  progressStepText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  progressStepTextActive: {
    color: '#000',
  },
  progressStepTextInactive: {
    color: '#666',
  },
  stepHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  stepCounter: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#F97316',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
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
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    width: '100%',
    maxWidth: 300,
  },
  cameraButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 16,
  },
  cameraButtonSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  videoPreview: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  videoText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  videoSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  rerecordButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  rerecordButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  imageItem: {
    position: 'relative',
    width: (screenWidth - 60) / 2,
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addImageButton: {
    width: (screenWidth - 60) / 2,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  addImageText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#F97316',
    marginTop: 8,
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
  },
  navButtonPrimary: {
    backgroundColor: '#F97316',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginLeft: 6,
  },
  navButtonTextPrimary: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginRight: 6,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  cameraCloseButton: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cameraTimer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cameraTimerActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderColor: '#EF4444',
  },
  cameraTimerText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginLeft: 4,
  },
  cameraFlipButton: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cameraLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  cameraLoadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginTop: 12,
  },
  recordingProgressContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    width: 60,
    height: 60,
    zIndex: 10,
  },
  recordingProgressBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 3,
    borderColor: '#EF4444',
    overflow: 'hidden',
  },
  recordingProgressFill: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 60,
    height: 60,
    backgroundColor: '#EF4444',
    transformOrigin: '30px 30px',
  },
  cameraGuidelines: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    right: '40%',
    bottom: '40%',
    zIndex: 5,
  },
  guidelineHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  guidelineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  recordingTips: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 10,
  },
  recordingTipsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    textAlign: 'center',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 50,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  cameraControlsInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  recordButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonActive: {
    borderColor: '#EF4444',
  },
  recordButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonInnerActive: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
  },
  flashButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  flashButtonText: {
    fontSize: 20,
  },
  recordingControls: {
    marginTop: 20,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pauseButtonText: {
    fontSize: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  // Permission styles
  permissionIconContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 50,
  },
  cameraPermissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  cameraPermissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  cameraPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // Progress Modal Styles
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  progressModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 280,
  },
  progressSpinner: {
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressStatus: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F97316',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    textAlign: 'center',
  },
  progressNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  // Enhanced Photo Styles
  photoTipsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  photoTipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#F97316',
    marginBottom: 12,
  },
  photoTipsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  imageIndex: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndexText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  primaryImageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#F97316',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryImageText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  addImageButtonLoading: {
    opacity: 0.7,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#F97316',
    marginTop: 8,
  },
  addImageIcon: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 20,
  },
  addImageSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  photoOrganization: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  organizationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
  },
  organizationSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
  },
  photoReorderHint: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  reorderHintText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#F97316',
    textAlign: 'center',
  },
  // Enhanced Video Styles
  videoTipsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  videoTipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#F97316',
    marginBottom: 12,
  },
  videoTipsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  videoPreviewHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  videoSuccessIcon: {
    backgroundColor: '#F97316',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  videoPreviewInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  videoQualityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#22C55E',
  },
  cameraButtonIcon: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 50,
  },
  recordingHints: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  recordingHintText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
});