import { Car, User } from '@/types/car';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    email: 'alex@example.com',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    bio: 'Premium car dealer with 10+ years experience',
    location: 'Los Angeles, CA',
    rating: 4.8,
    verified: true,
    joinedAt: new Date('2020-01-15'),
    totalListings: 45,
    totalSold: 120,
    followers: 2500,
    following: 180,
  },
  {
    id: '2',
    name: 'Sarah Miller',
    email: 'sarah@example.com',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    bio: 'Luxury car specialist & collector',
    location: 'Miami, FL',
    rating: 4.9,
    verified: true,
    joinedAt: new Date('2019-06-20'),
    totalListings: 32,
    totalSold: 89,
    followers: 3200,
    following: 95,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    bio: 'Electric vehicle enthusiast',
    location: 'San Francisco, CA',
    rating: 4.7,
    verified: false,
    joinedAt: new Date('2021-03-10'),
    totalListings: 18,
    totalSold: 34,
    followers: 1800,
    following: 220,
  },
];

export const mockCars: Car[] = [
  {
    id: '1',
    make: 'Tesla',
    model: 'Model S',
    year: 2023,
    price: 89990,
    mileage: 5200,
    color: 'Pearl White',
    fuel_type: 'Electric',
    transmission: 'Automatic',
    body_type: 'Sedan',
    videos: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    ],
    images: [
      'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    description: 'Pristine Tesla Model S with full self-driving capability. Premium interior, air suspension, and all latest features. Watch the video to see it in action!',
    location: 'Los Angeles, CA',
    seller: {
      id: mockUsers[0].id,
      name: mockUsers[0].name,
      avatar_url: mockUsers[0].avatar,
      rating: mockUsers[0].rating,
      verified: mockUsers[0].verified,
    },
    likes_count: 156,
    comments_count: 2,
    is_liked: false,
    created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: '2',
    make: 'BMW',
    model: 'M4',
    year: 2022,
    price: 72500,
    mileage: 12800,
    color: 'Alpine White',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    body_type: 'Coupe',
    videos: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    ],
    images: [
      'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    description: 'Immaculate BMW M4 with M Performance Package. Carbon fiber trim, premium sound system. Check out the engine sound in the video!',
    location: 'Miami, FL',
    seller: {
      id: mockUsers[1].id,
      name: mockUsers[1].name,
      avatar_url: mockUsers[1].avatar,
      rating: mockUsers[1].rating,
      verified: mockUsers[1].verified,
    },
    likes_count: 203,
    comments_count: 1,
    is_liked: true,
    created_at: '2024-01-08T00:00:00Z',
  },
  {
    id: '3',
    make: 'Mercedes-Benz',
    model: 'G-Class',
    year: 2023,
    price: 142000,
    mileage: 2400,
    color: 'Obsidian Black',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    body_type: 'SUV',
    videos: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    ],
    images: [
      'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    description: 'Legendary G-Wagon with AMG styling package. Loaded with every luxury feature. See the interior and exterior details in the videos!',
    location: 'San Francisco, CA',
    seller: {
      id: mockUsers[2].id,
      name: mockUsers[2].name,
      avatar_url: mockUsers[2].avatar,
      rating: mockUsers[2].rating,
      verified: mockUsers[2].verified,
    },
    likes_count: 89,
    comments_count: 0,
    is_liked: false,
    created_at: '2024-01-14T00:00:00Z',
  },
  {
    id: '4',
    make: 'Porsche',
    model: '911 Turbo',
    year: 2022,
    price: 195000,
    mileage: 8900,
    color: 'Guards Red',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    body_type: 'Coupe',
    videos: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    ],
    images: [
      'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    description: 'Iconic 911 Turbo in stunning Guards Red. Sport Chrono package, ceramic brakes. Listen to that flat-six engine in the video!',
    location: 'Beverly Hills, CA',
    seller: {
      id: mockUsers[1].id,
      name: mockUsers[1].name,
      avatar_url: mockUsers[1].avatar,
      rating: mockUsers[1].rating,
      verified: mockUsers[1].verified,
    },
    likes_count: 312,
    comments_count: 2,
    is_liked: true,
    created_at: '2024-01-11T00:00:00Z',
  },
  {
    id: '5',
    make: 'Audi',
    model: 'RS6 Avant',
    year: 2023,
    price: 118000,
    mileage: 3200,
    color: 'Nardo Gray',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    body_type: 'SUV',
    videos: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    ],
    images: [
      'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    description: 'Beast of a wagon! 600hp twin-turbo V8, carbon fiber everywhere. Watch the acceleration test in the video - pure madness!',
    location: 'Seattle, WA',
    seller: {
      id: mockUsers[0].id,
      name: mockUsers[0].name,
      avatar_url: mockUsers[0].avatar,
      rating: mockUsers[0].rating,
      verified: mockUsers[0].verified,
    },
    likes_count: 178,
    comments_count: 1,
    is_liked: false,
    created_at: '2024-01-09T00:00:00Z',
  },
];