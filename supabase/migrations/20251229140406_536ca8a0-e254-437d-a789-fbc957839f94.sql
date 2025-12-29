-- ========================================
-- Fix: Recreate profiles policies as PERMISSIVE (default)
-- ========================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create permissive policies (default behavior) - these correctly deny anonymous access
-- because auth.uid() returns NULL for anonymous users
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Also fix user_credits table (same issue reported)
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;

CREATE POLICY "Users can view their own credits" 
ON public.user_credits 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);