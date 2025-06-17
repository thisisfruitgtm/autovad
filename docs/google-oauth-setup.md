# Configurare Google OAuth pentru Autovad

## Pași pentru configurarea Google Sign-In

### 1. Google Cloud Console Setup

1. Mergi la [Google Cloud Console](https://console.cloud.google.com/)
2. Creează un proiect nou sau selectează unul existent
3. Activează Google+ API și Google Sign-In API
4. Mergi la "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"

### 2. Configurare pentru iOS

1. Selectează "iOS" ca tip de aplicație
2. Bundle ID: `com.Autovad.app`
3. Descarcă fișierul `GoogleService-Info.plist`
4. Plasează fișierul în root-ul proiectului

### 3. Configurare pentru Android

1. Selectează "Android" ca tip de aplicație
2. Package name: `com.Autovad.app`
3. SHA-1 certificate fingerprint (pentru development):
   ```bash
   keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android
   ```
4. Descarcă fișierul `google-services.json`
5. Plasează fișierul în root-ul proiectului

### 4. Configurare Web Client

1. Selectează "Web application" ca tip
2. Authorized JavaScript origins: `http://localhost:8081`
3. Authorized redirect URIs: `http://localhost:8081`
4. Copiază Client ID-ul web

### 5. Actualizare app.json

Înlocuiește `YOUR_GOOGLE_CLIENT_ID` în `app.json` cu Client ID-ul web:

```json
{
  "expo": {
    "extra": {
      "googleClientId": "YOUR_WEB_CLIENT_ID_HERE"
    }
  }
}
```

### 6. Configurare Supabase

1. Mergi la Supabase Dashboard → Authentication → Providers
2. Activează Google provider
3. Adaugă Client ID și Client Secret din Google Console
4. Redirect URL: `https://mktfybjfxzhvpmnepshq.supabase.co/auth/v1/callback`

### 7. Test

După configurare, butonul "Continuă cu Google" va funcționa în aplicație.

## Troubleshooting

- Verifică că Bundle ID/Package name sunt identice în toate locurile
- Asigură-te că API-urile sunt activate în Google Console
- Verifică că fișierele de configurare sunt în locația corectă
- Pentru iOS Simulator, folosește un device real pentru testare completă 