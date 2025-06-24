-- Add playback_id and thumbnail_url to cars for Mux integration
ALTER TABLE cars ADD COLUMN IF NOT EXISTS playback_id text;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS asset_ids text[] DEFAULT '{}'; 