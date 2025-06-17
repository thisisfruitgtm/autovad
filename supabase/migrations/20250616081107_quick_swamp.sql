/*
  # Fix foreign key relationship between cars and brands

  1. Database Changes
    - Ensure foreign key constraint exists properly
    - Add proper indexing for performance
    - Refresh schema cache for Supabase recognition

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
*/

-- First, check if the brands table exists and has the correct structure
DO $$
BEGIN
  -- Ensure brands table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brands') THEN
    RAISE EXCEPTION 'Brands table does not exist. Please run the previous migration first.';
  END IF;
END $$;

-- Drop and recreate the foreign key constraint to ensure it's properly recognized
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cars_brand_id_fkey' 
    AND table_name = 'cars'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.cars DROP CONSTRAINT cars_brand_id_fkey;
  END IF;
END $$;

-- Ensure the brand_id column exists in cars table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' 
    AND column_name = 'brand_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.cars ADD COLUMN brand_id uuid;
  END IF;
END $$;

-- Recreate the foreign key constraint with explicit schema reference
ALTER TABLE public.cars 
ADD CONSTRAINT cars_brand_id_fkey 
FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;

-- Ensure proper indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_cars_brand_id ON public.cars(brand_id);
CREATE INDEX IF NOT EXISTS idx_brands_owner_id ON public.brands(owner_id);

-- Update the cars table policy to handle brand relationships properly
DROP POLICY IF EXISTS "Sellers can manage own cars" ON public.cars;

CREATE POLICY "Sellers can manage own cars"
  ON public.cars
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = seller_id OR 
    (brand_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.brands 
      WHERE id = cars.brand_id AND owner_id = auth.uid()
    ))
  );

-- Ensure the brands table has proper RLS policies
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Drop and recreate brand policies to ensure they're current
DROP POLICY IF EXISTS "Users can read all brands" ON public.brands;
DROP POLICY IF EXISTS "Sellers can create brands" ON public.brands;
DROP POLICY IF EXISTS "Brand owners can update own brands" ON public.brands;
DROP POLICY IF EXISTS "Brand owners can delete own brands" ON public.brands;

CREATE POLICY "Users can read all brands"
  ON public.brands
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sellers can create brands"
  ON public.brands
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Brand owners can update own brands"
  ON public.brands
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Brand owners can delete own brands"
  ON public.brands
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Force a schema cache refresh
-- This is crucial for Supabase to recognize the new relationship
SELECT pg_notify('pgrst', 'reload schema');

-- Verify the foreign key constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cars_brand_id_fkey' 
    AND table_name = 'cars'
    AND table_schema = 'public'
  ) THEN
    RAISE EXCEPTION 'Foreign key constraint was not created successfully';
  END IF;
  
  RAISE NOTICE 'Foreign key constraint cars_brand_id_fkey created successfully';
END $$;