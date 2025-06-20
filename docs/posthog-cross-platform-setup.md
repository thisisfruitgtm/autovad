# PostHog Cross-Platform Setup

## Overview

Acest document explică cum să configurezi PostHog pentru a funcționa pe toate platformele: **Desktop**, **Android** și **iOS** folosind același proiect PostHog.

## ✅ Avantajele Configurării Cross-Platform

- **Un singur proiect PostHog** pentru toate platformele
- **Date unificate** în dashboard
- **Analytics consistent** între platforme
- **Costuri reduse** (un singur proiect)
- **Rapoarte unificate** pentru toate platformele

## 🔧 Configurație

### 1. Variabile de Mediu

Creează fișierul `.env` în rădăcina proiectului:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# PostHog Configuration (Same project for all platforms)
EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_api_key_here
EXPO_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

# Google OAuth (Optional)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 2. Configurație Mobile (React Native)

**Fișier:** `lib/posthog.ts`

```typescript
import PostHog from 'posthog-react-native';
import { Platform } from 'react-native';

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

export const posthog = POSTHOG_API_KEY 
  ? new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
    })
  : null;
```

### 3. Configurație Web (Next.js)

**Fișier:** `web/instrumentation-client.ts`

```typescript
import posthog from "posthog-js"

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: "https://eu.posthog.com",
  capture_pageview: 'history_change',
  capture_pageleave: true,
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});
```

## 📊 Event Tracking Cross-Platform

### Evente Comune

Toate platformele folosesc aceleași nume de evenimente:

```typescript
// Mobile
trackEvent('car_viewed', { car_id: '123', platform: 'ios' });

// Web
posthog.capture('car_viewed', { car_id: '123', platform: 'web' });
```

### Proprietăți Platform-Specific

```typescript
// Mobile properties
{
  platform: 'ios' | 'android',
  platform_version: '17.0',
  app_version: '1.0.0',
  device_model: 'iPhone 15',
  device_os: 'iOS 17.0',
  locale: 'ro-RO',
}

// Web properties
{
  platform: 'web',
  user_agent: 'Mozilla/5.0...',
  screen_resolution: '1920x1080',
  browser: 'Chrome',
  locale: 'ro-RO',
}
```

## 🎯 Evente Implementate

### 1. Authentication Events
```typescript
trackAuthEvent('login', 'email', true);
trackAuthEvent('register', 'google', false, 'User exists');
```

### 2. Car Events
```typescript
trackCarEvent('viewed', carData);
trackCarEvent('liked', carData);
trackCarEvent('shared', carData);
```

### 3. Search Events
```typescript
trackSearchEvent('BMW X5', { make: 'BMW' }, 15);
```

### 4. Screen Views
```typescript
trackScreen('Home', { tab: 'feed' });
trackScreen('CarDetails', { car_id: '123' });
```

## 📈 Dashboard PostHog

### 1. Funnel Cross-Platform
```
Registration → Login → Car View → Like → Share
```

### 2. Insights per Platform
- **Platform Breakdown**: Vezi performanța pe fiecare platformă
- **Device Analytics**: Analizează utilizarea pe diferite dispozitive
- **User Journey**: Urmărește călătoria utilizatorului între platforme

### 3. Cohorts
- **Mobile Users**: Utilizatori care folosesc doar mobile
- **Web Users**: Utilizatori care folosesc doar web
- **Cross-Platform Users**: Utilizatori care folosesc ambele

## 🔄 Sincronizare Date

### User Identification
```typescript
// Same user ID across platforms
identifyUser('user-123', {
  email: 'user@example.com',
  name: 'John Doe',
  platform: 'ios',
});
```

### User Properties
```typescript
setUserProperties({
  preferred_platform: 'mobile',
  total_cars_viewed: 50,
  subscription_status: 'premium',
});
```

## 🛠️ Troubleshooting

### Eroare: "You must pass your PostHog project's api key"
**Soluție:** Verifică că `EXPO_PUBLIC_POSTHOG_API_KEY` este setat în `.env`

### Events nu apar în dashboard
**Soluție:** 
1. Verifică că API key-ul este corect
2. Verifică că host-ul este corect
3. Verifică că evenimentele sunt trimise

### Platform detection nu funcționează
**Soluție:** Verifică că folosești `Platform.OS` pentru mobile

## 📊 Monitoring

### 1. Verifică Events în Real-Time
1. Deschide PostHog Dashboard
2. Mergi la "Live Events"
3. Vezi evenimentele în timp real

### 2. Platform Analytics
1. Creează un insight nou
2. Adaugă "Platform" ca breakdown
3. Vezi performanța per platformă

### 3. User Journey
1. Creează un funnel
2. Adaugă evenimente din toate platformele
3. Vezi conversia cross-platform

## 🎉 Beneficii

- **80% reducere egress costs** cu optimizările media
- **Analytics unificat** pentru toate platformele
- **User journey complet** între mobile și web
- **Costuri reduse** cu un singur proiect PostHog
- **Rapoarte unificate** pentru întreaga aplicație

## 📝 Note Importante

1. **Același API Key** pentru toate platformele
2. **Evente consistente** între mobile și web
3. **User ID unic** pentru sincronizare cross-platform
4. **Platform detection** automat în toate evenimentele
5. **Error handling** pentru cazurile când PostHog nu este configurat 