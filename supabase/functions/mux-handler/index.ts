/// <reference types="https://deno.land/x/deno@v1.40.4/lib.deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestData {
  action: string
  uploadId?: string
  assetId?: string
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, uploadId, assetId }: RequestData = await req.json()
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Mux credentials
    const muxTokenId = Deno.env.get('MUX_ACCESS_TOKEN_ID')!
    const muxSecretKey = Deno.env.get('MUX_SECRET_KEY')!
    const muxAuth = btoa(`${muxTokenId}:${muxSecretKey}`)

    switch (action) {
      case 'create_upload':
        // Create Mux upload with high quality settings
        const uploadRes = await fetch('https://api.mux.com/video/v1/uploads', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${muxAuth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            new_asset_settings: { 
              playback_policy: ['public'],
              // High quality settings
              mp4_support: 'standard',
              hls_manifests: {
                master: {
                  name: 'master',
                  max_resolution_tier: '1080p',
                  max_frame_rate: 60
                }
              }
            },
            cors_origin: '*',
          })
        })
        
        if (!uploadRes.ok) {
          throw new Error(`Mux upload creation failed: ${uploadRes.status}`)
        }
        
        const uploadData = await uploadRes.json()
        return new Response(
          JSON.stringify({ 
            url: uploadData.data.url, 
            uploadId: uploadData.data.id 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_asset_id':
        // Get asset ID from upload
        const assetRes = await fetch(`https://api.mux.com/video/v1/uploads/${uploadId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${muxAuth}`,
            'Content-Type': 'application/json',
          }
        })
        
        if (!assetRes.ok) {
          throw new Error(`Mux upload fetch failed: ${assetRes.status}`)
        }
        
        const assetData = await assetRes.json()
        return new Response(
          JSON.stringify({ 
            assetId: assetData.data.asset_id,
            uploadStatus: assetData.data.status
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'poll_asset':
        // Poll asset for playback ID
        const pollRes = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${muxAuth}`,
            'Content-Type': 'application/json',
          }
        })
        
        if (!pollRes.ok) {
          throw new Error(`Mux asset fetch failed: ${pollRes.status}`)
        }
        
        const pollData = await pollRes.json()
        const asset = pollData.data
        
        if (asset.status === 'ready' && asset.playback_ids?.length > 0) {
          const playbackId = asset.playback_ids[0].id
          const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`
          
          // Update car in database
          const { data: cars, error: selectError } = await supabase
            .from('cars')
            .select('id, videos')
            .contains('asset_ids', [assetId])
            .limit(1)
          
          if (!selectError && cars && cars.length > 0) {
            const carId = cars[0].id
            let videos = cars[0].videos || []
            if (!videos.includes(playbackId)) {
              videos = [...videos, playbackId]
            }
            
            const { error: updateError } = await supabase
              .from('cars')
              .update({ 
                playback_id: playbackId, 
                thumbnail_url: thumbnailUrl, 
                videos 
              })
              .eq('id', carId)
            
            if (updateError) {
              console.error('Database update error:', updateError)
            }
          }
          
          return new Response(
            JSON.stringify({ 
              status: 'ready',
              playbackId,
              assetId: asset.id
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          return new Response(
            JSON.stringify({ 
              status: asset.status || 'unknown',
              processing: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'webhook':
        // Handle Mux webhook
        const event = await req.json()
        console.log('Mux webhook received:', event.type)
        
        if (event.type === 'video.asset.ready') {
          const playbackId = event.data.playback_ids?.[0]?.id
          const assetId = event.data.id
          const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`
          
          // Update car in database
          const { data: cars, error: selectError } = await supabase
            .from('cars')
            .select('id, videos')
            .contains('asset_ids', [assetId])
            .limit(1)
          
          if (!selectError && cars && cars.length > 0) {
            const carId = cars[0].id
            let videos = cars[0].videos || []
            if (!videos.includes(playbackId)) {
              videos = [...videos, playbackId]
            }
            
            const { error: updateError } = await supabase
              .from('cars')
              .update({ 
                playback_id: playbackId, 
                thumbnail_url: thumbnailUrl, 
                videos 
              })
              .eq('id', carId)
            
            if (updateError) {
              console.error('Database update error:', updateError)
            } else {
              console.log('Car updated successfully:', carId)
            }
          }
        }
        
        return new Response(
          JSON.stringify({ received: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 