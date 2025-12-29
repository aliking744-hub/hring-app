-- Fix security issue: Prevent users from modifying their own credits
-- Add explicit RESTRICTIVE policy to block user updates on user_credits

-- First, ensure admin can do everything on user_credits (already exists, but let's be explicit)
-- The existing "Admin can manage all credits" policy with email check covers this

-- Add explicit policy to prevent non-admin users from updating/inserting/deleting credits
CREATE POLICY "Non-admins cannot insert credits"
ON public.user_credits
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'email'::text) = 'ali_king744@yahoo.com'
  OR EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.id = user_credits.user_id 
    AND NOT EXISTS (SELECT 1 FROM user_credits WHERE user_id = auth.uid())
  ) = false
);

-- Actually, let's be cleaner - just add restrictive policies for user_credits
-- Drop the above and create proper policies

-- For INSERT: Only admin can insert (handled by trigger for new users, admin for manual)
-- For UPDATE: Only admin can update
-- For DELETE: Only admin can delete

-- Create explicit deny policies for non-admin modifications
CREATE POLICY "Users cannot update credits" 
ON public.user_credits 
FOR UPDATE 
TO authenticated
USING (
  (auth.jwt() ->> 'email'::text) = 'ali_king744@yahoo.com'
)
WITH CHECK (
  (auth.jwt() ->> 'email'::text) = 'ali_king744@yahoo.com'
);

CREATE POLICY "Users cannot delete credits" 
ON public.user_credits 
FOR DELETE 
TO authenticated
USING (
  (auth.jwt() ->> 'email'::text) = 'ali_king744@yahoo.com'
);

-- Also add explicit INSERT policy for admin
CREATE POLICY "Only admin can insert credits" 
ON public.user_credits 
FOR INSERT 
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'email'::text) = 'ali_king744@yahoo.com'
);

-- Drop the duplicate policy we tried to create
DROP POLICY IF EXISTS "Non-admins cannot insert credits" ON public.user_credits;