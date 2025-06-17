/*
  # Add 20 Demo Cars for Preview Mode

  1. Changes
    - Add 12 additional demo cars to reach a total of 20
    - Include diverse brands, price ranges, and car types
    - All cars have NULL seller_id for demo purposes
    - Include Romanian descriptions and locations

  2. Car Categories
    - Luxury supercars (Lamborghini, Ferrari, McLaren)
    - Premium sedans (BMW, Mercedes, Audi)
    - Electric vehicles (Tesla, Porsche Taycan)
    - Sports cars (Porsche, BMW M)
    - Family cars (Toyota, Honda, Volkswagen)
    - SUVs (Range Rover, BMW X, Mercedes G-Class)
*/

-- Add 12 more demo cars to reach 20 total
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
    '660e8400-e29b-41d4-a716-446655440009',
    'Ferrari',
    'F8 Tributo',
    2021,
    285000,
    6800,
    'Rosso Corsa',
    'Petrol',
    'Automatic',
    'Coupe',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Ferrari F8 Tributo - artă italiană pură! Motor V8 twin-turbo de 720 CP, 0-100 km/h în 2.9 secunde. Sunetul inconfundabil Ferrari și performanțe de circuit. Mașina de vis pentru colecționari.',
    'București, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440010',
    'McLaren',
    '720S',
    2020,
    295000,
    12500,
    'Volcano Orange',
    'Petrol',
    'Automatic',
    'Coupe',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'McLaren 720S - tehnologie de Formula 1! 720 CP, fibră de carbon, suspensie adaptivă. Accelerație brutală și manevrabilitate perfectă. Supercar-ul care redefinește performanța.',
    'Cluj-Napoca, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440011',
    'Range Rover',
    'Sport SVR',
    2022,
    145000,
    18000,
    'Santorini Black',
    'Petrol',
    'Automatic',
    'SUV',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Range Rover Sport SVR - luxul întâlnește performanța! Motor V8 supercharged de 575 CP, interior din piele premium, tehnologie de vârf. SUV-ul perfect pentru orice aventură.',
    'Timișoara, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440012',
    'Porsche',
    'Taycan Turbo S',
    2023,
    185000,
    5200,
    'Frozen Blue',
    'Electric',
    'Automatic',
    'Sedan',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Porsche Taycan Turbo S - viitorul sportiv electric! 761 CP, 0-100 km/h în 2.8 secunde, autonomie de 400+ km. Tehnologia Porsche în era electrică. Încărcare ultra-rapidă.',
    'Constanța, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440013',
    'BMW',
    'X5 M Competition',
    2022,
    125000,
    22000,
    'Storm Bay',
    'Petrol',
    'Automatic',
    'SUV',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'BMW X5 M Competition - SUV-ul sport suprem! Motor V8 twin-turbo de 625 CP, xDrive, suspensie adaptivă M. Combinația perfectă între utilitate și performanță extremă.',
    'Iași, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440014',
    'Mercedes-Benz',
    'S-Class S500',
    2023,
    135000,
    8500,
    'Obsidian Black',
    'Petrol',
    'Automatic',
    'Sedan',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Mercedes S-Class S500 - standardul luxului! Interior din piele Nappa, sistem audio Burmester 4D, suspensie pneumatică AIRMATIC. Limuzina executivă definitivă.',
    'București, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440015',
    'Volkswagen',
    'Golf GTI',
    2022,
    42000,
    28000,
    'Tornado Red',
    'Petrol',
    'Manual',
    'Hatchback',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Volkswagen Golf GTI - hot hatch-ul iconic! Motor TSI de 245 CP, cutie manuală cu 6 trepte, suspensie sport. Mașina perfectă pentru pasionații de condus zilnic.',
    'Cluj-Napoca, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440016',
    'Honda',
    'Civic Type R',
    2021,
    48000,
    15500,
    'Championship White',
    'Petrol',
    'Manual',
    'Hatchback',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Honda Civic Type R - bestia japoneză! Motor VTEC Turbo de 320 CP, diferențial cu patinare limitată, aerodinamică agresivă. Hot hatch-ul care domină circuitul.',
    'Timișoara, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440017',
    'Audi',
    'e-tron GT',
    2023,
    115000,
    12000,
    'Daytona Gray',
    'Electric',
    'Automatic',
    'Sedan',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Audi e-tron GT - gran turismo electric! 476 CP, quattro electric, autonomie de 450+ km. Design spectaculos și tehnologie de vârf. Viitorul mobilității premium.',
    'Constanța, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440018',
    'Bentley',
    'Continental GT',
    2021,
    225000,
    18500,
    'Beluga Black',
    'Petrol',
    'Automatic',
    'Coupe',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Bentley Continental GT - luxul britanic suprem! Motor W12 twin-turbo de 635 CP, interior handcrafted, tehnologie de vârf. Grand tourer-ul perfect pentru călătorii lungi.',
    'Iași, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440019',
    'Maserati',
    'MC20',
    2022,
    265000,
    4200,
    'Bianco Audace',
    'Petrol',
    'Automatic',
    'Coupe',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Maserati MC20 - renasterea sportivă italiană! Motor V6 twin-turbo Nettuno de 630 CP, fibră de carbon, uși butterfly. Supercar-ul care readuce Maserati în prim-plan.',
    'București, România',
    NULL,
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440020',
    'Jaguar',
    'F-Type R',
    2021,
    95000,
    16800,
    'British Racing Green',
    'Petrol',
    'Automatic',
    'Coupe',
    ARRAY['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'],
    ARRAY[
      'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Jaguar F-Type R - eleganța britanică sportivă! Motor V8 supercharged de 575 CP, sunet spectaculos, design timeless. Sports car-ul care combină tradițiile cu modernitatea.',
    'Cluj-Napoca, România',
    NULL,
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  make = EXCLUDED.make,
  model = EXCLUDED.model,
  price = EXCLUDED.price,
  description = EXCLUDED.description;

-- Verify we have 20 demo cars total
DO $$
DECLARE
    demo_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO demo_count FROM cars WHERE seller_id IS NULL;
    RAISE NOTICE 'Total demo cars: %', demo_count;
    
    IF demo_count < 20 THEN
        RAISE EXCEPTION 'Expected 20 demo cars, but found %', demo_count;
    END IF;
END $$;