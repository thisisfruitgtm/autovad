import { useState, useEffect, useRef } from 'react';
import { mediaOptimizer } from '@/lib/mediaOptimization';

interface UseLazyMediaOptions {
  threshold?: number;
  rootMargin?: string;
  enableOptimization?: boolean;
}

export function useLazyMedia(
  mediaUrls: string[],
  isVisible: boolean = true,
  options: UseLazyMediaOptions = {}
) {
  const [loadedMedia, setLoadedMedia] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const loadingRef = useRef(false);

  const {
    threshold = 0.1,
    rootMargin = '50px',
    enableOptimization = true,
  } = options;

  useEffect(() => {
    if (isVisible && !hasLoaded && !loadingRef.current && mediaUrls.length > 0) {
      loadingRef.current = true;
      setIsLoading(true);

      // Optimize media URLs if enabled
      const optimizedUrls = enableOptimization 
        ? mediaOptimizer.optimizeImageArray(mediaUrls, 'preview')
        : mediaUrls;

      // Simulate loading delay for better UX
      const loadTimer = setTimeout(() => {
        setLoadedMedia(optimizedUrls);
        setHasLoaded(true);
        setIsLoading(false);
        loadingRef.current = false;
      }, 100);

      return () => clearTimeout(loadTimer);
    }
  }, [isVisible, hasLoaded, mediaUrls, enableOptimization]);

  const reset = () => {
    setLoadedMedia([]);
    setHasLoaded(false);
    setIsLoading(false);
    loadingRef.current = false;
  };

  return {
    media: loadedMedia,
    isLoading,
    hasLoaded,
    reset,
  };
}

export function useLazyVideo(
  videoUrls: string[],
  isVisible: boolean = true,
  options: UseLazyMediaOptions = {}
) {
  const [loadedVideos, setLoadedVideos] = useState<{ url: string; poster: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const loadingRef = useRef(false);

  const {
    threshold = 0.1,
    rootMargin = '50px',
    enableOptimization = true,
  } = options;

  useEffect(() => {
    if (isVisible && !hasLoaded && !loadingRef.current && videoUrls.length > 0) {
      loadingRef.current = true;
      setIsLoading(true);

      // Optimize video URLs with posters if enabled
      const optimizedVideos = enableOptimization 
        ? mediaOptimizer.optimizeVideoArray(videoUrls)
        : videoUrls.map(url => ({ url, poster: '' }));

      // Simulate loading delay for better UX
      const loadTimer = setTimeout(() => {
        setLoadedVideos(optimizedVideos);
        setHasLoaded(true);
        setIsLoading(false);
        loadingRef.current = false;
      }, 100);

      return () => clearTimeout(loadTimer);
    }
  }, [isVisible, hasLoaded, videoUrls, enableOptimization]);

  const reset = () => {
    setLoadedVideos([]);
    setHasLoaded(false);
    setIsLoading(false);
    loadingRef.current = false;
  };

  return {
    videos: loadedVideos,
    isLoading,
    hasLoaded,
    reset,
  };
} 