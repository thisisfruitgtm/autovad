# Supabase Edge Function for Mux Integration

## Overview

We've migrated from Vercel API routes to a Supabase Edge Function (`mux-handler`) to handle all Mux-related operations. This provides better performance, lower latency, and independence from external hosting.

## Function Endpoint

The function is deployed at: `https://mktfybjfxzhvpmnepshq.supabase.co/functions/v1/mux-handler`

## Available Actions

### 1. Create Upload (`action: 'create_upload'`)
Creates a new Mux upload URL.

**Request:**
```json
{
  "action": "create_upload"
}
```

**Response:**
```json
{
  "url": "https://upload.mux.com/...",
  "uploadId": "upload_id_here"
}
```

### 2. Get Asset ID (`action: 'get_asset_id'`)
Retrieves the asset ID from an upload ID.

**Request:**
```json
{
  "action": "get_asset_id",
  "uploadId": "upload_id_here"
}
```

**Response:**
```json
{
  "assetId": "asset_id_here",
  "uploadStatus": "asset_created"
}
```

### 3. Poll Asset (`action: 'poll_asset'`)
Polls an asset for processing status and playback ID.

**Request:**
```json
{
  "action": "poll_asset",
  "assetId": "asset_id_here"
}
```

**Response (processing):**
```json
{
  "status": "preparing",
  "processing": true
}
```

**Response (ready):**
```json
{
  "status": "ready",
  "playbackId": "playback_id_here",
  "assetId": "asset_id_here"
}
```

### 4. Webhook Handler (`action: 'webhook'`)
Handles Mux webhook events.

**Request:** Mux webhook payload
**Response:**
```json
{
  "received": true
}
```

## Environment Variables Required

The function requires these environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for database access
- `MUX_ACCESS_TOKEN_ID`: Mux access token ID
- `MUX_SECRET_KEY`: Mux secret key

## Client Integration

### React Native (Expo)
```typescript
import { CarService } from '@/services/carService'

// Upload video
const { uploadId, url } = await CarService.uploadVideo(file)

// Get asset ID
const { assetId } = await CarService.getAssetId(uploadId)

// Poll for playback ID
const { playbackId } = await CarService.pollAsset(assetId)
```

### Web (Next.js)
```typescript
import { uploadVideo, getAssetId, pollAsset } from '@/services/carService'

// Upload video
const { uploadId, url } = await uploadVideo(file)

// Get asset ID
const { assetId } = await getAssetId(uploadId)

// Poll for playback ID
const { playbackId } = await pollAsset(assetId)
```

## Webhook Configuration

Update your Mux webhook URL to:
```
https://mktfybjfxzhvpmnepshq.supabase.co/functions/v1/mux-handler
```

The webhook will automatically update cars in the database when videos are ready.

## Benefits

1. **Lower Latency**: Edge functions run closer to users
2. **Better Performance**: No cold starts like serverless functions
3. **Cost Effective**: Included in Supabase pricing
4. **Simplified Architecture**: Single endpoint for all Mux operations
5. **Automatic Database Updates**: Webhook directly updates car records

## Deployment

To deploy updates:
```bash
cd supabase
npx supabase functions deploy mux-handler
```

## Monitoring

View function logs in the Supabase Dashboard:
https://supabase.com/dashboard/project/mktfybjfxzhvpmnepshq/functions 