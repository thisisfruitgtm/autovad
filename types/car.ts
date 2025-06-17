export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  fuel_type: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Manual' | 'Automatic';
  body_type: 'Sedan' | 'SUV' | 'Hatchback' | 'Coupe' | 'Convertible' | 'Truck';
  videos: string[];
  images: string[];
  description: string;
  location: string;
  seller?: {
    id: string;
    name: string;
    avatar_url: string;
    rating: number;
    verified: boolean;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  text: string;
  postedAt: Date;
  likes: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  rating: number;
  verified: boolean;
  joinedAt: Date;
  totalListings: number;
  totalSold: number;
  followers: number;
  following: number;
}