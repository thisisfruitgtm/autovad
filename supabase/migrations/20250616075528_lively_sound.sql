/*
  # Autovad Car Marketplace Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `name` (text)
      - `avatar_url` (text, nullable)
      - `bio` (text, nullable)
      - `location` (text, nullable)
      - `rating` (numeric, default 0)
      - `verified` (boolean, default false)
      - `total_listings` (integer, default 0)
      - `total_sold` (integer, default 0)
      - `followers` (integer, default 0)
      - `following` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `cars`
      - `id` (uuid, primary key)
      - `make` (text)
      - `model` (text)
      - `year` (integer)
      - `price` (numeric)
      - `mileage` (integer)
      - `color` (text)
      - `fuel_type` (enum)
      - `transmission` (enum)
      - `body_type` (enum)
      - `videos` (text array)
      - `images` (text array)
      - `description` (text)
      - `location` (text)
      - `seller_id` (uuid, foreign key)
      - `likes_count` (integer, default 0)
      - `comments_count` (integer, default 0)
      - `views_count` (integer, default 0)
      - `status` (enum, default 'active')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `car_id` (uuid, foreign key)
      - `created_at` (timestamptz)

    - `comments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `car_id` (uuid, foreign key)
      - `text` (text)
      - `likes_count` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `follows`
      - `id` (uuid, primary key)
      - `follower_id` (uuid, foreign key)
      - `following_id` (uuid, foreign key)
      - `created_at` (timestamptz)

    - `activity_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `action` (text)
      - `resource_type` (text)
      - `resource_id` (text)
      - `metadata` (jsonb, nullable)
      - `created_at` (timestamptz)

    - `car_views`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key, nullable)
      - `car_id` (uuid, foreign key)
      - `ip_address` (text, nullable)
      - `user_agent` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate
    - Add policies for car interactions (likes, comments, views)

  3. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for complex queries
*/

-- Create custom types
CREATE TYPE fuel_type AS ENUM ('Petrol', 'Diesel', 'Electric', 'Hybrid');
CREATE TYPE transmission_type AS ENUM ('Manual', 'Automatic');
CREATE TYPE body_type AS ENUM ('Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Truck');
CREATE TYPE car_status AS ENUM ('active', 'sold', 'inactive');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  bio text,
  location text,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  verified boolean DEFAULT false,
  total_listings integer DEFAULT 0,
  total_sold integer DEFAULT 0,
  followers integer DEFAULT 0,
  following integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM now()) + 1),
  price numeric NOT NULL CHECK (price >= 0),
  mileage integer NOT NULL CHECK (mileage >= 0),
  color text NOT NULL,
  fuel_type fuel_type NOT NULL,
  transmission transmission_type NOT NULL,
  body_type body_type NOT NULL,
  videos text[] DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  description text NOT NULL,
  location text NOT NULL,
  seller_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  status car_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, car_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  text text NOT NULL,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Car views table
CREATE TABLE IF NOT EXISTS car_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cars_seller_id ON cars(seller_id);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON cars(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_make_model ON cars(make, model);
CREATE INDEX IF NOT EXISTS idx_cars_location ON cars(location);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_car_id ON likes(car_id);

CREATE INDEX IF NOT EXISTS idx_comments_car_id ON comments(car_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_car_views_car_id ON car_views(car_id);
CREATE INDEX IF NOT EXISTS idx_car_views_user_id ON car_views(user_id);
CREATE INDEX IF NOT EXISTS idx_car_views_created_at ON car_views(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_views ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Cars policies
CREATE POLICY "Anyone can read active cars"
  ON cars FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Sellers can manage own cars"
  ON cars FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id);

-- Likes policies
CREATE POLICY "Users can read all likes"
  ON likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON likes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can read all comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own comments"
  ON comments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Users can read all follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own follows"
  ON follows FOR ALL
  TO authenticated
  USING (auth.uid() = follower_id);

-- Activity logs policies
CREATE POLICY "Users can read own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Car views policies
CREATE POLICY "Users can read all car views"
  ON car_views FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert car views"
  ON car_views FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Functions to update counters
CREATE OR REPLACE FUNCTION update_car_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE cars SET likes_count = likes_count + 1 WHERE id = NEW.car_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE cars SET likes_count = likes_count - 1 WHERE id = OLD.car_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_car_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE cars SET comments_count = comments_count + 1 WHERE id = NEW.car_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE cars SET comments_count = comments_count - 1 WHERE id = OLD.car_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET followers = followers + 1 WHERE id = NEW.following_id;
    UPDATE users SET following = following + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET followers = followers - 1 WHERE id = OLD.following_id;
    UPDATE users SET following = following - 1 WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_car_likes_count
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_car_likes_count();

CREATE TRIGGER trigger_update_car_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_car_comments_count();

CREATE TRIGGER trigger_update_user_followers_count
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_user_followers_count();

CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();