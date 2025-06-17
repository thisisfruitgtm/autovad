import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Info, 
  LogOut,
  Globe,
  ChevronRight,
  Check
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';

function SettingsScreen() {
  const { signOut, user } = useAuth();
  const { t, currentLanguage, changeLanguage } = useTranslation();

  // Optimize tab focus behavior
  useFocusEffect(
    useCallback(() => {
      // Tab became active - settings data is already loaded
      return () => {
        // Tab lost focus - keep data in memory
      };
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      'Ești sigur că vrei să te deconectezi?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('settings.logout'), 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleLanguageChange = (newLanguage: string) => {
    changeLanguage(newLanguage);
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    rightElement 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showArrow && <ChevronRight size={20} color="#666" />}
      </View>
    </TouchableOpacity>
  );

  const LanguageSelector = () => (
    <View style={styles.languageSelector}>
      <TouchableOpacity
        style={[
          styles.languageOption,
          currentLanguage === 'ro' && styles.languageOptionActive
        ]}
        onPress={() => handleLanguageChange('ro')}
      >
        <Text style={[
          styles.languageText,
          currentLanguage === 'ro' && styles.languageTextActive
        ]}>
          🇷🇴 {t('settings.romanian')}
        </Text>
        {currentLanguage === 'ro' && <Check size={20} color="#F97316" />}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.languageOption,
          currentLanguage === 'en' && styles.languageOptionActive
        ]}
        onPress={() => handleLanguageChange('en')}
      >
        <Text style={[
          styles.languageText,
          currentLanguage === 'en' && styles.languageTextActive
        ]}>
          🇺🇸 {t('settings.english')}
        </Text>
        {currentLanguage === 'en' && <Check size={20} color="#F97316" />}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.settings')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          
          <SettingItem
            icon={<User size={24} color="#F97316" />}
            title={user?.user_metadata?.name || user?.email || 'User'}
            subtitle={user?.email}
            onPress={() => {
              // Navigate to profile edit
              Alert.alert('Profile', 'Editarea profilului va fi disponibilă în curând');
            }}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Globe size={24} color="#F97316" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{t('settings.language')}</Text>
                <Text style={styles.settingSubtitle}>
                  {currentLanguage === 'ro' ? t('settings.romanian') : t('settings.english')}
                </Text>
              </View>
            </View>
          </View>
          
          <LanguageSelector />
          
          <SettingItem
            icon={<Bell size={24} color="#F97316" />}
            title={t('settings.notifications')}
            subtitle="Gestionează notificările"
            onPress={() => {
              Alert.alert('Notifications', 'Setările de notificare vor fi disponibile în curând');
            }}
          />
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidențialitate și Securitate</Text>
          
          <SettingItem
            icon={<Shield size={24} color="#F97316" />}
            title={t('settings.privacy')}
            subtitle="Controlează confidențialitatea datelor"
            onPress={() => {
              Alert.alert('Privacy', 'Setările de confidențialitate vor fi disponibile în curând');
            }}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.support')}</Text>
          
          <SettingItem
            icon={<Info size={24} color="#F97316" />}
            title={t('settings.about')}
            subtitle="Autovad v1.0.0"
            onPress={() => {
              Alert.alert(
                'Despre Autovad',
                'Autovad este o platformă premium pentru comerțul auto în România.\n\nVersiune: 1.0.0\nDezvoltată cu ❤️ pentru pasionații de mașini'
              );
            }}
          />
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={24} color="#FF4444" />
            <Text style={styles.logoutText}>{t('settings.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Export memoized component for maximum performance
export default React.memo(SettingsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageSelector: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  languageOptionActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  languageText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  languageTextActive: {
    color: '#F97316',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.2)',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4444',
    marginLeft: 8,
  },
});