-- Storage policies for fonts already work via products bucket
-- Let's verify the policies cover all paths including fonts/

-- The existing policies should work for fonts/ path too since they check bucket_id = 'products'
-- But let's also ensure the bucket exists and is public

-- Check if products bucket exists, if not create it
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('products', 'products', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
END $$;