/*
  # Allow public access to active cars
  
  This migration allows unauthenticated users to read active cars,
  enabling them to browse the marketplace without signing up.
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can read active cars" ON cars;

-- Create new policy that allows both authenticated and anonymous users to read active cars
CREATE POLICY "Public can read active cars"
  ON cars FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Also allow public access to car views for analytics
DROP POLICY IF EXISTS "Anyone can insert car views" ON car_views;

CREATE POLICY "Public can insert car views"
  ON car_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can read car views"
  ON car_views FOR SELECT
  TO anon, authenticated
  USING (true); 