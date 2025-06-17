/*
  # Fix User Creation and Likes Functionality

  1. Problem
    - Users authenticate via Google OAuth but are not automatically created in users table
    - Likes fail because of foreign key constraint violation
    - Need to ensure authenticated users exist in users table

  2. Solution
    - Create trigger to automatically insert user into users table on auth
    - Update likes policies to handle this properly
    - Add fallback for missing users

  3. Changes
    - Add function to handle new user creation
    - Add trigger on auth.users for automatic user creation
    - Update RLS policies for better user handling
*/

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also handle updates to sync data
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to ensure user exists before like operations
CREATE OR REPLACE FUNCTION public.ensure_user_exists(user_uuid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    created_at,
    updated_at
  ) VALUES (
    user_uuid,
    'unknown@autovad.com',
    'User',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update likes policies to be more permissive for authenticated users
DROP POLICY IF EXISTS "Users can manage own likes" ON likes;
CREATE POLICY "Users can manage own likes"
  ON likes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update cars policies to allow reading by anonymous users (for demo cars)
DROP POLICY IF EXISTS "Anyone can read demo cars" ON cars;
CREATE POLICY "Anyone can read demo cars"
  ON cars FOR SELECT
  TO anon
  USING (status = 'active' AND seller_id IS NULL);

-- Ensure authenticated users can read all active cars
DROP POLICY IF EXISTS "Anyone can read active cars" ON cars;
CREATE POLICY "Anyone can read active cars"
  ON cars FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Add policy for unauthenticated users to read demo car likes
DROP POLICY IF EXISTS "Anyone can read demo car likes" ON likes;
CREATE POLICY "Anyone can read demo car likes"
  ON likes FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM cars 
      WHERE cars.id = likes.car_id 
      AND cars.status = 'active' 
      AND cars.seller_id IS NULL
    )
  );

-- Update user insertion policy to be more permissive
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.cars TO anon, authenticated;
GRANT SELECT ON public.likes TO anon, authenticated;
GRANT ALL ON public.likes TO authenticated;
GRANT ALL ON public.users TO authenticated;

-- Create any missing users for existing auth users
INSERT INTO public.users (
  id,
  email,
  name,
  created_at,
  updated_at
)
SELECT 
  auth_users.id,
  COALESCE(auth_users.email, 'unknown@autovad.com'),
  COALESCE(auth_users.raw_user_meta_data->>'full_name', auth_users.raw_user_meta_data->>'name', 'User'),
  NOW(),
  NOW()
FROM auth.users auth_users
LEFT JOIN public.users public_users ON auth_users.id = public_users.id
WHERE public_users.id IS NULL
ON CONFLICT (id) DO NOTHING; 