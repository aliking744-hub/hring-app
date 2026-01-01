-- ================================================
-- HRING MULTI-TENANT ARCHITECTURE
-- ================================================

-- 1. Create company_status enum
CREATE TYPE public.company_status AS ENUM ('active', 'suspended', 'trial');

-- 2. Create subscription_tier enum for both individual and corporate
CREATE TYPE public.subscription_tier AS ENUM (
  -- Individual tiers
  'individual_free',
  'individual_expert', 
  'individual_pro',
  'individual_plus',
  -- Corporate tiers
  'corporate_expert',
  'corporate_decision_support',
  'corporate_decision_making'
);

-- 3. Create company_role enum for internal hierarchy
CREATE TYPE public.company_role AS ENUM ('ceo', 'deputy', 'manager', 'employee');

-- 4. Create Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  status company_status NOT NULL DEFAULT 'active',
  subscription_tier subscription_tier NOT NULL DEFAULT 'corporate_expert',
  monthly_credits INTEGER NOT NULL DEFAULT 100,
  used_credits INTEGER NOT NULL DEFAULT 0,
  max_members INTEGER NOT NULL DEFAULT 10,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Add columns to profiles for multi-tenancy
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'individual_free',
ADD COLUMN IF NOT EXISTS monthly_credits INTEGER NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS used_credits INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 6. Create Company Members junction table
CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role company_role NOT NULL DEFAULT 'employee',
  can_invite BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- 7. Create Feature Permissions table (controlled by Super Admin)
CREATE TABLE public.feature_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  feature_category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  -- Which tiers have access
  allowed_tiers subscription_tier[] NOT NULL DEFAULT '{}',
  -- For corporate: which roles can access within allowed companies
  allowed_company_roles company_role[] DEFAULT NULL,
  -- View vs Edit permissions
  allow_view BOOLEAN NOT NULL DEFAULT true,
  allow_edit BOOLEAN NOT NULL DEFAULT false,
  -- Credit cost per use (0 = free)
  credit_cost INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(feature_key)
);

-- 8. Create Company Invite Links table
CREATE TABLE public.company_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  role company_role NOT NULL DEFAULT 'employee',
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 9. Create Credit Transactions table for audit trail
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES public.companies(id),
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'usage', 'purchase', 'refund', 'monthly_reset'
  feature_key TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- ================================================
-- SECURITY DEFINER FUNCTIONS
-- ================================================

-- Function to check if user is member of a company
CREATE OR REPLACE FUNCTION public.is_company_member(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = _user_id 
    AND company_id = _company_id
    AND is_active = true
  )
$$;

-- Function to get user's company role
CREATE OR REPLACE FUNCTION public.get_company_role(_user_id UUID, _company_id UUID)
RETURNS company_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.company_members
  WHERE user_id = _user_id 
  AND company_id = _company_id
  AND is_active = true
  LIMIT 1
$$;

-- Function to check if user is CEO of their company
CREATE OR REPLACE FUNCTION public.is_company_ceo(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = _user_id 
    AND role = 'ceo'
    AND is_active = true
  )
$$;

-- Function to get user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.company_members
  WHERE user_id = _user_id 
  AND is_active = true
  LIMIT 1
$$;

-- ================================================
-- RLS POLICIES
-- ================================================

-- Companies policies
CREATE POLICY "Super admin can manage all companies"
ON public.companies FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Company members can view their company"
ON public.companies FOR SELECT
USING (public.is_company_member(auth.uid(), id));

CREATE POLICY "CEO can update their company"
ON public.companies FOR UPDATE
USING (
  public.is_company_member(auth.uid(), id) 
  AND public.get_company_role(auth.uid(), id) = 'ceo'
);

-- Company Members policies
CREATE POLICY "Super admin can manage all members"
ON public.company_members FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can view their company members"
ON public.company_members FOR SELECT
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "CEO can manage company members"
ON public.company_members FOR ALL
USING (
  public.get_company_role(auth.uid(), company_id) = 'ceo'
)
WITH CHECK (
  public.get_company_role(auth.uid(), company_id) = 'ceo'
);

CREATE POLICY "Users with invite permission can add members"
ON public.company_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
    AND cm.company_id = company_members.company_id
    AND cm.can_invite = true
    AND cm.is_active = true
  )
);

-- Feature Permissions policies (read by all, managed by admin)
CREATE POLICY "Anyone can read feature permissions"
ON public.feature_permissions FOR SELECT
USING (true);

CREATE POLICY "Only super admin can manage feature permissions"
ON public.feature_permissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Company Invites policies
CREATE POLICY "Super admin can manage all invites"
ON public.company_invites FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Company CEO/deputies can manage invites"
ON public.company_invites FOR ALL
USING (
  public.get_company_role(auth.uid(), company_id) IN ('ceo', 'deputy')
)
WITH CHECK (
  public.get_company_role(auth.uid(), company_id) IN ('ceo', 'deputy')
);

CREATE POLICY "Active invites can be read by invite code"
ON public.company_invites FOR SELECT
USING (is_active = true);

-- Credit Transactions policies
CREATE POLICY "Super admin can view all transactions"
ON public.credit_transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own transactions"
ON public.credit_transactions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Company members can view company transactions"
ON public.credit_transactions FOR SELECT
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "System can insert transactions"
ON public.credit_transactions FOR INSERT
WITH CHECK (true);

-- ================================================
-- INSERT DEFAULT FEATURE PERMISSIONS
-- ================================================
INSERT INTO public.feature_permissions (feature_key, feature_name, feature_category, description, allowed_tiers, allowed_company_roles, allow_view, allow_edit, credit_cost) VALUES
-- Strategic Compass features
('strategic_intent', 'نیت استراتژیک', 'قطب‌نمای استراتژی', 'تعریف و مدیریت نیت‌های استراتژیک', 
  ARRAY['individual_expert', 'individual_pro', 'individual_plus', 'corporate_expert', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[], 
  ARRAY['ceo', 'deputy']::company_role[], true, true, 0),

('strategic_behavior', 'رفتار استراتژیک', 'قطب‌نمای استراتژی', 'ثبت و تحلیل رفتارهای استراتژیک',
  ARRAY['individual_expert', 'individual_pro', 'individual_plus', 'corporate_expert', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[],
  ARRAY['ceo', 'deputy', 'manager']::company_role[], true, true, 0),

('strategic_betting', 'شرط‌بندی استراتژیک', 'قطب‌نمای استراتژی', 'شرط‌بندی روی اهداف',
  ARRAY['individual_pro', 'individual_plus', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[],
  ARRAY['ceo', 'deputy', 'manager', 'employee']::company_role[], true, true, 5),

('strategic_erdtree', 'درخت اردتری', 'قطب‌نمای استراتژی', 'نمایش بصری درخت استراتژی',
  ARRAY['individual_expert', 'individual_pro', 'individual_plus', 'corporate_expert', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[],
  ARRAY['ceo', 'deputy', 'manager', 'employee']::company_role[], true, false, 0),

('strategic_analysis', 'تحلیل استراتژیک', 'قطب‌نمای استراتژی', 'تحلیل هوش مصنوعی',
  ARRAY['individual_pro', 'individual_plus', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[],
  ARRAY['ceo', 'deputy']::company_role[], true, true, 10),

('strategic_dream', 'تجلی رویا', 'قطب‌نمای استراتژی', 'مدیریت رویاها و آرزوها',
  ARRAY['individual_plus', 'corporate_decision_making']::subscription_tier[],
  ARRAY['ceo']::company_role[], true, true, 0),

('strategic_prism', 'منشور ذهنی', 'قطب‌نمای استراتژی', 'تحلیل منشور ذهنی',
  ARRAY['individual_pro', 'individual_plus', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[],
  ARRAY['ceo', 'deputy', 'manager']::company_role[], true, true, 5),

('strategic_journal', 'ژورنال تصمیم', 'قطب‌نمای استراتژی', 'ثبت تصمیمات',
  ARRAY['individual_expert', 'individual_pro', 'individual_plus', 'corporate_expert', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[],
  ARRAY['ceo', 'deputy', 'manager']::company_role[], true, true, 0),

-- HR Tools
('job_description', 'مهندسی مشاغل', 'ابزارهای HR', 'تولید شرح شغل',
  ARRAY['individual_free', 'individual_expert', 'individual_pro', 'individual_plus', 'corporate_expert', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[],
  NULL, true, true, 5),

('smart_ad', 'آگهی‌نویس هوشمند', 'ابزارهای HR', 'تولید آگهی استخدام',
  ARRAY['individual_free', 'individual_expert', 'individual_pro', 'individual_plus', 'corporate_expert', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[],
  NULL, true, true, 5),

('interview_assistant', 'دستیار مصاحبه', 'ابزارهای HR', 'کمک در فرآیند مصاحبه',
  ARRAY['individual_expert', 'individual_pro', 'individual_plus', 'corporate_expert', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[],
  NULL, true, true, 5),

('onboarding_roadmap', 'معمار موفقیت', 'ابزارهای HR', 'برنامه آنبوردینگ',
  ARRAY['individual_expert', 'individual_pro', 'individual_plus', 'corporate_expert', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[],
  NULL, true, true, 5),

('hr_dashboard', 'داشبورد HR', 'ابزارهای HR', 'داشبورد تحلیلی منابع انسانی',
  ARRAY['individual_pro', 'individual_plus', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[],
  NULL, true, true, 20),

('headhunting', 'هدهانتینگ هوشمند', 'ابزارهای HR', 'جستجوی استعداد',
  ARRAY['individual_plus', 'corporate_decision_making']::subscription_tier[],
  NULL, true, true, 30),

-- Shop (accessible to all)
('shop_browse', 'فروشگاه - مشاهده', 'فروشگاه', 'مشاهده محصولات',
  ARRAY['individual_free', 'individual_expert', 'individual_pro', 'individual_plus', 'corporate_expert', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[],
  NULL, true, false, 0),

('shop_purchase', 'فروشگاه - خرید', 'فروشگاه', 'خرید محصولات',
  ARRAY['individual_free', 'individual_expert', 'individual_pro', 'individual_plus', 'corporate_expert', 'corporate_decision_support', 'corporate_decision_making']::subscription_tier[],
  NULL, true, true, 0);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX idx_company_members_user ON public.company_members(user_id);
CREATE INDEX idx_company_members_company ON public.company_members(company_id);
CREATE INDEX idx_feature_permissions_key ON public.feature_permissions(feature_key);
CREATE INDEX idx_company_invites_code ON public.company_invites(invite_code);
CREATE INDEX idx_credit_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_company ON public.credit_transactions(company_id);

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_permissions_updated_at
  BEFORE UPDATE ON public.feature_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();