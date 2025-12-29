-- ========================================
-- Fix: Replace hardcoded email with has_role function in all RLS policies
-- ========================================

-- 1. Fix user_credits policies
DROP POLICY IF EXISTS "Admin can manage all credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users cannot update credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users cannot delete credits" ON public.user_credits;
DROP POLICY IF EXISTS "Only admin can insert credits" ON public.user_credits;

CREATE POLICY "Admin can manage all credits" 
ON public.user_credits 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Fix posts policies
DROP POLICY IF EXISTS "Admin can manage all posts" ON public.posts;

CREATE POLICY "Admin can manage all posts" 
ON public.posts 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Fix site_settings policies
DROP POLICY IF EXISTS "Admin can manage site settings" ON public.site_settings;

CREATE POLICY "Admin can manage site settings" 
ON public.site_settings 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Fix user_roles policies (add missing INSERT/UPDATE/DELETE)
CREATE POLICY "Only admin can insert roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "No one can update roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (false);

CREATE POLICY "Only admin can delete roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));