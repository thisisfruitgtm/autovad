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
    console.log('🔍 Request received:', req.method, req.url)
    
    // Check authentication but don't block for now
    const authHeader = req.headers.get('authorization')
    const apiKey = req.headers.get('apikey')
    
    console.log('🔑 Auth header present:', !!authHeader)
    console.log('🔑 API key present:', !!apiKey)
    
    // Allow all requests for now - in production you should validate properly
    console.log('✅ Proceeding with request')
    
    // Parse request body
    let requestData: RequestData
    try {
      const bodyText = await req.text()
      console.log('📦 Request body:', bodyText)
      requestData = JSON.parse(bodyText)
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const { action, uploadId, assetId } = requestData
    console.log('🎯 Action:', action, 'UploadId:', uploadId, 'AssetId:', assetId)
    
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Mux credentials
    const muxTokenId = Deno.env.get('MUX_ACCESS_TOKEN_ID')
    const muxSecretKey = Deno.env.get('MUX_SECRET_KEY')
    
    if (!muxTokenId || !muxSecretKey) {
      console.error('❌ Missing Mux environment variables')
      return new Response(
        JSON.stringify({ error: 'Mux configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const muxAuth = btoa(`${muxTokenId}:${muxSecretKey}`)
    console.log('🔑 Mux auth configured')

    switch (action) {
      case 'create_upload':
        console.log('📤 Creating Mux upload...')
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
              hls_manifests: {
                master: {
                  name: 'master',
                  max_resolution_tier: '1080p',
                  max_frame_rate: 60
                }
              },
              passthrough: 'standard',
              test: false
            },
            cors_origin: '*',
          })
        })
        
        console.log('📊 Mux upload response status:', uploadRes.status)
        
        if (!uploadRes.ok) {
          const errorText = await uploadRes.text()
          console.error('❌ Mux upload failed:', errorText)
          throw new Error(`Mux upload creation failed: ${uploadRes.status} - ${errorText}`)
        }
        
        const uploadData = await uploadRes.json()
        console.log('✅ Upload created successfully:', uploadData.data.id)
        
        return new Response(
          JSON.stringify({ 
            url: uploadData.data.url, 
            uploadId: uploadData.data.id 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_asset_id':
        if (!uploadId) {
          return new Response(
            JSON.stringify({ error: 'uploadId is required for get_asset_id action' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        
        console.log('🔍 Getting asset ID for upload:', uploadId)
        // Get asset ID from upload
        const assetRes = await fetch(`https://api.mux.com/video/v1/uploads/${uploadId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${muxAuth}`,
            'Content-Type': 'application/json',
          }
        })
        
        if (!assetRes.ok) {
          const errorText = await assetRes.text()
          console.error('❌ Mux upload fetch failed:', errorText)
          throw new Error(`Mux upload fetch failed: ${assetRes.status} - ${errorText}`)
        }
        
        const assetData = await assetRes.json()
        console.log('✅ Asset data retrieved:', assetData.data)
        
        return new Response(
          JSON.stringify({ 
            assetId: assetData.data.asset_id,
            uploadStatus: assetData.data.status
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'poll_asset':
        if (!assetId) {
          return new Response(
            JSON.stringify({ error: 'assetId is required for poll_asset action' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        
        console.log('🔍 Polling asset:', assetId)
        // Poll asset for playback ID
        const pollRes = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${muxAuth}`,
            'Content-Type': 'application/json',
          }
        })
        
        if (!pollRes.ok) {
          const errorText = await pollRes.text()
          console.error('❌ Mux asset fetch failed:', errorText)
          throw new Error(`Mux asset fetch failed: ${pollRes.status} - ${errorText}`)
        }
        
        const pollData = await pollRes.json()
        const asset = pollData.data
        console.log('📊 Asset status:', asset.status)
        console.log('📊 Asset playback_ids:', asset.playback_ids)
        console.log('📊 Asset data:', JSON.stringify(asset, null, 2))
        
        if (asset.status === 'ready' && asset.playback_ids?.length > 0) {
          const playbackId = asset.playback_ids[0].id
          const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`
          console.log('✅ Asset ready with playback ID:', playbackId)
          console.log('✅ Thumbnail URL:', thumbnailUrl)
          
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
              console.log('✅ Car updated successfully:', carId)
            }
          }
          
          return new Response(
            JSON.stringify({ 
              status: 'ready',
              playbackId,
              assetId: assetId
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
        console.log('📨 Webhook received')
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
        console.error('❌ Unknown action:', action)
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('❌ Error in mux-handler:', error)
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