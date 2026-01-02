-- Fix 1: Drop the ineffective "Deny anonymous access to profiles" policy
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- Create proper policy that requires authentication for viewing profiles
CREATE POLICY "Authenticated users only for profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL AND (auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role)));

-- Fix 2: Add authentication requirement for candidates table
DROP POLICY IF EXISTS "Deny anonymous access to candidates" ON public.candidates;

-- Drop existing SELECT policy and recreate with auth check
DROP POLICY IF EXISTS "Users can view candidates of their campaigns" ON public.candidates;

CREATE POLICY "Users can view candidates of their campaigns"
ON public.candidates
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = candidates.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);