# Mux Webhook Setup

## Update Webhook URL

The Mux webhook URL should be updated to point to the new Supabase Edge Function:

**New Webhook URL:**
```
https://mktfybjfxzhvpmnepshq.supabase.co/functions/v1/mux-handler
```

## Steps to Update

1. Go to your Mux Dashboard: https://dashboard.mux.com/
2. Navigate to Settings > Webhooks
3. Update the webhook URL to the new Supabase function URL
4. Save the changes

## Webhook Events

The webhook will handle these events:
- `video.asset.ready` - When a video is processed and ready for playback

## Function Response

The webhook will automatically:
1. Extract the playback ID from the Mux event
2. Find the corresponding car in the database using the asset ID
3. Update the car record with:
   - `playback_id`: The real Mux playback ID
   - `thumbnail_url`: Generated thumbnail URL
   - `videos`: Array containing the playback ID

## Testing

You can test the webhook by:
1. Uploading a video through the app
2. Checking the Supabase database for updated car records
3. Verifying that videos now load properly in the app

## Troubleshooting

If videos are still not loading:
1. Check the Supabase function logs
2. Verify the webhook URL is correct
3. Ensure environment variables are set in Supabase
4. Check that the asset ID is properly stored in the car record 