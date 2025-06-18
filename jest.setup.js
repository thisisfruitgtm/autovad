import '@testing-library/jest-native/extend-expect';

// Mock environment variables
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test-supabase-url.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock React Native modules
jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((options) => options.ios || options.default),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
    },
    Alert: {
      alert: jest.fn(),
    },
    DeviceEventEmitter: {
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      removeAllListeners: jest.fn(),
      emit: jest.fn(),
    },
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    FlatList: 'FlatList',
    Image: 'Image',
    ScrollView: 'ScrollView',
    StyleSheet: {
      create: jest.fn((styles) => styles),
      absoluteFillObject: {},
    },
  };
});

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        supabaseUrl: 'https://test-supabase-url.supabase.co',
        supabaseAnonKey: 'test-anon-key',
      },
    },
  },
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  usePathname: () => '/',
}));

jest.mock('expo-linking', () => ({
  addEventListener: jest.fn(),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  makeRedirectUri: jest.fn(() => 'test://redirect'),
}));

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(() => 
    Promise.resolve({ type: 'success', url: 'test://callback?access_token=test' })
  ),
}));

jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn(() => 
    Promise.resolve({ exists: true, size: 1024, uri: 'file://test.jpg' })
  ),
  readAsStringAsync: jest.fn(() => Promise.resolve('base64data')),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(() => 
    Promise.resolve({ uri: 'file://compressed.jpg' })
  ),
  SaveFormat: {
    JPEG: 'jpeg',
  },
}));

jest.mock('expo-camera', () => ({
  Camera: {
    Constants: {
      Type: {
        back: 'back',
        front: 'front',
      },
    },
  },
  useCameraPermissions: () => [
    { granted: true },
    jest.fn(() => Promise.resolve({ granted: true })),
  ],
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Mock specific animations
  Reanimated.FadeInDown = {
    delay: jest.fn(() => Reanimated.FadeInDown),
  };
  Reanimated.FadeInUp = {
    delay: jest.fn(() => Reanimated.FadeInUp),
  };
  
  return Reanimated;
});

jest.mock('lucide-react-native', () => ({
  Heart: 'Heart',
  MessageCircle: 'MessageCircle',
  Share: 'Share',
  MapPin: 'MapPin',
  Fuel: 'Fuel',
  Gauge: 'Gauge',
  Building: 'Building',
  User: 'User',
  Shield: 'Shield',
  Car: 'Car',
  RefreshCw: 'RefreshCw',
  Plus: 'Plus',
  Settings: 'Settings',
  Search: 'Search',
  X: 'X',
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: null }, 
        error: null 
      })),
      getSession: jest.fn(() => Promise.resolve({ 
        data: { session: null }, 
        error: null 
      })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      signUp: jest.fn(() => Promise.resolve({ 
        data: { user: null }, 
        error: null 
      })),
      signInWithPassword: jest.fn(() => Promise.resolve({ 
        data: { user: null }, 
        error: null 
      })),
      signInWithOAuth: jest.fn(() => Promise.resolve({ 
        data: { url: 'https://oauth-url.com' }, 
        error: null 
      })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            })),
          })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ 
        data: null, 
        error: null 
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ 
          data: null, 
          error: null 
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ 
          data: null, 
          error: null 
        })),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ 
          data: { path: 'test-path' }, 
          error: null 
        })),
        getPublicUrl: jest.fn(() => ({ 
          data: { publicUrl: 'https://test-url.com/image.jpg' } 
        })),
      })),
    },
  })),
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ro',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

jest.mock('i18next', () => ({
  use: jest.fn(() => ({
    init: jest.fn(),
  })),
  t: jest.fn((key) => key),
  changeLanguage: jest.fn(),
  language: 'ro',
}));

// Global test utilities
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Silence console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('componentWillReceiveProps') ||
     args[0].includes('componentWillUpdate') ||
     args[0].includes('EXNativeModulesProxy') ||
     args[0].includes('EXPO_OS'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
}; 