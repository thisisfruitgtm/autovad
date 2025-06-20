import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react-native';
import { mediaOptimizer } from '@/lib/mediaOptimization';
import { useLazyMedia, useLazyVideo } from '@/hooks/useLazyMedia';

const { width, height } = Dimensions.get('window');

interface VideoCarouselProps {
  videos: string[];
  images?: string[];
  isVisible?: boolean;
}

export function VideoCarousel({ videos, images = [], isVisible = true }: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  // Lazy load media for reduced egress costs
  const { media: optimizedImages, isLoading: imagesLoading } = useLazyMedia(images, isVisible);
  const { videos: optimizedVideos, isLoading: videosLoading } = useLazyVideo(videos, isVisible);
  
  const allMedia = [...optimizedVideos.map(v => v.url), ...optimizedImages];
  const isCurrentVideo = currentIndex < optimizedVideos.length;
  const currentVideoUrl = isCurrentVideo ? allMedia[currentIndex] : null;
  const currentVideoPoster = isCurrentVideo ? optimizedVideos[currentIndex]?.poster : null;
  
  // Create video player with optimized poster
  const player = useVideoPlayer(currentVideoUrl || '', (player) => {
    if (currentVideoUrl && isVisible) {
      player.loop = true;
      player.muted = isMuted;
      // Auto-play when video loads - completely synchronous
      player.play();
    }
  });

  // Preload and pre-play next/previous videos for instant switching
  const nextIndex = currentIndex < allMedia.length - 1 ? currentIndex + 1 : 0;
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : allMedia.length - 1;
  
  const nextVideoUrl = nextIndex < optimizedVideos.length ? allMedia[nextIndex] : null;
  const prevVideoUrl = prevIndex < optimizedVideos.length ? allMedia[prevIndex] : null;
  
  const nextPlayer = useVideoPlayer(nextVideoUrl || '', (player) => {
    if (nextVideoUrl) {
      player.loop = true;
      player.muted = false;
      // Start playing in background for instant switching
      player.play();
    }
  });

  const prevPlayer = useVideoPlayer(prevVideoUrl || '', (player) => {
    if (prevVideoUrl) {
      player.loop = true;
      player.muted = false;
      // Start playing in background for instant switching  
      player.play();
    }
  });

  // Auto-play when video changes or visibility changes
  useEffect(() => {
    if (player && isCurrentVideo && currentVideoUrl && isVisible) {
      // Completely synchronous play - no delays
      try {
        player.muted = isMuted;
        player.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Error starting video:', error);
      }
    } else if (player && ((!isCurrentVideo) || !isVisible)) {
      try {
        player.pause();
        if (!isVisible) {
          player.muted = true; // Mute when not visible to stop all audio
        }
        setIsPlaying(false);
      } catch (error) {
        console.log('Error pausing video:', error);
      }
    }

    // Also pause/play background preloaded videos based on visibility
    if (!isVisible) {
      try {
        if (nextPlayer) {
          nextPlayer.pause();
          nextPlayer.muted = true; // Mute when not visible
        }
        if (prevPlayer) {
          prevPlayer.pause();
          prevPlayer.muted = true; // Mute when not visible
        }
      } catch (error) {
        console.log('Error pausing background videos:', error);
      }
    } else {
      // Only resume background videos if we're visible and on main video
      if (isCurrentVideo) {
        try {
          if (nextPlayer) {
            nextPlayer.muted = false; // Unmute when visible
            nextPlayer.play();
          }
          if (prevPlayer) {
            prevPlayer.muted = false; // Unmute when visible
            prevPlayer.play();
          }
        } catch (error) {
          console.log('Error resuming background videos:', error);
        }
      }
    }
  }, [currentIndex, currentVideoUrl, isCurrentVideo, player, isVisible, nextPlayer, prevPlayer]);

  // Update mute state
  useEffect(() => {
    if (player && isCurrentVideo) {
      try {
        player.muted = isMuted;
      } catch (error) {
        console.log('Error setting mute state:', error);
      }
    }
  }, [isMuted, player, isCurrentVideo]);

  const togglePlayPause = () => {
    if (!player || !isCurrentVideo) return;
    
    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.log('Error toggling play/pause:', error);
    }
  };

  const toggleMute = () => {
    if (!player || !isCurrentVideo) return;
    
    try {
      const newMutedState = !isMuted;
      player.muted = newMutedState;
      setIsMuted(newMutedState);
    } catch (error) {
      console.log('Error toggling mute:', error);
    }
  };

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : allMedia.length - 1;
    
    // Update all states simultaneously for maximum speed
    setCurrentIndex(newIndex);
    if (newIndex < optimizedVideos.length) {
      setIsMuted(false);
      setIsPlaying(true);
    }
  };

  const goToNext = () => {
    const newIndex = currentIndex < allMedia.length - 1 ? currentIndex + 1 : 0;
    
    // Update all states simultaneously for maximum speed
    setCurrentIndex(newIndex);
    if (newIndex < optimizedVideos.length) {
      setIsMuted(false);
      setIsPlaying(true);
    }
  };

  const handleDotPress = (index: number) => {
    // Update all states simultaneously for maximum speed
    setCurrentIndex(index);
    if (index < optimizedVideos.length) {
      setIsMuted(false);
      setIsPlaying(true);
    }
  };

  return (
    <View style={styles.container} testID="video-carousel">
      <View
        key={currentIndex}
        style={styles.mediaContainer}
      >
        {isCurrentVideo && currentVideoUrl ? (
          <VideoView
            player={player}
            style={styles.video}
            contentFit="cover"
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            showsTimecodes={false}
            requiresLinearPlayback={false}
            nativeControls={false}
          />
        ) : (
          <Image
            source={{ uri: allMedia[currentIndex] }}
            style={styles.image}
            testID="carousel-image"
          />
        )}
      </View>

      {/* Video Controls */}
      {isCurrentVideo && currentVideoUrl && (
        <View style={styles.videoControls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={togglePlayPause}
            testID="play-pause-button"
          >
            {isPlaying ? (
              <Pause size={24} color="#fff" fill="#fff" />
            ) : (
              <Play size={24} color="#fff" fill="#fff" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={toggleMute}
            testID="mute-button"
          >
            {isMuted ? (
              <VolumeX size={24} color="#fff" />
            ) : (
              <Volume2 size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Navigation Arrows */}
      {allMedia.length > 1 && (
        <>
          <TouchableOpacity 
            style={styles.leftArrow} 
            onPress={goToPrevious}
            testID="left-arrow"
          >
            <ChevronLeft size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rightArrow} 
            onPress={goToNext}
            testID="right-arrow"
          >
            <ChevronRight size={32} color="#fff" />
          </TouchableOpacity>
        </>
      )}

      {/* Pagination Dots */}
      {allMedia.length > 1 && (
        <View style={styles.pagination} testID="pagination">
          {allMedia.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                { 
                  backgroundColor: index === currentIndex ? '#F97316' : 'rgba(255, 255, 255, 0.5)',
                  width: index < optimizedVideos.length ? 8 : 6,
                  height: index < optimizedVideos.length ? 8 : 6,
                }
              ]}
              onPress={() => handleDotPress(index)}
              testID={`pagination-dot-${index}`}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mediaContainer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    alignSelf: 'stretch',
  },
  videoControls: {
    position: 'absolute',
    top: 60,
    right: 16,
    flexDirection: 'column',
    gap: 12,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftArrow: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -16 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  rightArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -16 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  pagination: {
    position: 'absolute',
    bottom: 300,
    left: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 3,
    marginHorizontal: 2,
  },
});