/*
  # Add Demo Cars for Preview Mode

  1. Changes
    - Temporarily disable foreign key constraint for seller_id
    - Insert demo cars with NULL seller_id
    - Re-enable constraint
    - Update RLS policies to allow reading demo cars

  2. Security
    - Allow unauthenticated users to read demo cars
    - Maintain security for real user data
*/

-- Temporarily disable the NOT NULL constraint on seller_id
ALTER TABLE cars ALTER COLUMN seller_id DROP NOT NULL;

-- Insert demo cars with NULL seller_id for preview mode
INSERT INTO cars (
  id, 
  make, 
  model, 
  year, 
  price, 
  mileage, 
  color, 
  fuel_type, 
  transmission, 
  body_type, 
  videos, 
  images, 
  description, 
  location, 
  seller_id, 
  status
) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001',
    'Tesla',
    'Model S',
    2023,
    89990,
    8500,
    'Pearl White',
    'Electric',
    'Automatic',
    'Sedan',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Tesla Model S în stare impecabilă! Autopilot complet, interior premium din piele, încărcare rapidă Supercharger. Mașina perfectă pentru viitorul mobilității electrice. Garanție extinsă inclusă.',
    'București, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    'BMW',
    'M4 Competition',
    2022,
    75500,
    15200,
    'Alpine White',
    'Petrol',
    'Automatic',
    'Coupe',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'BMW M4 Competition cu pachet M Performance! Motor twin-turbo de 510 CP, suspensie adaptivă, frâne ceramice. Mașina sport perfectă pentru șoseaua și circuitul de curse.',
    'Cluj-Napoca, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    'Mercedes-Benz',
    'G 63 AMG',
    2023,
    165000,
    3200,
    'Obsidian Black',
    'Petrol',
    'Automatic',
    'SUV',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Legendarul G-Wagon în versiunea AMG! 585 CP, interior de lux complet, sistem audio Burmester. Simbolul puterii și luxului, perfect pentru orice teren.',
    'Timișoara, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440004',
    'Porsche',
    '911 Turbo S',
    2022,
    195000,
    12800,
    'Guards Red',
    'Petrol',
    'Automatic',
    'Coupe',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Porsche 911 Turbo S - vârful gamei! 650 CP, 0-100 km/h în 2.7 secunde, pachet Sport Chrono. Mașina sport definitivă cu tehnologie de vârf și performanțe extraordinare.',
    'Constanța, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440005',
    'Audi',
    'RS6 Avant',
    2023,
    125000,
    6500,
    'Nardo Gray',
    'Petrol',
    'Automatic',
    'SUV',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Audi RS6 Avant - bestia familiei! 600 CP, quattro, suspensie pneumatică. Combinația perfectă între practicitate și performanță. Accelerație brutală în orice condiții.',
    'Iași, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440006',
    'Lamborghini',
    'Huracán EVO',
    2021,
    245000,
    8900,
    'Arancio Borealis',
    'Petrol',
    'Automatic',
    'Coupe',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Lamborghini Huracán EVO - pura adrenalină! Motor V10 atmosferic de 640 CP, sunet incredibil, design iconic. Mașina de vis pentru pasionații de supercars.',
    'București, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440007',
    'Toyota',
    'Prius',
    2022,
    32500,
    25000,
    'Silver Metallic',
    'Hybrid',
    'Automatic',
    'Hatchback',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Toyota Prius hibrid - economie maximă! Consum de doar 3.5L/100km, tehnologie hibrid avansată, foarte fiabilă. Perfectă pentru oraș și călătorii lungi.',
    'Cluj-Napoca, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440008',
    'Ford',
    'Mustang GT',
    2021,
    58000,
    18500,
    'Race Red',
    'Petrol',
    'Manual',
    'Coupe',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Ford Mustang GT cu motor V8 de 5.0L! Sunet iconic, 450 CP, cutie manuală cu 6 trepte. Mașina muscle car americană autentică, perfectă pentru pasionați.',
    'Timișoara, România',
    NULL,
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  make = EXCLUDED.make,
  model = EXCLUDED.model,
  price = EXCLUDED.price,
  description = EXCLUDED.description;

-- Update RLS policies to allow reading demo cars for unauthenticated users
DROP POLICY IF EXISTS "Anyone can read demo cars" ON cars;

CREATE POLICY "Anyone can read demo cars"
  ON cars
  FOR SELECT
  TO anon
  USING (status = 'active' AND seller_id IS NULL);

-- Ensure authenticated users can still read all active cars
DROP POLICY IF EXISTS "Anyone can read active cars" ON cars;

CREATE POLICY "Anyone can read active cars"
  ON cars
  FOR SELECT
  TO authenticated
  USING (status = 'active');