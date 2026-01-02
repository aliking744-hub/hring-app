-- =============================================
-- STRENGTHEN ALL POLICIES WITH EXPLICIT AUTH CHECKS
-- =============================================

-- 1. audit_logs
DROP POLICY IF EXISTS "Admin can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admin can view all audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 2. behaviors
DROP POLICY IF EXISTS "CEO can view all behaviors" ON public.behaviors;
CREATE POLICY "CEO can view all behaviors"
ON public.behaviors FOR SELECT
USING (auth.uid() IS NOT NULL AND is_ceo(auth.uid()));

DROP POLICY IF EXISTS "Users can manage their behaviors" ON public.behaviors;
CREATE POLICY "Users can manage their behaviors"
ON public.behaviors FOR ALL
USING (auth.uid() IS NOT NULL AND auth.uid() = deputy_id);

-- 3. bet_allocations
DROP POLICY IF EXISTS "CEO can view all allocations" ON public.bet_allocations;
CREATE POLICY "CEO can view all allocations"
ON public.bet_allocations FOR SELECT
USING (auth.uid() IS NOT NULL AND is_ceo(auth.uid()));

DROP POLICY IF EXISTS "Users can manage their allocations" ON public.bet_allocations;
CREATE POLICY "Users can manage their allocations"
ON public.bet_allocations FOR ALL
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 4. campaigns
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
CREATE POLICY "Users can view their own campaigns"
ON public.campaigns FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
CREATE POLICY "Users can update their own campaigns"
ON public.campaigns FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;
CREATE POLICY "Users can delete their own campaigns"
ON public.campaigns FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 5. candidates (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Users can create candidates for their campaigns" ON public.candidates;
CREATE POLICY "Users can create candidates for their campaigns"
ON public.candidates FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM campaigns WHERE campaigns.id = candidates.campaign_id AND campaigns.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can update candidates of their campaigns" ON public.candidates;
CREATE POLICY "Users can update candidates of their campaigns"
ON public.candidates FOR UPDATE
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM campaigns WHERE campaigns.id = candidates.campaign_id AND campaigns.user_id = auth.uid()
))
WITH CHECK (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM campaigns WHERE campaigns.id = candidates.campaign_id AND campaigns.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can delete candidates of their campaigns" ON public.candidates;
CREATE POLICY "Users can delete candidates of their campaigns"
ON public.candidates FOR DELETE
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM campaigns WHERE campaigns.id = candidates.campaign_id AND campaigns.user_id = auth.uid()
));

-- 6. companies
DROP POLICY IF EXISTS "Company members can view their company" ON public.companies;
CREATE POLICY "Company members can view their company"
ON public.companies FOR SELECT
USING (auth.uid() IS NOT NULL AND is_company_member(auth.uid(), id));

DROP POLICY IF EXISTS "CEO can update their company" ON public.companies;
CREATE POLICY "CEO can update their company"
ON public.companies FOR UPDATE
USING (auth.uid() IS NOT NULL AND is_company_member(auth.uid(), id) AND get_company_role(auth.uid(), id) = 'ceo'::company_role);

DROP POLICY IF EXISTS "Super admin can manage all companies" ON public.companies;
CREATE POLICY "Super admin can manage all companies"
ON public.companies FOR ALL
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 7. company_invites (keep invite code readable for joining)
DROP POLICY IF EXISTS "Company CEO/deputies can manage invites" ON public.company_invites;
CREATE POLICY "Company CEO/deputies can manage invites"
ON public.company_invites FOR ALL
USING (auth.uid() IS NOT NULL AND get_company_role(auth.uid(), company_id) = ANY (ARRAY['ceo'::company_role, 'deputy'::company_role]))
WITH CHECK (auth.uid() IS NOT NULL AND get_company_role(auth.uid(), company_id) = ANY (ARRAY['ceo'::company_role, 'deputy'::company_role]));

DROP POLICY IF EXISTS "Super admin can manage all invites" ON public.company_invites;
CREATE POLICY "Super admin can manage all invites"
ON public.company_invites FOR ALL
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 8. company_members
DROP POLICY IF EXISTS "Members can view their company members" ON public.company_members;
CREATE POLICY "Members can view their company members"
ON public.company_members FOR SELECT
USING (auth.uid() IS NOT NULL AND is_company_member(auth.uid(), company_id));

DROP POLICY IF EXISTS "CEO can manage company members" ON public.company_members;
CREATE POLICY "CEO can manage company members"
ON public.company_members FOR ALL
USING (auth.uid() IS NOT NULL AND get_company_role(auth.uid(), company_id) = 'ceo'::company_role)
WITH CHECK (auth.uid() IS NOT NULL AND get_company_role(auth.uid(), company_id) = 'ceo'::company_role);

DROP POLICY IF EXISTS "Super admin can manage all members" ON public.company_members;
CREATE POLICY "Super admin can manage all members"
ON public.company_members FOR ALL
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users with invite permission can only add employees" ON public.company_members;
CREATE POLICY "Users with invite permission can only add employees"
ON public.company_members FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND role = 'employee'::company_role AND EXISTS (
  SELECT 1 FROM company_members cm
  WHERE cm.user_id = auth.uid() AND cm.company_id = company_members.company_id AND cm.can_invite = true AND cm.is_active = true
));

-- 9. compass_user_roles
DROP POLICY IF EXISTS "Admin can manage all compass roles" ON public.compass_user_roles;
CREATE POLICY "Admin can manage all compass roles"
ON public.compass_user_roles FOR ALL
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "CEO can manage roles" ON public.compass_user_roles;
CREATE POLICY "CEO can manage roles"
ON public.compass_user_roles FOR ALL
USING (auth.uid() IS NOT NULL AND is_ceo(auth.uid()));

DROP POLICY IF EXISTS "Users can view their role" ON public.compass_user_roles;
CREATE POLICY "Users can view their role"
ON public.compass_user_roles FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);