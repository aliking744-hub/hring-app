-- Create site_settings table for managing site texts
CREATE TABLE public.site_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL UNIQUE,
    value text,
    label text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings (for frontend)
CREATE POLICY "Anyone can read site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Allow admin email to manage settings
CREATE POLICY "Admin can manage site settings"
ON public.site_settings
FOR ALL
USING (auth.jwt() ->> 'email' = 'ali_king744@yahoo.com')
WITH CHECK (auth.jwt() ->> 'email' = 'ali_king744@yahoo.com');

-- Add update trigger
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.site_settings (key, value, label) VALUES
('hero_title', 'دستیار هوشمند منابع انسانی', 'عنوان هیرو'),
('hero_subtitle', 'ابزارهای هوشمند برای مدیریت بهتر منابع انسانی', 'زیرعنوان هیرو'),
('features_title', 'امکانات', 'عنوان بخش امکانات'),
('footer_text', 'تمامی حقوق محفوظ است', 'متن فوتر');

-- Update admin RLS policy for posts to use email
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.posts;
CREATE POLICY "Admin can manage all posts"
ON public.posts
FOR ALL
USING (auth.jwt() ->> 'email' = 'ali_king744@yahoo.com')
WITH CHECK (auth.jwt() ->> 'email' = 'ali_king744@yahoo.com');

-- Update profiles RLS for admin access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
ON public.profiles
FOR SELECT
USING (auth.jwt() ->> 'email' = 'ali_king744@yahoo.com');

-- Allow admin to manage user_credits
CREATE POLICY "Admin can manage all credits"
ON public.user_credits
FOR ALL
USING (auth.jwt() ->> 'email' = 'ali_king744@yahoo.com')
WITH CHECK (auth.jwt() ->> 'email' = 'ali_king744@yahoo.com');