# Autovad - Car Marketplace Mobile App

🎉 **LATEST UPDATE: Google SignIn is now FULLY FUNCTIONAL!** 🎉

A modern mobile application for buying and selling cars, built with React Native and Expo.

## Features

- 🔐 **Authentication** ✅ **WORKING**
  - Email/Password login ✅
  - **Google OAuth integration** ✅ **FULLY FUNCTIONAL**
  - Secure session management ✅
- 🚗 **Car Listings** ✅ **ENHANCED**
  - Browse car listings with real-time updates ✅
  - Detailed car information with navigation ✅
  - Image and video galleries ✅
  - **Real-time like synchronization** ✅ **NEW**
- 💖 **Advanced Favorites System** ✅ **NEW**
  - Save/unsave favorite cars with confirmation ✅
  - **Real-time sync between all pages** ✅
  - Smooth animations (FadeIn, SlideOut, Layout transitions) ✅
  - Unlike confirmation popups in Romanian ✅
  - **Triple-layer synchronization system** ✅
    - DeviceEventEmitter for instant component communication
    - Supabase Realtime for database synchronization
    - Tab focus refresh with throttling (max once per 5 seconds)
- 🔄 **Real-time Features** ✅ **NEW**
  - Live like count updates across all screens ✅
  - Automatic synchronization when switching between tabs ✅
  - Fixed multiple subscription errors ✅
  - Optimized performance with unique channel names ✅
- 🎨 **Enhanced User Experience** ✅ **NEW**
  - Login invitations for unauthenticated users ✅
  - Smooth page transitions and animations ✅
  - Consistent Romanian interface ✅
  - Error handling with user-friendly messages ✅
- 💬 Social Features
  - Direct messaging with sellers
  - User ratings and reviews
- 🔍 Advanced Search
  - Filter by make, model, price
  - Location-based search
  - Custom search preferences
- 🌐 Internationalization
  - Romanian language support ✅
  - English language support ✅
  - Easy to add more languages ✅

## Tech Stack

- React Native
- Expo
- Supabase (Backend & Authentication)
- TypeScript
- i18next (Internationalization)
- **React Native Reanimated** (Advanced Animations) ✅
- **DeviceEventEmitter** (Component Communication) ✅ **NEW**
- **Supabase Realtime** (Live Database Sync) ✅ **NEW**
- Expo Router (Navigation)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator
- Google Cloud Console account
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/thisisfruitgtm/autovad.git
cd autovad
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Configure Google OAuth:

a. Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Sign-In API
   - Create OAuth 2.0 credentials
   - Add the following Authorised JavaScript origins:
     ```
     https://mktfybjfxzhvpmnepshq.supabase.co
     exp://192.168.0.197:8082
     exp://localhost:8082
     ```
   - Add the following Authorised redirect URIs:
     ```
     autovad://auth/callback
     https://mktfybjfxzhvpmnepshq.supabase.co/auth/v1/callback
     exp://192.168.0.197:8082/--/(auth)
     exp://localhost:8082/--/(auth)
     ```

b. Configure Supabase:
   - Go to Authentication → URL Configuration
   - Set Site URL to: `https://mktfybjfxzhvpmnepshq.supabase.co`
   - Add the following Redirect URLs:
     ```
     autovad://auth/callback
     exp://192.168.0.197:8082/--/(auth)
     exp://localhost:8082/--/(auth)
     ```
   - Make sure "Enable OAuth providers" is turned on for Google
   - Add your Google Client ID and Secret from Google Cloud Console

5. Start the development server:
```bash
npm start
# or
yarn start
```

### Running on Devices

- iOS: Press `i` in the terminal or click "Run on iOS simulator" in Expo Dev Tools
- Android: Press `a` in the terminal or click "Run on Android device/emulator" in Expo Dev Tools

## 🎉 Google Login Usage - **FULLY WORKING!**

✅ **CONFIRMED WORKING** - Google OAuth authentication is now 100% functional!

- On the login and register screens, you can sign in or register with Google by pressing the "Sign in with Google" button.
- The app uses a **fixed URL scheme** (`exp://localhost/--/auth/callback`) for reliable OAuth redirects.
- **Supabase Dashboard Configuration Required:**
  - Add `exp://localhost/--/auth/callback` to Redirect URLs
  - Add `autovad://auth/callback` for production builds
- **Google Cloud Console Setup:**
  - Add your Supabase callback URL: `https://[project-id].supabase.co/auth/v1/callback`
- The app handles the complete OAuth flow and automatically creates/logs in users.

### 🔧 **Debug & Setup Guide:**
- See `SETUP-GOOGLE-AUTH.md` for detailed configuration steps
- Use the built-in debug page (`/debug-oauth`) during development to verify URLs

## Security Best Practices

- **Never commit your `.env` file**. It is already included in `.gitignore`.
- Do not expose your Supabase keys or Google client secrets in the codebase.
- Use environment variables for all sensitive configuration.
- If you need to share configuration, use a `.env.example` file (without real secrets).

## Troubleshooting

- **Google Login not working?**
  - Double-check your Google OAuth setup in Supabase and Google Cloud Console.
  - Make sure your redirect URIs are correct:
    - Google Cloud Console: `https://your-project.supabase.co/auth/v1/callback`
    - Supabase: `autovad://auth/callback`
  - Ensure your credentials are present in `.env` or `app.json`.
- **Supabase connection issues?**
  - Verify your Supabase URL and anon key.
  - Check for typos in your environment variables.
- **App not starting?**
  - Run `npm install` or `yarn install` to ensure all dependencies are present.
  - Make sure you are using a supported Node.js version (v18+).

## 🚀 Latest Technical Improvements

### Real-time Synchronization System

The app now features a sophisticated **triple-layer synchronization system** that ensures perfect consistency across all screens:

#### 1. **DeviceEventEmitter Layer**
```typescript
// Instant component communication
DeviceEventEmitter.emit('likeStateChanged', { carId, isLiked: true });
```
- **Purpose**: Immediate UI updates across components
- **Speed**: Instant (0ms delay)
- **Usage**: When user likes/unlikes a car, all components update immediately

#### 2. **Supabase Realtime Layer**
```typescript
// Database-level synchronization
const likesSubscription = supabase
  .channel(`likes_changes_${user.id}_${Date.now()}`)
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'likes' 
  }, handleLikeChange)
  .subscribe();
```
- **Purpose**: Sync with database changes (including other devices)
- **Speed**: ~100-500ms
- **Usage**: Ensures consistency when multiple devices/users interact

#### 3. **Tab Focus Refresh Layer**
```typescript
// Throttled refresh on tab focus
const throttledRefresh = useCallback(
  throttle(() => refreshCars(), 5000),
  [refreshCars]
);
```
- **Purpose**: Fallback sync when returning to tabs
- **Speed**: Throttled to max once per 5 seconds
- **Usage**: Ensures data freshness when switching between app sections

### Advanced Animation System

#### **Favorites List Animations**
```typescript
// Entry animation with stagger
<Animated.View entering={FadeInDown.delay(index * 100).springify()}>

// Exit animation
<Animated.View exiting={SlideOutRight.duration(300)}>

// Layout transitions
<Animated.View layout={Layout.springify().damping(15).stiffness(150)}>
```

**Animation Types:**
- **FadeInDown**: Smooth entry with staggered delays (100ms per item)
- **SlideOutRight**: 300ms slide-out when removing items
- **Layout.springify()**: Smooth reordering with spring physics

### Error Handling & Performance

#### **Subscription Management**
- **Unique channel names**: Prevents "multiple subscription" errors
- **Proper cleanup**: Uses `unsubscribe()` instead of `removeChannel()`
- **Optimized dependencies**: Prevents unnecessary re-subscriptions

#### **Romanian User Interface**
- **Confirmation dialogs**: "Anulează" / "Șterge" buttons
- **Error messages**: User-friendly Romanian error handling
- **Loading states**: Consistent loading indicators

## Project Structure

```
autovad/
├── app/                    # Main application code
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs (with real-time sync)
│   │   ├── index.tsx      # Main feed (with tab focus refresh)
│   │   ├── liked.tsx      # Favorites (with animations)
│   │   └── ...
│   └── _layout.tsx        # Root layout
├── assets/                # Static assets
├── components/            # Reusable components
│   ├── CarPost.tsx        # Enhanced with real-time updates
│   └── VideoCarousel.tsx  # Smooth video playback
├── hooks/                 # Custom React hooks
│   ├── useCars.ts         # Real-time car management
│   ├── useAuth.ts         # Authentication state
│   └── ...
├── lib/                   # Utility functions
│   ├── supabase.ts        # Supabase client with realtime
│   └── ...
├── locales/              # Translation files (Romanian/English)
├── supabase/             # Database migrations
│   └── migrations/       # Including realtime setup
└── types/                # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Expo](https://expo.dev/)
- [Supabase](https://supabase.io/)
- [React Native](https://reactnative.dev/)
- [Lucide Icons](https://lucide.dev/)

---

## 🛠️ Developer Workflow Guide

### Branch Strategy & CI/CD

This project uses a modern development workflow with automated builds and over-the-air (OTA) updates:

#### **`dev` branch (Development)**
- Used for feature development and rapid testing
- **On every push to `dev`**: Automatically triggers an **OTA update** on the `dev` channel
- Perfect for testing with Expo Go or development builds

#### **`main` branch (Production)**
- Used for stable releases
- **On every push to `main`**: Automatically triggers:
  - **OTA update** on the `main` channel (production)
  - **Native builds** for Android and iOS

### Daily Development Workflow

#### 1. **Development on `dev`**
```bash
# Make sure you're on the dev branch
git checkout dev
git pull origin dev

# Make your changes
# ...

# Commit and push (triggers automatic OTA update on dev)
git add .
git commit -m "feat: add new feature"
git push origin dev
```

#### 2. **Release to `main`**
When ready for production release:
```bash
# Switch to main and merge from dev
git checkout main
git pull origin main
git merge dev
git push origin main
```
This push automatically triggers:
- OTA update on the `main` channel
- Native builds for Android and iOS

#### 3. **Quick Promotion (without rebuild)**
To quickly promote an update from `dev` to `main` without creating new builds:
- Go to GitHub → **Actions** → **EAS Dev/Prod OTA & Build**
- Click **Run workflow**
- Select the `dev` branch
- The workflow will promote the latest `dev` update directly to `main`

### Testing & Development

#### **With Expo Go (Recommended for development)**
```bash
# Start the development server
npx expo start

# Scan QR code with Expo Go on your phone
```

#### **With development builds**
```bash
# Build for Android
eas build --platform android --profile development

# Build for iOS  
eas build --platform ios --profile development
```

### Manual Operations

#### **Manual OTA Updates**
```bash
# Update on dev channel
eas update --branch dev --message "Quick fix on dev"

# Update on main channel (production)
eas update --branch main --message "Production hotfix"

# Promote from dev to main
eas update:promote --from-branch dev --to-branch main
```

#### **Manual Builds**
```bash
# Production build for Android
eas build --platform android --profile production

# Production build for iOS
eas build --platform ios --profile production

# Build for both platforms
eas build --platform all --profile production
```

### Monitoring & Analytics

#### **Check builds and updates:**
- [Expo Dashboard](https://expo.dev/accounts/mihaimar/projects/autovad)
- [GitHub Actions](https://github.com/thisisfruitgtm/autovad/actions)

#### **Check analytics and errors:**
- Supabase Dashboard for backend monitoring
- Expo Dashboard for crash reports and performance

### Developer Setup Requirements

#### **Additional Tools**
```bash
# EAS CLI
npm install -g eas-cli

# Login to EAS
eas login
```

#### **Environment Variables**
Make sure your `.env` file includes:
```env
EXPO_PUBLIC_SUPABASE_URL=https://mktfybjfxzhvpmnepshq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=https://mktfybjfxzhvpmnepshq.supabase.co
```

### Common Developer Issues

#### **Google OAuth not working?**
1. For Expo Go, test only on physical devices (not simulator)
2. Verify that `expo.dev/accounts/mihaimar/projects/autovad` lists the project
3. For native builds, ensure URL scheme is configured (`autovad://`)

#### **Builds failing?**
1. Check that `EXPO_TOKEN` is set correctly in GitHub Secrets
2. Ensure you have permissions for the Expo project
3. Check GitHub Actions logs for details

#### **OTA Updates not reaching users?**
1. Verify runtime version (`runtimeVersion`) compatibility
2. Ensure the build has EAS Update configured
3. Check the correct channel on Expo Dashboard

### Resources for Developers

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Expo Development Workflow](https://docs.expo.dev/develop/development-builds/introduction/)
- [GitHub Actions for EAS](https://docs.expo.dev/eas-update/github-actions/)

---

**Happy coding! 🚀**


Fluxul complet simplu:
1. Lucrezi în dev (dezvoltare zilnică)
Apply to README.md
Run
dev
Ce se întâmplă automat:
GitHub Actions detectează push pe dev
Rulează eas update --branch dev
→ OTA update pe canalul dev în EAS
→ Utilizatorii pe canalul dev primesc update-ul instant (fără reinstalare app)
2. Când ești gata de producție
Apply to README.md
Run
main
Ce se întâmplă automat:
GitHub Actions detectează push pe main
Rulează eas update --branch main → OTA update pe prod
Rulează eas build → Build nativ nou (apk/ipa)
→ Utilizatorii pe main primesc OTA update
→ Build-ul nou ajunge în store (Google Play/App Store)
Pe scurt:
dev = OTA update rapid pentru testare
main = OTA update + build nou pentru producție
EAS = platforma Expo care gestionează update-urile și build-urile
GitHub Actions = automatizarea care declanșează totul
Avantaje:
Testezi rapid pe dev fără rebuild
Release-uri sigure pe main cu build complet
Zero configurare manuală - totul automat
OTA updates = utilizatorii primesc fix-uri instant
Deci da, exact cum ai zis: dev → testezi → main → GitHub Actions → EAS → users! 🚀