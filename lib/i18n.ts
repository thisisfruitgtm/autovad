import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import ro from '../locales/ro';
import en from '../locales/en';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Use a simpler storage key and add timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AsyncStorage timeout')), 1000)
      );
      
      const storagePromise = AsyncStorage.getItem('autovad_language');
      
      const savedLanguage = await Promise.race([storagePromise, timeoutPromise]) as string | null;
      
      if (savedLanguage && (savedLanguage === 'ro' || savedLanguage === 'en')) {
        callback(savedLanguage);
      } else {
        callback('ro'); // Default to Romanian
      }
    } catch (error) {
      // Silently fallback to default language without logging
      // This prevents console spam in development
      callback('ro');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      // Add timeout for storage operations
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AsyncStorage timeout')), 1000)
      );
      
      const storagePromise = AsyncStorage.setItem('autovad_language', lng);
      
      await Promise.race([storagePromise, timeoutPromise]);
    } catch (error) {
      // Silently fail - language will use session state instead
      // This prevents console spam in development
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    fallbackLng: 'ro',
    debug: false,
    
    resources: {
      ro: {
        translation: ro,
      },
      en: {
        translation: en,
      },
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;