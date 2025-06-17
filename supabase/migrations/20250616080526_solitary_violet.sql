/*
  # Enhanced User Roles and Brand System

  1. New Tables
    - `brands` - Car dealerships/brands that sellers can create
      - `id` (uuid, primary key)
      - `name` (text, brand/dealership name)
      - `description` (text, brand description)
      - `logo_url` (text, brand logo)
      - `website` (text, brand website)
      - `phone` (text, contact phone)
      - `email` (text, contact email)
      - `address` (text, physical address)
      - `owner_id` (uuid, references users)
      - `verified` (boolean, brand verification status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Schema Updates
    - Add `user_type` enum to users table (buyer, seller)
    - Add `brand_id` to cars table for brand association
    - Add `seller_type` enum to cars table (individual, brand)

  3. Security
    - Enable RLS on brands table
    - Add policies for brand management
    - Update car policies for brand sellers
*/

-- Create user_type enum
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('buyer', 'seller');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create seller_type enum for cars
DO $$ BEGIN
  CREATE TYPE seller_type AS ENUM ('individual', 'brand');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  website text,
  phone text,
  email text,
  address text,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verified boolean DEFAULT false,
  total_cars integer DEFAULT 0,
  total_sold integer DEFAULT 0,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add user_type to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE users ADD COLUMN user_type user_type DEFAULT 'buyer';
  END IF;
END $$;

-- Add brand-related columns to cars table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'brand_id'
  ) THEN
    ALTER TABLE cars ADD COLUMN brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'seller_type'
  ) THEN
    ALTER TABLE cars ADD COLUMN seller_type seller_type DEFAULT 'individual';
  END IF;
END $$;

-- Enable RLS on brands table
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Brands policies
CREATE POLICY "Users can read all brands"
  ON brands
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sellers can create brands"
  ON brands
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Brand owners can update own brands"
  ON brands
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Brand owners can delete own brands"
  ON brands
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Update cars policies for brand sellers
DROP POLICY IF EXISTS "Sellers can manage own cars" ON cars;

CREATE POLICY "Sellers can manage own cars"
  ON cars
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = seller_id OR 
    (brand_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM brands WHERE id = cars.brand_id AND owner_id = auth.uid()
    ))
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brands_owner_id ON brands(owner_id);
CREATE INDEX IF NOT EXISTS idx_brands_verified ON brands(verified);
CREATE INDEX IF NOT EXISTS idx_cars_brand_id ON cars(brand_id);
CREATE INDEX IF NOT EXISTS idx_cars_seller_type ON cars(seller_type);

-- Create trigger for updating brands updated_at
CREATE OR REPLACE FUNCTION update_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_brands_updated_at();

-- Function to update brand car counts
CREATE OR REPLACE FUNCTION update_brand_car_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.brand_id IS NOT NULL THEN
      UPDATE brands 
      SET total_cars = total_cars + 1 
      WHERE id = NEW.brand_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle brand change
    IF OLD.brand_id IS DISTINCT FROM NEW.brand_id THEN
      IF OLD.brand_id IS NOT NULL THEN
        UPDATE brands 
        SET total_cars = total_cars - 1 
        WHERE id = OLD.brand_id;
      END IF;
      IF NEW.brand_id IS NOT NULL THEN
        UPDATE brands 
        SET total_cars = total_cars + 1 
        WHERE id = NEW.brand_id;
      END IF;
    END IF;
    
    -- Handle status change to sold
    IF OLD.status != 'sold' AND NEW.status = 'sold' AND NEW.brand_id IS NOT NULL THEN
      UPDATE brands 
      SET total_sold = total_sold + 1 
      WHERE id = NEW.brand_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.brand_id IS NOT NULL THEN
      UPDATE brands 
      SET total_cars = total_cars - 1 
      WHERE id = OLD.brand_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_brand_car_counts
  AFTER INSERT OR UPDATE OR DELETE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_car_counts();