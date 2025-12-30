-- Create storage policies for products bucket
-- Allow admins to upload files
CREATE POLICY "Admin can upload files to products bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update files
CREATE POLICY "Admin can update files in products bucket"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete files
CREATE POLICY "Admin can delete files from products bucket"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow public read access (bucket is already public)
CREATE POLICY "Anyone can view files in products bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'products');