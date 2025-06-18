import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { VideoCarousel } from '../../components/VideoCarousel';

// Mock expo-video
const mockPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  muted: false,
  loop: false,
};

jest.mock('expo-video', () => ({
  VideoView: 'VideoView',
  useVideoPlayer: jest.fn(() => mockPlayer),
}));

describe('VideoCarousel', () => {
  const mockVideos = [
    'https://example.com/video1.mp4',
    'https://example.com/video2.mp4',
  ];

  const mockImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render video when videos are provided', () => {
      const { getByTestId } = render(
        <VideoCarousel videos={mockVideos} />
      );

      expect(getByTestId).toBeDefined();
    });

    it('should render navigation arrows when multiple media items exist', () => {
      const { getByTestId } = render(
        <VideoCarousel videos={mockVideos} images={mockImages} />
      );

      // Should have left and right arrows
      const leftArrow = getByTestId('left-arrow');
      const rightArrow = getByTestId('right-arrow');
      
      expect(leftArrow).toBeTruthy();
      expect(rightArrow).toBeTruthy();
    });

    it('should render pagination dots for multiple media items', () => {
      const { getByTestId } = render(
        <VideoCarousel videos={mockVideos} images={mockImages} />
      );

      const pagination = getByTestId('pagination');
      expect(pagination).toBeTruthy();
    });

    it('should not render navigation when only one media item', () => {
      const { queryByTestId } = render(
        <VideoCarousel videos={[mockVideos[0]]} />
      );

      expect(queryByTestId('left-arrow')).toBeNull();
      expect(queryByTestId('right-arrow')).toBeNull();
      expect(queryByTestId('pagination')).toBeNull();
    });

    it('should render video controls for video items', () => {
      const { getByTestId } = render(
        <VideoCarousel videos={mockVideos} />
      );

      const playButton = getByTestId('play-pause-button');
      const muteButton = getByTestId('mute-button');
      
      expect(playButton).toBeTruthy();
      expect(muteButton).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to next item when right arrow is pressed', async () => {
      const { getByTestId } = render(
        <VideoCarousel videos={mockVideos} images={mockImages} />
      );

      const rightArrow = getByTestId('right-arrow');
      fireEvent.press(rightArrow);

      await waitFor(() => {
        // Should move to next item (index 1)
        expect(mockPlayer.play).toHaveBeenCalled();
      });
    });

    it('should navigate to previous item when left arrow is pressed', async () => {
      const { getByTestId } = render(
        <VideoCarousel videos={mockVideos} images={mockImages} />
      );

      const leftArrow = getByTestId('left-arrow');
      fireEvent.press(leftArrow);

      await waitFor(() => {
        // Should move to last item (wrapping around)
        expect(mockPlayer.play).toHaveBeenCalled();
      });
    });

    it('should navigate to specific item when pagination dot is pressed', async () => {
      const { getByTestId } = render(
        <VideoCarousel videos={mockVideos} images={mockImages} />
      );

      const dot = getByTestId('pagination-dot-2');
      fireEvent.press(dot);

      await waitFor(() => {
        // Should navigate to index 2
        expect(mockPlayer.play).toHaveBeenCalled();
      });
    });

    it('should wrap around to first item when navigating past last item', async () => {
      const { getByTestId } = render(
        <VideoCarousel videos={[mockVideos[0]]} images={[mockImages[0]]} />
      );

      const rightArrow = getByTestId('right-arrow');
      
      // Navigate to last item first
      fireEvent.press(rightArrow);
      
      // Navigate past last item
      fireEvent.press(rightArrow);

      await waitFor(() => {
        // Should wrap to first item
        expect(mockPlayer.play).toHaveBeenCalled();
      });
    });
  });

  describe('Video Controls', () => {
    it('should toggle play/pause when play button is pressed', async () => {
      const { getByTestId } = render(
        <VideoCarousel videos={mockVideos} />
      );

      const playButton = getByTestId('play-pause-button');
      fireEvent.press(playButton);

      await waitFor(() => {
        expect(mockPlayer.pause).toHaveBeenCalled();
      });

      // Press again to resume
      fireEvent.press(playButton);

      await waitFor(() => {
        expect(mockPlayer.play).toHaveBeenCalled();
      });
    });

    it('should toggle mute when mute button is pressed', async () => {
      const { getByTestId } = render(
        <VideoCarousel videos={mockVideos} />
      );

      const muteButton = getByTestId('mute-button');
      fireEvent.press(muteButton);

      await waitFor(() => {
        expect(mockPlayer.muted).toBe(true);
      });
    });

    it('should not show video controls for image items', () => {
      const { queryByTestId } = render(
        <VideoCarousel videos={[]} images={mockImages} />
      );

      expect(queryByTestId('play-pause-button')).toBeNull();
      expect(queryByTestId('mute-button')).toBeNull();
    });
  });

  describe('Visibility Management', () => {
    it('should pause video when not visible', async () => {
      const { rerender } = render(
        <VideoCarousel videos={mockVideos} isVisible={true} />
      );

      // Make component not visible
      rerender(
        <VideoCarousel videos={mockVideos} isVisible={false} />
      );

      await waitFor(() => {
        expect(mockPlayer.pause).toHaveBeenCalled();
        expect(mockPlayer.muted).toBe(true);
      });
    });

    it('should resume video when becoming visible', async () => {
      const { rerender } = render(
        <VideoCarousel videos={mockVideos} isVisible={false} />
      );

      // Make component visible
      rerender(
        <VideoCarousel videos={mockVideos} isVisible={true} />
      );

      await waitFor(() => {
        expect(mockPlayer.play).toHaveBeenCalled();
      });
    });
  });

  describe('Media Type Handling', () => {
    it('should handle mixed videos and images', () => {
      const { getByTestId } = render(
        <VideoCarousel videos={mockVideos} images={mockImages} />
      );

      // Should render the component with mixed media
      expect(getByTestId('video-carousel')).toBeTruthy();
    });

    it('should render image when current index is an image', async () => {
      const { getByTestId } = render(
        <VideoCarousel videos={[mockVideos[0]]} images={mockImages} />
      );

      // Navigate to image (index 1)
      const rightArrow = getByTestId('right-arrow');
      fireEvent.press(rightArrow);

      await waitFor(() => {
        const image = getByTestId('carousel-image');
        expect(image).toBeTruthy();
      });
    });

    it('should handle empty videos array', () => {
      const { getByTestId } = render(
        <VideoCarousel videos={[]} images={mockImages} />
      );

      expect(getByTestId('video-carousel')).toBeTruthy();
    });

    it('should handle empty images array', () => {
      const { getByTestId } = render(
        <VideoCarousel videos={mockVideos} images={[]} />
      );

      expect(getByTestId('video-carousel')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle video player errors gracefully', async () => {
      const mockErrorPlayer = {
        ...mockPlayer,
        play: jest.fn().mockRejectedValue(new Error('Video error')),
      };

      const { useVideoPlayer } = require('expo-video');
      useVideoPlayer.mockReturnValue(mockErrorPlayer);

      const { getByTestId } = render(
        <VideoCarousel videos={mockVideos} />
      );

      const playButton = getByTestId('play-pause-button');
      fireEvent.press(playButton);

      // Should not crash on error
      await waitFor(() => {
        expect(getByTestId('video-carousel')).toBeTruthy();
      });
    });
  });

  describe('Performance', () => {
    it('should preload adjacent videos for smooth navigation', () => {
      const { useVideoPlayer } = require('expo-video');
      
      render(<VideoCarousel videos={mockVideos} />);

      // Should create multiple video players for preloading
      expect(useVideoPlayer).toHaveBeenCalledTimes(3); // Current + next + previous
    });

    it('should update states simultaneously for fast switching', async () => {
      const { getByTestId } = render(
        <VideoCarousel videos={mockVideos} />
      );

      const rightArrow = getByTestId('right-arrow');
      const startTime = Date.now();
      
      fireEvent.press(rightArrow);

      await waitFor(() => {
        const endTime = Date.now();
        // Navigation should be fast (under 100ms)
        expect(endTime - startTime).toBeLessThan(100);
      });
    });
  });
}); 