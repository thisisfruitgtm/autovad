-- Create the car-media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-media',
  'car-media',
  true,
  52428800, -- 50MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/avi']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for the car-media bucket
-- Policy for authenticated users to upload files
CREATE POLICY "Authenticated users can upload car media" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'car-media');

-- Policy for authenticated users to view files
CREATE POLICY "Anyone can view car media" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'car-media');

-- Policy for users to update their own files
CREATE POLICY "Users can update their own car media" ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'car-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for users to delete their own files
CREATE POLICY "Users can delete their own car media" ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'car-media' AND auth.uid()::text = (storage.foldername(name))[1]);
