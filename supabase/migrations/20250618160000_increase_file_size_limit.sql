/*
  # Increase file size limit for car-media bucket
  
  This migration increases the file size limit from 50MB to 70MB
  to allow larger video uploads for car presentations.
*/

-- Update the car-media bucket file size limit to 70MB (73400320 bytes)
UPDATE storage.buckets 
SET file_size_limit = 73400320  -- 70MB in bytes
WHERE id = 'car-media'; 