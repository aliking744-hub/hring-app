-- Create strategic_achievements table
CREATE TABLE public.strategic_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  department_id TEXT NOT NULL,
  department_name TEXT NOT NULL,
  strategic_importance INTEGER NOT NULL DEFAULT 5 CHECK (strategic_importance >= 1 AND strategic_importance <= 10),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.strategic_achievements ENABLE ROW LEVEL SECURITY;

-- CEO can view all achievements
CREATE POLICY "CEO can view all achievements"
ON public.strategic_achievements
FOR SELECT
USING (is_ceo(auth.uid()));

-- CEO can manage all achievements
CREATE POLICY "CEO can manage achievements"
ON public.strategic_achievements
FOR ALL
USING (is_ceo(auth.uid()));

-- Users can view all achievements (for the tree visualization)
CREATE POLICY "All compass users can view achievements"
ON public.strategic_achievements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM compass_user_roles 
    WHERE user_id = auth.uid()
  )
);

-- Users can create their own achievements
CREATE POLICY "Users can create their achievements"
ON public.strategic_achievements
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM compass_user_roles 
    WHERE user_id = auth.uid()
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.strategic_achievements;

-- Insert sample data for visualization
INSERT INTO public.strategic_achievements (user_id, name, owner_name, department_id, department_name, strategic_importance) VALUES
('00000000-0000-0000-0000-000000000000', 'استراتژی توسعه بین‌المللی', 'علی محمدی', 'sales', 'فروش', 10),
('00000000-0000-0000-0000-000000000000', 'معماری سیستم جدید', 'سارا احمدی', 'tech', 'فناوری', 9),
('00000000-0000-0000-0000-000000000000', 'برنامه تحول دیجیتال', 'محمد رضایی', 'tech', 'فناوری', 10),
('00000000-0000-0000-0000-000000000000', 'استراتژی برندینگ', 'زهرا کریمی', 'marketing', 'بازاریابی', 9),
('00000000-0000-0000-0000-000000000000', 'چشم‌انداز مالی ۵ ساله', 'حسین علوی', 'finance', 'مالی', 8),
('00000000-0000-0000-0000-000000000000', 'بهینه‌سازی فرآیند فروش', 'مریم حسینی', 'sales', 'فروش', 7),
('00000000-0000-0000-0000-000000000000', 'توسعه API جدید', 'امیر نوری', 'tech', 'فناوری', 6),
('00000000-0000-0000-0000-000000000000', 'برنامه آموزش کارکنان', 'فاطمه صادقی', 'hr', 'منابع انسانی', 7),
('00000000-0000-0000-0000-000000000000', 'کمپین تبلیغاتی', 'رضا باقری', 'marketing', 'بازاریابی', 6),
('00000000-0000-0000-0000-000000000000', 'بهبود زنجیره تأمین', 'نازنین موسوی', 'operations', 'عملیات', 7),
('00000000-0000-0000-0000-000000000000', 'سیستم CRM جدید', 'کاوه رحیمی', 'sales', 'فروش', 5),
('00000000-0000-0000-0000-000000000000', 'امنیت سایبری', 'پریسا شریفی', 'tech', 'فناوری', 6),
('00000000-0000-0000-0000-000000000000', 'گزارش ماهانه فروش', 'داود کاظمی', 'sales', 'فروش', 3),
('00000000-0000-0000-0000-000000000000', 'به‌روزرسانی سرورها', 'بهرام فرهادی', 'tech', 'فناوری', 2),
('00000000-0000-0000-0000-000000000000', 'استخدام کارشناس', 'لیلا حیدری', 'hr', 'منابع انسانی', 4),
('00000000-0000-0000-0000-000000000000', 'تسویه حساب‌ها', 'آرش نیکو', 'finance', 'مالی', 2),
('00000000-0000-0000-0000-000000000000', 'مدیریت شبکه‌های اجتماعی', 'شیما خسروی', 'marketing', 'بازاریابی', 3),
('00000000-0000-0000-0000-000000000000', 'بازرسی انبار', 'کامران فتحی', 'operations', 'عملیات', 1),
('00000000-0000-0000-0000-000000000000', 'پشتیبانی مشتریان', 'مینا قاسمی', 'sales', 'فروش', 4),
('00000000-0000-0000-0000-000000000000', 'مستندسازی فنی', 'سینا یزدانی', 'tech', 'فناوری', 3);