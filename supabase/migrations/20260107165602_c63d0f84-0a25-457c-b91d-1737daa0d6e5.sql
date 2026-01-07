-- بهبود امنیت جدول candidates
-- حذف پالیسی‌های قبلی و ایجاد پالیسی‌های سخت‌تر

-- ابتدا پالیسی‌های موجود candidates را بررسی و بازنویسی می‌کنیم
DROP POLICY IF EXISTS "Users can view their campaign candidates" ON public.candidates;
DROP POLICY IF EXISTS "Users can insert candidates to their campaigns" ON public.candidates;
DROP POLICY IF EXISTS "Users can update their campaign candidates" ON public.candidates;
DROP POLICY IF EXISTS "Users can delete their campaign candidates" ON public.candidates;

-- پالیسی جدید: فقط صاحب کمپین می‌تواند کاندیداها را ببیند
CREATE POLICY "Campaign owners can view candidates"
ON public.candidates
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = candidates.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

-- پالیسی جدید: فقط صاحب کمپین می‌تواند کاندیدا اضافه کند
CREATE POLICY "Campaign owners can insert candidates"
ON public.candidates
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = candidates.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

-- پالیسی جدید: فقط صاحب کمپین می‌تواند کاندیدا را ویرایش کند
CREATE POLICY "Campaign owners can update candidates"
ON public.candidates
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = candidates.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

-- پالیسی جدید: فقط صاحب کمپین می‌تواند کاندیدا را حذف کند
CREATE POLICY "Campaign owners can delete candidates"
ON public.candidates
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = candidates.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

-- بهبود امنیت جدول audit_logs
-- محدود کردن دسترسی فقط به ادمین‌های احراز هویت شده
DROP POLICY IF EXISTS "Admin can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- فقط ادمین‌های احراز هویت شده می‌توانند لاگ‌ها را ببینند
CREATE POLICY "Authenticated admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);

-- سیستم می‌تواند لاگ اضافه کند (برای ثبت خودکار)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ایجاد فانکشن برای hash کردن IP قبل از ذخیره
CREATE OR REPLACE FUNCTION public.hash_ip_address(ip text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF ip IS NULL THEN
    RETURN NULL;
  END IF;
  -- Hash IP with a salt for privacy
  RETURN encode(sha256(concat(ip, 'lovable_salt_2024')::bytea), 'hex');
END;
$$;