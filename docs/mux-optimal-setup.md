# Optimal Mux Setup for Video Selling App

## Overview

This guide provides the optimal Mux configuration for a video selling app that requires high-quality video streaming with excellent user experience.

## 🎯 **Recommended Mux Configuration**

### **1. Asset Settings (High Quality)**

```json
{
  "new_asset_settings": {
    "playback_policy": ["public"],
    "mp4_support": "standard",
    "hls_manifests": {
      "master": {
        "name": "master",
        "max_resolution_tier": "1080p",
        "max_frame_rate": 60
      }
    },
    "passthrough": "standard",
    "test": false
  }
}
```

### **2. Upload Settings**

```json
{
  "cors_origin": "*",
  "new_asset_settings": {
    "playback_policy": ["public"],
    "mp4_support": "standard",
    "hls_manifests": {
      "master": {
        "name": "master", 
        "max_resolution_tier": "1080p",
        "max_frame_rate": 60
      }
    }
  }
}
```

## 📹 **Quality Tiers**

### **Recommended Quality Settings**

| Quality | Resolution | Bitrate | Use Case |
|---------|------------|---------|----------|
| **1080p** | 1920x1080 | 8-12 Mbps | Premium car showcases |
| **720p** | 1280x720 | 4-6 Mbps | Standard listings |
| **480p** | 854x480 | 1.5-2.5 Mbps | Mobile optimization |
| **360p** | 640x360 | 800k-1.2 Mbps | Slow connections |

### **Adaptive Bitrate Streaming**

Mux automatically creates multiple quality tiers:
- **Master playlist** with all quality levels
- **Automatic quality switching** based on connection
- **Optimal viewing experience** on all devices

## 🔧 **Technical Configuration**

### **1. Video Codec Settings**

```typescript
// Optimal codec configuration
const videoSettings = {
  codec: 'h264',           // Widely supported
  profile: 'high',         // Better quality
  level: '4.1',           // 1080p support
  bitrate: 8000000,       // 8 Mbps for 1080p
  framerate: 30,          // Standard framerate
  keyframe_interval: 2    // 2 seconds
};
```

### **2. Audio Settings**

```typescript
const audioSettings = {
  codec: 'aac',           // High quality audio
  bitrate: 128000,        // 128 kbps
  channels: 2,            // Stereo
  sample_rate: 48000      // 48 kHz
};
```

## 🚀 **Performance Optimizations**

### **1. Preloading Strategy**

```typescript
// Preload next video for smooth transitions
const preloadSettings = {
  preload: 'metadata',    // Load metadata only
  poster: true,          // Show thumbnail while loading
  autoplay: false,       // Don't autoplay until user interaction
  muted: true           // Muted for autoplay compliance
};
```

### **2. Caching Strategy**

```typescript
// Cache headers for optimal performance
const cacheHeaders = {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
  'CDN-Cache-Control': 'public, max-age=3600'
};
```

## 📱 **Mobile Optimization**

### **1. Responsive Video Player**

```typescript
// Adaptive video player settings
const mobileSettings = {
  maxWidth: '100%',
  aspectRatio: '9/16',    // Vertical video format
  objectFit: 'cover',     // Maintain aspect ratio
  preload: 'metadata'     // Optimize for mobile data
};
```

### **2. Quality Selection**

```typescript
// Quality selection based on device
const qualitySelection = {
  mobile: ['360p', '480p', '720p'],
  tablet: ['480p', '720p', '1080p'],
  desktop: ['720p', '1080p']
};
```

## 💰 **Cost Optimization**

### **1. Storage Optimization**

- **Use HLS streaming** instead of direct MP4 downloads
- **Implement lazy loading** for video thumbnails
- **Cache video metadata** to reduce API calls

### **2. Bandwidth Optimization**

- **Adaptive bitrate streaming** reduces bandwidth usage
- **Quality selection** based on user preference
- **Preload only metadata** for video lists

## 🔒 **Security Settings**

### **1. Playback Policy**

```typescript
const securitySettings = {
  playback_policy: ['public'],  // Public access for car listings
  // For premium content, use signed URLs:
  // playback_policy: ['signed']
};
```

### **2. Signed URLs (Optional)**

```typescript
// For premium content protection
const signedUrlSettings = {
  playback_policy: ['signed'],
  signing_key_id: 'your-signing-key',
  expires_in: 3600  // 1 hour expiration
};
```

## 📊 **Analytics & Monitoring**

### **1. Video Analytics**

```typescript
// Track video performance
const analyticsEvents = [
  'video_start',
  'video_progress_25',
  'video_progress_50', 
  'video_progress_75',
  'video_complete',
  'video_error'
];
```

### **2. Quality Metrics**

- **Average bitrate** delivered
- **Quality switches** per session
- **Buffer events** and duration
- **Error rates** by quality level

## 🎨 **User Experience**

### **1. Loading States**

```typescript
// Progressive loading experience
const loadingStates = {
  thumbnail: 'immediate',     // Show thumbnail instantly
  metadata: 'preload',        // Load video info
  video: 'on-demand'          // Load video on play
};
```

### **2. Quality Controls**

```typescript
// User quality selection
const qualityControls = {
  auto: 'adaptive',           // Automatic quality
  manual: ['360p', '480p', '720p', '1080p'],
  default: '720p'            // Default quality
};
```

## 🔧 **Implementation in Supabase Function**

```typescript
// Updated mux-handler function
const createUpload = async () => {
  const response = await fetch('https://api.mux.com/video/v1/uploads', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${muxAuth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      new_asset_settings: {
        playback_policy: ['public'],
        mp4_support: 'standard',
        hls_manifests: {
          master: {
            name: 'master',
            max_resolution_tier: '1080p',
            max_frame_rate: 60
          }
        },
        passthrough: 'standard'
      },
      cors_origin: '*',
    })
  });
};
```

## 📈 **Expected Results**

### **Quality Metrics**
- **1080p support** for premium content
- **Adaptive streaming** for all connection types
- **Fast startup** times (< 2 seconds)
- **Smooth playback** with minimal buffering

### **Performance Metrics**
- **95%+ uptime** for video delivery
- **< 500ms** video start time
- **< 1%** error rate
- **Optimized bandwidth** usage

## 🚀 **Next Steps**

1. **Deploy updated Supabase function** with optimal settings
2. **Test video quality** across different devices
3. **Monitor performance** metrics
4. **Implement quality selection** UI
5. **Add analytics tracking** for video engagement

This setup provides the best balance of quality, performance, and cost for a video selling app! 