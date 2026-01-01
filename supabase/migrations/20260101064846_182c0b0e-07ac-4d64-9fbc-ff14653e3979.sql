-- Add unique constraint on feature_key if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'feature_permissions_feature_key_key'
  ) THEN
    ALTER TABLE public.feature_permissions ADD CONSTRAINT feature_permissions_feature_key_key UNIQUE (feature_key);
  END IF;
END $$;