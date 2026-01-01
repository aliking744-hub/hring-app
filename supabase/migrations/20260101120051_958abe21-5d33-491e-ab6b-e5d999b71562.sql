-- 1. Create audit_logs table for tracking sensitive data access
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admin can view all audit logs"
ON public.audit_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- 2. Create function to log candidate access
CREATE OR REPLACE FUNCTION public.log_candidate_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, details)
  VALUES (
    auth.uid(),
    TG_OP,
    'candidates',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'campaign_id', COALESCE(NEW.campaign_id, OLD.campaign_id),
      'candidate_name', COALESCE(NEW.name, OLD.name)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for candidate access logging
DROP TRIGGER IF EXISTS log_candidate_access_trigger ON public.candidates;
CREATE TRIGGER log_candidate_access_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.candidates
FOR EACH ROW EXECUTE FUNCTION public.log_candidate_access();

-- 3. Fix company_members role escalation - drop and recreate stricter policies

-- Drop the problematic policy that allows users with invite permission to add members
DROP POLICY IF EXISTS "Users with invite permission can add members" ON public.company_members;

-- Create stricter policy: users with invite permission can only add employees, not elevated roles
CREATE POLICY "Users with invite permission can only add employees"
ON public.company_members FOR INSERT
WITH CHECK (
  -- The new member must be an employee (lowest role)
  role = 'employee'::company_role
  AND
  -- The inviter must have invite permission
  EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.user_id = auth.uid()
    AND cm.company_id = company_members.company_id
    AND cm.can_invite = true
    AND cm.is_active = true
  )
);

-- Add policy to prevent role changes except by CEO
DROP POLICY IF EXISTS "CEO can manage company members" ON public.company_members;

-- CEO can do everything
CREATE POLICY "CEO can manage company members"
ON public.company_members FOR ALL
USING (get_company_role(auth.uid(), company_id) = 'ceo'::company_role)
WITH CHECK (get_company_role(auth.uid(), company_id) = 'ceo'::company_role);

-- Add constraint to prevent self-role escalation
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_role company_role;
BEGIN
  -- Get the role of the user making the change
  SELECT role INTO actor_role
  FROM public.company_members
  WHERE user_id = auth.uid() AND company_id = NEW.company_id AND is_active = true
  LIMIT 1;
  
  -- Only CEO can assign roles other than employee
  IF NEW.role != 'employee'::company_role AND actor_role != 'ceo'::company_role THEN
    RAISE EXCEPTION 'Only CEO can assign roles other than employee';
  END IF;
  
  -- Prevent changing own role
  IF NEW.user_id = auth.uid() AND TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    RAISE EXCEPTION 'Cannot change your own role';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.company_members;
CREATE TRIGGER prevent_role_escalation_trigger
BEFORE INSERT OR UPDATE ON public.company_members
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- 4. Add function to log profile access for admin views
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log admin access to other users' profiles
  IF auth.uid() != NEW.id AND has_role(auth.uid(), 'admin'::app_role) THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, details)
    VALUES (
      auth.uid(),
      'ADMIN_VIEW',
      'profiles',
      NEW.id,
      jsonb_build_object('viewed_email', NEW.email)
    );
  END IF;
  RETURN NEW;
END;
$$;