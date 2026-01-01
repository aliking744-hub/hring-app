-- Create site_feedback table for user reviews
CREATE TABLE public.site_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  rewarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_feedback ENABLE ROW LEVEL SECURITY;

-- Users can create their own feedback
CREATE POLICY "Users can create feedback"
ON public.site_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
ON public.site_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- Admin can view all feedback
CREATE POLICY "Admin can view all feedback"
ON public.site_feedback
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can manage all feedback
CREATE POLICY "Admin can manage feedback"
ON public.site_feedback
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create support_chat_logs table for chat history
CREATE TABLE public.support_chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_chat_logs ENABLE ROW LEVEL SECURITY;

-- System can insert/update chat logs
CREATE POLICY "System can manage chat logs"
ON public.support_chat_logs
FOR ALL
USING (true)
WITH CHECK (true);

-- Admin can view all chat logs
CREATE POLICY "Admin can view all chat logs"
ON public.support_chat_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own chat logs
CREATE POLICY "Users can view own chat logs"
ON public.support_chat_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_support_chat_logs_updated_at
BEFORE UPDATE ON public.support_chat_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings for support chatbot
INSERT INTO public.site_settings (key, label, value) VALUES
('support_phone', 'شماره تماس پشتیبانی', '09123456789'),
('support_system_prompt', 'دستورالعمل چت‌بات پشتیبانی', 'تو یک دستیار پشتیبانی فوق‌العاده مودب، فروتن و صمیمی هستی که به زبان فارسی عامیانه ولی بسیار محترمانه صحبت می‌کنی. همیشه پاسخت رو با یک عذرخواهی بابت معطل شدن یا تشکر گرم شروع کن. فقط و فقط در مورد: نحوه استفاده از سایت، امکانات داشبورد، پلن‌های قیمت‌گذاری و راهنمای خرید پاسخ بده. اگر کسی در مورد "مشاوره حقوقی" یا "قانون کار" سوال کرد، مودبانه عذرخواهی کن و بگو: "شرمنده‌تونم، سواد من به این چیزا نمی‌رسه. برای راهنمایی دقیق و تخصصی لطفاً از بخش وکیل جیبی داخل پنل استفاده کنید." اگر موضوع نامربوط بود یا گیج شدی بگو: "قربان باز هم عذر میخوام، برای اینکه معطل نشید پیشنهاد میکنم مستقیم با مدیریت صحبت کنید: {SUPPORT_PHONE}"')
ON CONFLICT (key) DO NOTHING;