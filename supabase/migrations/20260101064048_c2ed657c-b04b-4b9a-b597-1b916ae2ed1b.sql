-- Add last_credit_reset column to profiles and companies
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_credit_reset TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS last_credit_reset TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add credit_pool column to companies for shared team credits
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS credit_pool INTEGER DEFAULT 0;

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS credit_pool_enabled BOOLEAN DEFAULT false;

-- Create function to reset monthly credits
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tier_credits JSONB := '{
    "free": 50,
    "starter": 200,
    "professional": 500,
    "enterprise": 2000
  }'::JSONB;
BEGIN
  -- Reset individual user credits based on their tier
  UPDATE public.profiles
  SET 
    credits = COALESCE((tier_credits->>subscription_tier)::INTEGER, 50),
    last_credit_reset = now()
  WHERE last_credit_reset < now() - INTERVAL '1 month';
  
  -- Reset company credit pools based on their tier
  UPDATE public.companies
  SET 
    credit_pool = COALESCE((tier_credits->>subscription_tier)::INTEGER, 50),
    last_credit_reset = now()
  WHERE credit_pool_enabled = true 
    AND last_credit_reset < now() - INTERVAL '1 month';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.reset_monthly_credits() TO service_role;