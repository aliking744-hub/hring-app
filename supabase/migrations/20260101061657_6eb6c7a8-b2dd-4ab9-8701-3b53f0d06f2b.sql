-- Create payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  plan_type TEXT NOT NULL,
  authority TEXT,
  ref_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  gateway TEXT NOT NULL DEFAULT 'zarinpal',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Company members can view company transactions"
ON public.payment_transactions
FOR SELECT
USING (is_company_member(auth.uid(), company_id));

CREATE POLICY "System can insert transactions"
ON public.payment_transactions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update transactions"
ON public.payment_transactions
FOR UPDATE
USING (true);

CREATE POLICY "Admin can manage all transactions"
ON public.payment_transactions
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Update trigger
CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();