-- Drop the current restrictive policy
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Create a policy that allows users to check their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);