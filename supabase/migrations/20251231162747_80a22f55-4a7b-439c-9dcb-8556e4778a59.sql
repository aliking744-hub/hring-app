-- Add diamonds and permissions to compass_user_roles
ALTER TABLE public.compass_user_roles 
ADD COLUMN IF NOT EXISTS diamonds INTEGER NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS accessible_sections TEXT[] DEFAULT ARRAY['intent', 'behavior', 'betting', 'erdtree', 'analysis', 'dream', 'prism', 'journal']::TEXT[],
ADD COLUMN IF NOT EXISTS can_edit BOOLEAN NOT NULL DEFAULT true;

-- Update the compass_role enum to include 'expert' role
ALTER TYPE public.compass_role ADD VALUE IF NOT EXISTS 'expert';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_compass_user_roles_user_id ON public.compass_user_roles(user_id);