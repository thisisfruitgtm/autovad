-- Fix asset_ids column in cars table
-- Ensure the column exists and has proper default value
ALTER TABLE cars ADD COLUMN IF NOT EXISTS asset_ids text[] DEFAULT '{}';

-- Update any existing NULL values to empty array
UPDATE cars SET asset_ids = '{}' WHERE asset_ids IS NULL;

-- Make sure the column is not nullable
ALTER TABLE cars ALTER COLUMN asset_ids SET NOT NULL;
ALTER TABLE cars ALTER COLUMN asset_ids SET DEFAULT '{}';
