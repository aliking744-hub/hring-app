-- Fix support_chat_logs: Remove dangerous "System can manage" policy and create proper ones
DROP POLICY IF EXISTS "System can manage chat logs" ON public.support_chat_logs;

-- Users can only view their own chat logs
DROP POLICY IF EXISTS "Users can view own chat logs" ON public.support_chat_logs;
CREATE POLICY "Users can view own chat logs" 
ON public.support_chat_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own chat logs
CREATE POLICY "Users can insert own chat logs" 
ON public.support_chat_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own chat logs
CREATE POLICY "Users can update own chat logs" 
ON public.support_chat_logs 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Fix credit_transactions: Remove dangerous "System can insert" policy
DROP POLICY IF EXISTS "System can insert transactions" ON public.credit_transactions;

-- Only allow inserts via authenticated users for their own transactions
-- Note: For system transactions, use service role key in edge functions
CREATE POLICY "Users can insert own transactions" 
ON public.credit_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);