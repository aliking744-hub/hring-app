-- =============================================
-- STRENGTHEN REMAINING POLICIES - PART 3
-- =============================================

-- 18. profiles - already fixed earlier, update admin policies
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
CREATE POLICY "Admin can update all profiles"
ON public.profiles FOR UPDATE
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
CREATE POLICY "Admin can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- 19. scenario_responses
DROP POLICY IF EXISTS "CEO can view all responses" ON public.scenario_responses;
CREATE POLICY "CEO can view all responses"
ON public.scenario_responses FOR SELECT
USING (auth.uid() IS NOT NULL AND is_ceo(auth.uid()));

DROP POLICY IF EXISTS "Users can manage their responses" ON public.scenario_responses;
CREATE POLICY "Users can manage their responses"
ON public.scenario_responses FOR ALL
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 20. scenarios
DROP POLICY IF EXISTS "CEO can manage scenarios" ON public.scenarios;
CREATE POLICY "CEO can manage scenarios"
ON public.scenarios FOR ALL
USING (auth.uid() IS NOT NULL AND is_ceo(auth.uid()));

-- 21. site_feedback
DROP POLICY IF EXISTS "Admin can view all feedback" ON public.site_feedback;
CREATE POLICY "Admin can view all feedback"
ON public.site_feedback FOR SELECT
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin can manage feedback" ON public.site_feedback;
CREATE POLICY "Admin can manage feedback"
ON public.site_feedback FOR ALL
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view own feedback" ON public.site_feedback;
CREATE POLICY "Users can view own feedback"
ON public.site_feedback FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create feedback" ON public.site_feedback;
CREATE POLICY "Users can create feedback"
ON public.site_feedback FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 22. strategic_achievements
DROP POLICY IF EXISTS "All compass users can view achievements" ON public.strategic_achievements;
CREATE POLICY "All compass users can view achievements"
ON public.strategic_achievements FOR SELECT
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM compass_user_roles WHERE compass_user_roles.user_id = auth.uid()
));

DROP POLICY IF EXISTS "CEO can view all achievements" ON public.strategic_achievements;
CREATE POLICY "CEO can view all achievements"
ON public.strategic_achievements FOR SELECT
USING (auth.uid() IS NOT NULL AND is_ceo(auth.uid()));

DROP POLICY IF EXISTS "CEO can manage achievements" ON public.strategic_achievements;
CREATE POLICY "CEO can manage achievements"
ON public.strategic_achievements FOR ALL
USING (auth.uid() IS NOT NULL AND is_ceo(auth.uid()));

DROP POLICY IF EXISTS "Users can create their achievements" ON public.strategic_achievements;
CREATE POLICY "Users can create their achievements"
ON public.strategic_achievements FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM compass_user_roles WHERE compass_user_roles.user_id = auth.uid()
));

-- 23. strategic_bets
DROP POLICY IF EXISTS "CEO can manage bets" ON public.strategic_bets;
CREATE POLICY "CEO can manage bets"
ON public.strategic_bets FOR ALL
USING (auth.uid() IS NOT NULL AND is_ceo(auth.uid()));

-- 24. strategic_intents
DROP POLICY IF EXISTS "CEO can manage intents" ON public.strategic_intents;
CREATE POLICY "CEO can manage intents"
ON public.strategic_intents FOR ALL
USING (auth.uid() IS NOT NULL AND is_ceo(auth.uid()));

-- 25. support_chat_logs
DROP POLICY IF EXISTS "Admin can view all chat logs" ON public.support_chat_logs;
CREATE POLICY "Admin can view all chat logs"
ON public.support_chat_logs FOR SELECT
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view own chat logs" ON public.support_chat_logs;
CREATE POLICY "Users can view own chat logs"
ON public.support_chat_logs FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own chat logs" ON public.support_chat_logs;
CREATE POLICY "Users can update own chat logs"
ON public.support_chat_logs FOR UPDATE
USING (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR user_id IS NULL));

DROP POLICY IF EXISTS "Users can insert own chat logs" ON public.support_chat_logs;
CREATE POLICY "Users can insert own chat logs"
ON public.support_chat_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR user_id IS NULL));

-- 26. user_credits
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
CREATE POLICY "Users can view their own credits"
ON public.user_credits FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage all credits" ON public.user_credits;
CREATE POLICY "Admin can manage all credits"
ON public.user_credits FOR ALL
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Deny anonymous access to user_credits" ON public.user_credits;

-- 27. user_purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.user_purchases;
CREATE POLICY "Users can view their own purchases"
ON public.user_purchases FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.user_purchases;
CREATE POLICY "Users can insert their own purchases"
ON public.user_purchases FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all purchases" ON public.user_purchases;
CREATE POLICY "Admin can view all purchases"
ON public.user_purchases FOR SELECT
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin can manage purchases" ON public.user_purchases;
CREATE POLICY "Admin can manage purchases"
ON public.user_purchases FOR ALL
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 28. user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admin can insert roles" ON public.user_roles;
CREATE POLICY "Only admin can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admin can delete roles" ON public.user_roles;
CREATE POLICY "Only admin can delete roles"
ON public.user_roles FOR DELETE
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "No one can update roles" ON public.user_roles;
CREATE POLICY "No one can update roles"
ON public.user_roles FOR UPDATE
USING (false);

DROP POLICY IF EXISTS "Deny anonymous access to user_roles" ON public.user_roles;