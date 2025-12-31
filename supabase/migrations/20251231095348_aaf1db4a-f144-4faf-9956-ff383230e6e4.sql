-- Add full_name and title columns to compass_user_roles for user management
ALTER TABLE public.compass_user_roles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS title text;

-- Add admin role capability to user for managing compass
INSERT INTO public.user_roles (user_id, role)
SELECT 'ddf721a3-7580-40e9-82de-9f2bee3b2611', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = 'ddf721a3-7580-40e9-82de-9f2bee3b2611' AND role = 'admin'
);

-- Drop existing policies before creating new ones to avoid conflicts
DROP POLICY IF EXISTS "Admin can manage all compass roles" ON public.compass_user_roles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;

-- Update compass_user_roles policies to allow admin access
CREATE POLICY "Admin can manage all compass roles"
ON public.compass_user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update profiles to allow admin update
CREATE POLICY "Admin can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admin to insert profiles
CREATE POLICY "Admin can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));