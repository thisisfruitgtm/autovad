module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@expo/.*|expo-.*|@unimodules|unimodules|sentry-expo|native-base|react-clone-referenced-element|@react-native-community|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|expo-app-loading|expo-asset|expo-constants|expo-file-system|expo-font|expo-keep-awake|expo-linear-gradient|expo-location|expo-permissions|expo-splash-screen|expo-updates|expo-web-browser).*)',
  ],
  moduleNameMapper: {
    '^react-native-reanimated$': 'react-native-reanimated/mock',
    '^react-native-reanimated/src/reanimated2/NativeReanimatedModule$': '<rootDir>/__mocks__/NativeReanimatedModule.js',
    '^react-native-reanimated/src/specs/NativeReanimatedModule$': '<rootDir>/__mocks__/NativeReanimatedModule.js',
    '^@/(.*)$': '<rootDir>/$1',
  },
}; 