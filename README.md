# Autovad - Car Marketplace Mobile App

rrrr
A modern mobile application for buying and selling cars, built with React Native and Expo.

## Features

- 🔐 Authentication
  - Email/Password login
  - Google OAuth integration
  - Secure session management
- 🚗 Car Listings
  - Browse car listings
  - Detailed car information
  - Image and video galleries
- 💬 Social Features
  - Save favorite cars
  - Direct messaging with sellers
  - User ratings and reviews
- 🔍 Advanced Search
  - Filter by make, model, price
  - Location-based search
  - Custom search preferences
- 🌐 Internationalization
  - Romanian language support
  - English language support
  - Easy to add more languages

## Tech Stack

- React Native
- Expo
- Supabase (Backend & Authentication)
- TypeScript
- i18next (Internationalization)
- React Native Reanimated (Animations)
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

## Google Login Usage

- On the login and register screens, you can sign in or register with Google by pressing the "Sign in with Google" button.
- The app uses a custom URL scheme (`autovad://`) for handling the OAuth redirect.
- Make sure your Google OAuth credentials are set up in both Google Cloud Console and Supabase.
- The app will handle the OAuth flow and automatically create or log in the user.

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

## Project Structure

```
autovad/
├── app/                    # Main application code
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── assets/                # Static assets
├── components/            # Reusable components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── locales/              # Translation files
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