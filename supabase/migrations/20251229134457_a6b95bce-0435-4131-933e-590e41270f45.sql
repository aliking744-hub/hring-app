-- Drop the existing overly permissive admin policy
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- Recreate admin policy using the secure has_role function instead of email check
CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- The existing "Users can view own profile" policy is correct and stays in place