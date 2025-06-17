# Autovad - Car Marketplace Mobile App

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

# Google OAuth Configuration (if needed)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

You can also configure these values in `app.json` under the `extra` section:
```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "your_supabase_project_url",
      "supabaseAnonKey": "your_supabase_anon_key",
      "googleClientId": "your_google_client_id"
    }
  }
}
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

### Running on Devices

- iOS: Press `i` in the terminal or click "Run on iOS simulator" in Expo Dev Tools
- Android: Press `a` in the terminal or click "Run on Android device/emulator" in Expo Dev Tools

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