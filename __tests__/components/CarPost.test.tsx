import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CarPost } from '../../components/CarPost';
import { Car } from '../../types/car';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    currentLanguage: 'en',
  }),
}));

const mockCar: Car = {
  id: 'test-car-1',
  make: 'Tesla',
  model: 'Model 3',
  year: 2023,
  price: 50000,
  mileage: 15000,
  fuel_type: 'Electric',
  transmission: 'Automatic',
  body_type: 'Sedan',
  color: 'white',
  description: 'Test car description',
  location: 'Bucharest',
  status: 'active',
  videos: ['https://example.com/video1.mp4'],
  images: ['https://example.com/image1.jpg'],
  likes_count: 5,
  comments_count: 2,
  is_liked: false,
  created_at: '2024-01-01T00:00:00Z',
};

describe('CarPost', () => {
  const mockOnLike = jest.fn();
  const mockOnComment = jest.fn();
  const mockOnShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render car information correctly', () => {
    const { getByText } = render(
      <CarPost 
        car={mockCar} 
        onLike={mockOnLike} 
        onComment={mockOnComment}
        onShare={mockOnShare}
      />
    );

    expect(getByText('Tesla Model 3')).toBeTruthy();
    expect(getByText('2023')).toBeTruthy();
    expect(getByText('Bucharest')).toBeTruthy();
  });

  it('should handle like button press', () => {
    const { getByTestId } = render(
      <CarPost 
        car={mockCar} 
        onLike={mockOnLike} 
        onComment={mockOnComment}
        onShare={mockOnShare}
      />
    );

    const likeButton = getByTestId('like-button');
    fireEvent.press(likeButton);

    expect(mockOnLike).toHaveBeenCalledWith(mockCar.id);
  });

  it('should handle comment button press', () => {
    const { getByTestId } = render(
      <CarPost 
        car={mockCar} 
        onLike={mockOnLike} 
        onComment={mockOnComment}
        onShare={mockOnShare}
      />
    );

    const commentButton = getByTestId('comment-button');
    fireEvent.press(commentButton);

    expect(mockOnComment).toHaveBeenCalledWith(mockCar.id);
  });

  it('should display like count correctly', () => {
    const { getByText } = render(
      <CarPost 
        car={mockCar} 
        onLike={mockOnLike} 
        onComment={mockOnComment}
        onShare={mockOnShare}
      />
    );

    expect(getByText('5')).toBeTruthy(); // likes count
    expect(getByText('2')).toBeTruthy(); // comments count
  });

  it('should handle liked state correctly', () => {
    const likedCar = { ...mockCar, is_liked: true };
    
    const { getByTestId } = render(
      <CarPost 
        car={likedCar} 
        onLike={mockOnLike} 
        onComment={mockOnComment}
        onShare={mockOnShare}
      />
    );

    const likeButton = getByTestId('like-button');
    fireEvent.press(likeButton);

    expect(mockOnLike).toHaveBeenCalledWith(likedCar.id);
  });

  it('should display car specs correctly', () => {
    const { getByText } = render(
      <CarPost 
        car={mockCar} 
        onLike={mockOnLike} 
        onComment={mockOnComment}
        onShare={mockOnShare}
      />
    );

    expect(getByText('Electric')).toBeTruthy();
  });
}); 