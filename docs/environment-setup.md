# Environment Setup for Cross-Platform PostHog

## Overview

Acest ghid explică cum să configurezi variabilele de mediu pentru a folosi același proiect PostHog pe toate platformele.

## 🔧 Configurație

### 1. Mobile App (.env)

Creează fișierul `.env` în rădăcina proiectului mobile:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# PostHog Configuration (Same project for all platforms)
EXPO_PUBLIC_POSTHOG_API_KEY=phc_your_posthog_api_key_here
EXPO_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

# Google OAuth (Optional)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. Web App (.env.local)

Creează fișierul `.env.local` în directorul `web/`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# PostHog Configuration (Same project for all platforms)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_api_key_here

# Google OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🔑 Obținerea PostHog API Key

### 1. Accesează PostHog Dashboard
1. Mergi la [app.posthog.com](https://app.posthog.com)
2. Loghează-te în contul tău

### 2. Creează un Proiect Nou (dacă nu ai)
1. Click "New Project"
2. Alege "Start from scratch"
3. Denumește proiectul "AutoVad"

### 3. Obține API Key
1. Mergi la "Project Settings" (⚙️)
2. Click "Project API Keys"
3. Copiază "Project API Key" (începe cu `phc_`)

## 🌍 Configurație Cross-Platform

### Mobile (React Native)
```typescript
// lib/posthog.ts
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
```

### Web (Next.js)
```typescript
// web/instrumentation-client.ts
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: "https://eu.posthog.com",
  // ...
});
```

## ✅ Verificare Configurație

### 1. Test Mobile
```bash
# În terminal, în rădăcina proiectului
npx expo start
```

Verifică în console că nu mai apar erorile PostHog.

### 2. Test Web
```bash
# În terminal, în directorul web/
npm run dev
```

Verifică în browser console că PostHog se încarcă corect.

### 3. Test Dashboard
1. Deschide PostHog Dashboard
2. Mergi la "Live Events"
3. Interacționează cu aplicația
4. Vezi evenimentele în timp real

## 🚨 Troubleshooting

### Eroare: "You must pass your PostHog project's api key"
**Cauză:** API key-ul nu este setat sau este greșit

**Soluție:**
1. Verifică că fișierul `.env` există în rădăcina proiectului
2. Verifică că `EXPO_PUBLIC_POSTHOG_API_KEY` este setat
3. Verifică că API key-ul începe cu `phc_`
4. Restart aplicația după modificări

### Events nu apar în dashboard
**Cauză:** Configurația nu este corectă

**Soluție:**
1. Verifică că host-ul este corect (`https://eu.i.posthog.com`)
2. Verifică că API key-ul este valid
3. Verifică că nu ai firewall care blochează PostHog

### Platform detection nu funcționează
**Cauză:** Proprietățile platform nu sunt setate corect

**Soluție:**
1. Verifică că folosești `Platform.OS` în mobile
2. Verifică că proprietățile sunt trimise cu fiecare event

## 📊 Beneficii Cross-Platform

### 1. Date Unificate
- Toate evenimentele într-un singur dashboard
- User journey complet între platforme
- Analytics consistent

### 2. Costuri Reduse
- Un singur proiect PostHog
- Fără duplicare de date
- Management simplificat

### 3. Rapoarte Unificate
- Funnel cross-platform
- Cohorts unificate
- Insights pentru întreaga aplicație

## 🔄 Sincronizare User

### User ID Unic
```typescript
// Mobile
identifyUser('user-123', { email: 'user@example.com' });

// Web
posthog.identify('user-123', { email: 'user@example.com' });
```

### User Properties
```typescript
// Setează proprietăți care se sincronizează între platforme
setUserProperties({
  preferred_platform: 'mobile',
  total_cars_viewed: 50,
  subscription_status: 'premium',
});
```

## 📝 Note Importante

1. **Același API Key** pentru toate platformele
2. **Restart aplicația** după modificări în `.env`
3. **Verifică console** pentru erori PostHog
4. **Testează pe ambele platforme** înainte de deploy
5. **Monitorizează dashboard-ul** pentru a verifica că evenimentele apar

## 🎯 Următorii Pași

1. Configurează variabilele de mediu
2. Testează pe mobile și web
3. Verifică evenimentele în dashboard
4. Creează insights și funnels
5. Monitorizează performanța cross-platform 