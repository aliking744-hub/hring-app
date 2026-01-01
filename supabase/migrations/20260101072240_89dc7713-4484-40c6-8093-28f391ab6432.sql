-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  avatar_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can view active testimonials
CREATE POLICY "Anyone can view active testimonials"
ON public.testimonials
FOR SELECT
USING (is_active = true);

-- Admin can manage all testimonials
CREATE POLICY "Admin can manage testimonials"
ON public.testimonials
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial testimonials
INSERT INTO public.testimonials (name, role, company, content, rating, display_order) VALUES
('سارا احمدی', 'مدیر منابع انسانی', 'شرکت فناوران نوین', 'با استفاده از HRing، زمان استخدام ما از ۴۵ روز به ۱۲ روز کاهش یافت. ابزار هدهانتینگ هوشمند واقعاً بی‌نظیر است.', 5, 1),
('محمد رضایی', 'مدیرعامل', 'استارتاپ دیجیتال', 'قطب‌نمای استراتژیک به ما کمک کرد تا تصمیمات بهتری بگیریم. اکنون تیم ما هماهنگ‌تر از همیشه کار می‌کند.', 5, 2),
('مریم حسینی', 'رئیس واحد جذب', 'هلدینگ پارسیان', 'ماژول آنبوردینگ HRing فرآیند ورود کارمندان جدید را کاملاً متحول کرد. نرخ ماندگاری ما ۳۰٪ افزایش یافته.', 5, 3),
('علی کریمی', 'مدیر عملیات', 'گروه صنعتی آریا', 'ماشین‌حساب هزینه و ابزارهای تحلیلی HRing به ما دید کاملی از هزینه‌های منابع انسانی داده است.', 4, 4);