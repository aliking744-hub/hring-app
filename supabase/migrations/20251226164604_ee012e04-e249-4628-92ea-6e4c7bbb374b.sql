-- Drop the problematic UPDATE policy (credits should only be modified via deduct_credits function)
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;

-- The INSERT is handled by the trigger with SECURITY DEFINER, so no INSERT policy needed for users
-- The SELECT policy is fine - users can view their own credits

-- Create a more restrictive policy comment for documentation
COMMENT ON TABLE public.user_credits IS 'User credits table. INSERT handled by trigger on auth.users. UPDATE only via deduct_credits() function. Users can only SELECT their own records.';