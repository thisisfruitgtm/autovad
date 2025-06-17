# Google OAuth Setup Guide pentru AutoVad

## 1. URL-uri de Redirect pentru Supabase Dashboard

În [Supabase Dashboard > Auth > URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration), adaugă:

### Site URL:
```
https://autovad.app
```

### Redirect URLs:
```
# Development (Expo Go - Fixed URL)
exp://localhost/--/auth/callback

# Production (Custom Scheme)
autovad://auth/callback

# Production (Web - if needed)  
https://autovad.app/auth/callback
https://autovad.app/**
```

## 2. Google Cloud Console Configuration

În [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

### Authorized redirect URIs:
```
# Supabase Auth Callback
https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback

# Pentru testare (dacă este necesar)
http://localhost:8082
exp://localhost:8082
```

## 3. Testare în Development

1. Rulează `npx expo start`
2. URL-ul de redirect va fi fix: `exp://localhost/--/auth/callback`
3. Nu mai depinde de IP sau port - același URL mereu!

## 4. Environment Variables

În `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

## 5. Debugging

Pentru debugging, verifică în console:
- URL-ul de redirect generat
- Response-ul de la Supabase
- Parametrii din callback URL

## 6. Note Importante

- Pentru Expo Go în development, se folosește scheme-ul universal `exp://auth/callback`
- Pentru build-uri native, se folosește scheme-ul custom `autovad://auth/callback`
- Nu mai este nevoie de configurări specifice de IP sau port
- URL-urile trebuie să fie exact identice în Supabase și aplicație
- Scheme-ul `exp://` funcționează universal cu orice Expo Go client 