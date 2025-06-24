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
      flatten: jest.fn((style) => style),
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
  // Mock all exported hooks and components
  return {
    ...Reanimated,
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((v) => v),
    withTiming: jest.fn((v) => v),
    withDelay: jest.fn((_, v) => v),
    Easing: { linear: jest.fn() },
    FadeInDown: { delay: jest.fn(() => ({})) },
    FadeInUp: { delay: jest.fn(() => ({})) },
    // Add any other animation mocks as needed
  };
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
jest.mock('@/lib/supabase', () => ({
  supabase: {
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
      upsert: jest.fn(() => Promise.resolve({ 
        data: null, 
        error: null 
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(() => ({
          unsubscribe: jest.fn(),
        })),
      })),
    })),
  },
}), { virtual: true });

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

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'test://redirect'),
  useAuthRequest: jest.fn(() => [
    { url: 'test://auth' },
    { type: 'success' },
    jest.fn(),
  ]),
  AuthRequest: jest.fn(),
  AuthSessionResult: jest.fn(),
}));

jest.mock('expo-modules-core', () => ({
  NativeModule: jest.fn(),
  EventEmitter: jest.fn(),
  requireNativeModule: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    seek: jest.fn(),
    setVolume: jest.fn(),
    setMuted: jest.fn(),
    setLooping: jest.fn(),
    setPlaybackRate: jest.fn(),
    getStatusAsync: jest.fn(() => Promise.resolve({ isLoaded: true, isPlaying: false })),
    loadAsync: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock('expo-video', () => ({
  VideoView: 'VideoView',
  useVideoPlayer: jest.fn(() => ({
    ref: { current: null },
    play: jest.fn(),
    pause: jest.fn(),
    seek: jest.fn(),
    setVolume: jest.fn(),
    setMuted: jest.fn(),
    setLooping: jest.fn(),
    setPlaybackRate: jest.fn(),
    getStatusAsync: jest.fn(() => Promise.resolve({ isLoaded: true, isPlaying: false })),
    loadAsync: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock custom hooks
jest.mock('@/hooks/useLazyMedia', () => ({
  useLazyMedia: jest.fn(() => ({
    isLoaded: true,
    load: jest.fn(),
  })),
  useLazyVideo: jest.fn(() => ({
    isLoaded: true,
    load: jest.fn(),
  })),
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key) => key,
    currentLanguage: 'en',
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    signIn: jest.fn(),
    signOut: jest.fn(),
    loading: false,
  }),
}));

jest.mock('@/hooks/useCars', () => ({
  useCars: () => ({
    cars: [],
    loading: false,
    error: null,
    likeCar: jest.fn(),
    unlikeCar: jest.fn(),
    refreshCars: jest.fn(),
  }),
}));

jest.mock('react-native-reanimated/src/reanimated2/NativeReanimatedModule', () => ({
  native: true,
  installCoreFunctions: jest.fn(),
  get: jest.fn(),
}), { virtual: true });
jest.mock('react-native-reanimated/src/specs/NativeReanimatedModule', () => ({
  native: true,
  installCoreFunctions: jest.fn(),
  get: jest.fn(),
}), { virtual: true }); 