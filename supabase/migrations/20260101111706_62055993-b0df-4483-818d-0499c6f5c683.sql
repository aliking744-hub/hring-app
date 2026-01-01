-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, success, error
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications (for triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Admin can manage all notifications
CREATE POLICY "Admin can manage all notifications"
ON public.notifications
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to notify on low credits
CREATE OR REPLACE FUNCTION public.notify_low_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- If credits dropped below 10
  IF NEW.credits < 10 AND OLD.credits >= 10 THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      'اعتبار کم',
      'اعتبار شما کمتر از ۱۰ واحد شده است. برای ادامه استفاده از سرویس‌ها، اعتبار خود را شارژ کنید.',
      'warning',
      '/upgrade'
    );
  END IF;
  
  -- If credits are zero
  IF NEW.credits = 0 AND OLD.credits > 0 THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      'اعتبار تمام شد',
      'اعتبار شما به پایان رسیده است. برای استفاده از سرویس‌های هوش مصنوعی، اعتبار خود را شارژ کنید.',
      'error',
      '/upgrade'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for low credits notification
CREATE TRIGGER on_credits_change
AFTER UPDATE OF credits ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.notify_low_credits();