import { Tabs } from 'expo-router';
import { Car, Search, Plus, User, Heart, Settings } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';

// Memoize icon components for better performance
const TabIcons = {
  feed: Car,
  search: Search,
  post: Plus,
  liked: Heart,
  profile: User,
  settings: Settings,
};

export default function TabLayout() {
  const { t } = useTranslation();

  // console.log('📱 TabLayout: Rendering tabs');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: false, // Preload all tabs for instant switching
        freezeOnBlur: false, // Keep tabs active for smooth transitions
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor: '#F97316',
          borderTopWidth: 2,
          height: 90,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 11,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarHideOnKeyboard: true, // Better UX when keyboard shows
        tabBarAllowFontScaling: false, // Prevent layout shifts
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.feed'),
          tabBarIcon: ({ size, color }) => {
            const IconComponent = TabIcons.feed;
            return <IconComponent size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('navigation.search'),
          tabBarIcon: ({ size, color }) => {
            const IconComponent = TabIcons.search;
            return <IconComponent size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: t('navigation.post'),
          tabBarIcon: ({ size, color }) => {
            const IconComponent = TabIcons.post;
            return <IconComponent size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="liked"
        options={{
          title: t('navigation.liked'),
          tabBarIcon: ({ size, color }) => {
            const IconComponent = TabIcons.liked;
            return <IconComponent size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ size, color }) => {
            const IconComponent = TabIcons.profile;
            return <IconComponent size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.settings'),
          tabBarIcon: ({ size, color }) => {
            const IconComponent = TabIcons.settings;
            return <IconComponent size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}