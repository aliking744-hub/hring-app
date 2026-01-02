-- Fix strategic_bets: Require authentication for viewing bets
DROP POLICY IF EXISTS "Users can view bets" ON public.strategic_bets;

CREATE POLICY "Authenticated users can view bets"
ON public.strategic_bets
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix scenarios: Require authentication for viewing active scenarios
DROP POLICY IF EXISTS "Users can view active scenarios" ON public.scenarios;

CREATE POLICY "Authenticated users can view active scenarios"
ON public.scenarios
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Fix strategic_intents: Require authentication for viewing active intents
DROP POLICY IF EXISTS "Users can view active intents" ON public.strategic_intents;

CREATE POLICY "Authenticated users can view active intents"
ON public.strategic_intents
FOR SELECT
USING (auth.uid() IS NOT NULL AND status = 'active');

-- Fix user_roles: The deny policy is using false which blocks nothing useful
-- Keep the existing policies but they already check auth.uid()

-- Fix user_credits: Already has proper auth checks

-- Note: Some tables like site_settings, digital_products, posts, testimonials, 
-- feature_permissions are intentionally public for website functionality