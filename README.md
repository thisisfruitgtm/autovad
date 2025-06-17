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