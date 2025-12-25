-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create user_credits table
CREATE TABLE public.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Users can view their own credits
CREATE POLICY "Users can view their own credits"
ON public.user_credits
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own credits (for deduction)
CREATE POLICY "Users can update their own credits"
ON public.user_credits
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to create credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_credits (user_id, credits)
    VALUES (NEW.id, 50);
    RETURN NEW;
END;
$$;

-- Trigger to auto-create credits on user signup
CREATE TRIGGER on_auth_user_created_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    SELECT credits INTO current_credits
    FROM public.user_credits
    WHERE user_id = auth.uid();
    
    IF current_credits >= amount THEN
        UPDATE public.user_credits
        SET credits = credits - amount, updated_at = now()
        WHERE user_id = auth.uid();
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

-- Function to get user credits
CREATE OR REPLACE FUNCTION public.get_user_credits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_credits INTEGER;
BEGIN
    SELECT credits INTO user_credits
    FROM public.user_credits
    WHERE user_id = auth.uid();
    
    RETURN COALESCE(user_credits, 0);
END;
$$;

-- Trigger to update updated_at on user_credits
CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON public.user_credits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();