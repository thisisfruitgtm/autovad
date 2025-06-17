# Rezolvare Probleme CORS în Supabase pentru React Native

## Problema
React Native iOS Simulator nu poate accesa Supabase din cauza restricțiilor CORS.

## Soluții

### 1. Configurare în Supabase Dashboard

1. Mergi la **Supabase Dashboard** → **Settings** → **API**
2. În secțiunea **CORS Origins**, adaugă:
   ```
   http://localhost:8081
   http://localhost:19006
   exp://localhost:19000
   exp://192.168.0.197:8081
   ```

### 2. Configurare pentru Development

În **Authentication** → **URL Configuration**:
- **Site URL**: `http://localhost:8081`
- **Redirect URLs**: 
  ```
  http://localhost:8081
  exp://localhost:19000
  ```

### 3. Verificare Network Settings

Pentru iOS Simulator, verifică că:
- Simulator-ul poate accesa internetul
- Nu există firewall care blochează conexiunile
- Network-ul permite conexiuni externe

### 4. Alternative pentru Development

Dacă CORS nu funcționează, folosește:
- Expo Go app pe device fizic
- Android Emulator (mai puține restricții CORS)
- Web version pentru testare

## Testare

```bash
# Test direct API
curl -H "Origin: http://localhost:8081" \
     -H "apikey: YOUR_API_KEY" \
     "https://your-project.supabase.co/rest/v1/cars?limit=1"
``` 