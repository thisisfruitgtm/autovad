/*
  # Add Demo Cars for Autovad Marketplace
  
  This migration adds 15 demo cars with videos and images to populate the feed.
  Each car has realistic data with videos prioritized over images.
*/

-- First, create a demo user to be the seller of these cars
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@Autovad.com',
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, name, avatar_url, bio, location, rating, verified, total_listings)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@Autovad.com',
  'Autovad Demo',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'Dealer oficial Autovad cu cele mai bune oferte din România!',
  'București, România',
  4.8,
  true,
  15
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  rating = EXCLUDED.rating,
  verified = EXCLUDED.verified,
  total_listings = EXCLUDED.total_listings;

-- Insert demo cars with videos and images
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
  likes_count,
  comments_count,
  views_count,
  created_at
) VALUES 
-- Car 1: BMW X5 (Premium SUV with video)
(
  '10000000-0000-0000-0000-000000000001',
  'BMW',
  'X5',
  2022,
  75000,
  25000,
  'Negru',
  'Diesel',
  'Automatic',
  'SUV',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop'
  ],
  'BMW X5 în stare impecabilă! Mașină de lux cu toate opțiunile. Întreținută la reprezentanță, fără accidente. Perfect pentru familia modernă care vrea confort și performanță.',
  'București, Sector 1',
  '00000000-0000-0000-0000-000000000001',
  127,
  23,
  1543,
  now() - interval '2 hours'
),

-- Car 2: Mercedes-Benz C-Class (Luxury sedan with video)
(
  '10000000-0000-0000-0000-000000000002',
  'Mercedes-Benz',
  'C-Class',
  2021,
  52000,
  35000,
  'Alb',
  'Petrol',
  'Automatic',
  'Sedan',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop'
  ],
  'Mercedes-Benz C-Class - eleganță și performanță! Mașină premium cu interior din piele, sistem de navigație și toate sistemele de siguranță. Ideală pentru business și plăcere.',
  'Cluj-Napoca, Cluj',
  '00000000-0000-0000-0000-000000000001',
  89,
  15,
  892,
  now() - interval '4 hours'
),

-- Car 3: Audi A4 (Executive sedan with video)
(
  '10000000-0000-0000-0000-000000000003',
  'Audi',
  'A4',
  2023,
  48000,
  15000,
  'Gri',
  'Diesel',
  'Automatic',
  'Sedan',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop'
  ],
  'Audi A4 nou-nouț! Tehnologie de ultimă generație, consum redus și design modern. Mașina perfectă pentru cei care apreciază calitatea germană și inovația.',
  'Timișoara, Timiș',
  '00000000-0000-0000-0000-000000000001',
  156,
  31,
  2103,
  now() - interval '6 hours'
),

-- Car 4: Volkswagen Golf (Popular hatchback with video)
(
  '10000000-0000-0000-0000-000000000004',
  'Volkswagen',
  'Golf',
  2020,
  28000,
  45000,
  'Roșu',
  'Petrol',
  'Manual',
  'Hatchback',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop'
  ],
  'VW Golf - mașina pentru toată familia! Fiabilă, economică și spațioasă. Perfect întreținută, cu toate reviziile la zi. Ideală pentru oraș și călătorii lungi.',
  'Iași, Iași',
  '00000000-0000-0000-0000-000000000001',
  73,
  12,
  654,
  now() - interval '8 hours'
),

-- Car 5: Tesla Model 3 (Electric luxury with video)
(
  '10000000-0000-0000-0000-000000000005',
  'Tesla',
  'Model 3',
  2022,
  65000,
  20000,
  'Alb',
  'Electric',
  'Automatic',
  'Sedan',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop'
  ],
  'Tesla Model 3 - viitorul este aici! Mașină 100% electrică cu autonomie mare, tehnologie avansată și performanțe incredibile. Zero emisii, maximum de plăcere!',
  'București, Sector 2',
  '00000000-0000-0000-0000-000000000001',
  234,
  45,
  3210,
  now() - interval '10 hours'
),

-- Car 6: Ford Mustang (Sports car with video)
(
  '10000000-0000-0000-0000-000000000006',
  'Ford',
  'Mustang',
  2021,
  58000,
  18000,
  'Galben',
  'Petrol',
  'Automatic',
  'Coupe',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'
  ],
  'Ford Mustang - legenda americană! Motor V8 puternic, design iconic și sunet de neuitat. Pentru cei care vor să se remarce și să simtă adrenalina pură.',
  'Constanța, Constanța',
  '00000000-0000-0000-0000-000000000001',
  198,
  38,
  2567,
  now() - interval '12 hours'
),

-- Car 7: Range Rover Evoque (Luxury SUV with video)
(
  '10000000-0000-0000-0000-000000000007',
  'Land Rover',
  'Range Rover Evoque',
  2023,
  72000,
  12000,
  'Negru',
  'Diesel',
  'Automatic',
  'SUV',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop'
  ],
  'Range Rover Evoque - luxul britanic la superlativ! Design modern, capabilități off-road excepționale și confort de 5 stele. Mașina care impresionează oriunde.',
  'Brașov, Brașov',
  '00000000-0000-0000-0000-000000000001',
  145,
  27,
  1876,
  now() - interval '14 hours'
),

-- Car 8: Porsche 911 (Sports car with video)
(
  '10000000-0000-0000-0000-000000000008',
  'Porsche',
  '911',
  2022,
  125000,
  8000,
  'Roșu',
  'Petrol',
  'Automatic',
  'Coupe',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop'
  ],
  'Porsche 911 - perfecțiunea în mișcare! Mașina de vis pentru pasionații de viteză și eleganță. Performanțe de curse într-un pachet rafinat și luxos.',
  'București, Sector 1',
  '00000000-0000-0000-0000-000000000001',
  312,
  67,
  4521,
  now() - interval '16 hours'
),

-- Car 9: Toyota RAV4 (Reliable SUV with video)
(
  '10000000-0000-0000-0000-000000000009',
  'Toyota',
  'RAV4',
  2021,
  42000,
  32000,
  'Albastru',
  'Hybrid',
  'Automatic',
  'SUV',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop'
  ],
  'Toyota RAV4 Hybrid - fiabilitatea japoneză cu tehnologie verde! Consum mic, spațiu generos și siguranță maximă. Perfectă pentru familiile active.',
  'Sibiu, Sibiu',
  '00000000-0000-0000-0000-000000000001',
  91,
  18,
  1234,
  now() - interval '18 hours'
),

-- Car 10: Mini Cooper (Stylish hatchback with video)
(
  '10000000-0000-0000-0000-000000000010',
  'Mini',
  'Cooper',
  2020,
  35000,
  28000,
  'Verde',
  'Petrol',
  'Manual',
  'Hatchback',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop'
  ],
  'Mini Cooper - personalitate în format compact! Design iconic, manevrabilitate excelentă și stil britanic autentic. Perfectă pentru viața urbană dinamică.',
  'Oradea, Bihor',
  '00000000-0000-0000-0000-000000000001',
  67,
  14,
  789,
  now() - interval '20 hours'
),

-- Car 11: Jeep Wrangler (Off-road SUV with video)
(
  '10000000-0000-0000-0000-000000000011',
  'Jeep',
  'Wrangler',
  2022,
  55000,
  22000,
  'Negru',
  'Petrol',
  'Manual',
  'SUV',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'
  ],
  'Jeep Wrangler - aventura te cheamă! Capabilități off-road legendare, design robust și libertatea de a explora orice teren. Pentru spiritele libere!',
  'Craiova, Dolj',
  '00000000-0000-0000-0000-000000000001',
  123,
  29,
  1567,
  now() - interval '22 hours'
),

-- Car 12: Hyundai Tucson (Modern SUV with video)
(
  '10000000-0000-0000-0000-000000000012',
  'Hyundai',
  'Tucson',
  2023,
  38000,
  15000,
  'Gri',
  'Hybrid',
  'Automatic',
  'SUV',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop'
  ],
  'Hyundai Tucson - tehnologie coreeană de vârf! Design futurist, eficiență energetică și garanție extinsă. Alegerea inteligentă pentru familia modernă.',
  'Galați, Galați',
  '00000000-0000-0000-0000-000000000001',
  85,
  16,
  943,
  now() - interval '1 day'
),

-- Car 13: Skoda Octavia (Practical sedan with video)
(
  '10000000-0000-0000-0000-000000000013',
  'Skoda',
  'Octavia',
  2021,
  32000,
  38000,
  'Alb',
  'Diesel',
  'Automatic',
  'Sedan',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop'
  ],
  'Skoda Octavia - spațiu și calitate la preț corect! Portbagaj generos, consum redus și tehnologie modernă. Mașina practică pentru toate nevoile.',
  'Ploiești, Prahova',
  '00000000-0000-0000-0000-000000000001',
  54,
  11,
  678,
  now() - interval '1 day 2 hours'
),

-- Car 14: Nissan Qashqai (Urban SUV with video)
(
  '10000000-0000-0000-0000-000000000014',
  'Nissan',
  'Qashqai',
  2022,
  36000,
  24000,
  'Roșu',
  'Petrol',
  'Automatic',
  'SUV',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'
  ],
  'Nissan Qashqai - SUV-ul urban perfect! Poziție de conducere înaltă, tehnologie inteligentă și design atractiv. Ideal pentru viața de zi cu zi.',
  'Bacău, Bacău',
  '00000000-0000-0000-0000-000000000001',
  76,
  13,
  834,
  now() - interval '1 day 4 hours'
),

-- Car 15: Dacia Duster (Affordable SUV with video)
(
  '10000000-0000-0000-0000-000000000015',
  'Dacia',
  'Duster',
  2023,
  22000,
  8000,
  'Gri',
  'Petrol',
  'Manual',
  'SUV',
  ARRAY[
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop'
  ],
  'Dacia Duster - SUV-ul accesibil pentru toți! Raport calitate-preț excelent, robustețe și fiabilitate. Mașina care îți oferă mai mult cu mai puțin.',
  'Pitești, Argeș',
  '00000000-0000-0000-0000-000000000001',
  43,
  8,
  456,
  now() - interval '1 day 6 hours'
);

-- Update the demo user's total listings count
UPDATE users 
SET total_listings = 15 
WHERE id = '00000000-0000-0000-0000-000000000001'; 