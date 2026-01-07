-- ایجاد trigger function برای hash کردن خودکار IP
CREATE OR REPLACE FUNCTION public.hash_ip_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Hash کردن IP قبل از ذخیره
  IF NEW.ip_address IS NOT NULL THEN
    NEW.ip_address := public.hash_ip_address(NEW.ip_address);
  END IF;
  RETURN NEW;
END;
$$;

-- ایجاد trigger روی جدول audit_logs
DROP TRIGGER IF EXISTS hash_ip_on_audit_log ON public.audit_logs;

CREATE TRIGGER hash_ip_on_audit_log
BEFORE INSERT ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.hash_ip_before_insert();