/*
  # Fix foreign key relationship between cars and brands

  1. Changes
    - Ensure proper foreign key constraint between cars.brand_id and brands.id
    - Add index for better query performance
    - Refresh schema cache to ensure Supabase recognizes the relationship

  2. Security
    - No changes to existing RLS policies
*/

-- First, let's ensure the foreign key constraint exists and is properly named
-- Drop the existing constraint if it exists (to recreate it properly)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cars_brand_id_fkey' 
    AND table_name = 'cars'
  ) THEN
    ALTER TABLE cars DROP CONSTRAINT cars_brand_id_fkey;
  END IF;
END $$;

-- Recreate the foreign key constraint with proper naming
ALTER TABLE cars 
ADD CONSTRAINT cars_brand_id_fkey 
FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;

-- Ensure the index exists for better performance
CREATE INDEX IF NOT EXISTS idx_cars_brand_id ON cars(brand_id);

-- Refresh the schema cache by updating a system table
-- This helps Supabase recognize the relationship
NOTIFY pgrst, 'reload schema';