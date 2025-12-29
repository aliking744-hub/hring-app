-- ========================================
-- Add explicit deny policies for anonymous access
-- ========================================

-- Deny anonymous access to profiles table
CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR SELECT 
TO anon 
USING (false);

-- Deny anonymous access to user_credits table
CREATE POLICY "Deny anonymous access to user_credits" 
ON public.user_credits 
FOR SELECT 
TO anon 
USING (false);

-- Deny anonymous access to user_roles table
CREATE POLICY "Deny anonymous access to user_roles" 
ON public.user_roles 
FOR SELECT 
TO anon 
USING (false);