-- =============================================
-- STRENGTHEN REMAINING POLICIES - PART 2
-- =============================================

-- 10. credit_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view their own transactions"
ON public.credit_transactions FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Company members can view company transactions" ON public.credit_transactions;
CREATE POLICY "Company members can view company transactions"
ON public.credit_transactions FOR SELECT
USING (auth.uid() IS NOT NULL AND is_company_member(auth.uid(), company_id));

DROP POLICY IF EXISTS "Super admin can view all transactions" ON public.credit_transactions;
CREATE POLICY "Super admin can view all transactions"
ON public.credit_transactions FOR SELECT
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.credit_transactions;
CREATE POLICY "Users can insert own transactions"
ON public.credit_transactions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 11. decision_journals
DROP POLICY IF EXISTS "CEO can view all journals" ON public.decision_journals;
CREATE POLICY "CEO can view all journals"
ON public.decision_journals FOR SELECT
USING (auth.uid() IS NOT NULL AND is_ceo(auth.uid()));

DROP POLICY IF EXISTS "Users can manage their journals" ON public.decision_journals;
CREATE POLICY "Users can manage their journals"
ON public.decision_journals FOR ALL
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM behaviors WHERE behaviors.id = decision_journals.behavior_id AND behaviors.deputy_id = auth.uid()
));

-- 12. intent_assignments
DROP POLICY IF EXISTS "CEO can manage assignments" ON public.intent_assignments;
CREATE POLICY "CEO can manage assignments"
ON public.intent_assignments FOR ALL
USING (auth.uid() IS NOT NULL AND is_ceo(auth.uid()));

DROP POLICY IF EXISTS "Users can view their assignments" ON public.intent_assignments;
CREATE POLICY "Users can view their assignments"
ON public.intent_assignments FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 13. legal_conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.legal_conversations;
CREATE POLICY "Users can view their own conversations"
ON public.legal_conversations FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own conversations" ON public.legal_conversations;
CREATE POLICY "Users can create their own conversations"
ON public.legal_conversations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.legal_conversations;
CREATE POLICY "Users can update their own conversations"
ON public.legal_conversations FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.legal_conversations;
CREATE POLICY "Users can delete their own conversations"
ON public.legal_conversations FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 14. legal_docs
DROP POLICY IF EXISTS "Authenticated users can read legal docs" ON public.legal_docs;
CREATE POLICY "Authenticated users can read legal docs"
ON public.legal_docs FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin can manage legal docs" ON public.legal_docs;
CREATE POLICY "Admin can manage legal docs"
ON public.legal_docs FOR ALL
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 15. legal_messages
DROP POLICY IF EXISTS "Users can view messages of their conversations" ON public.legal_messages;
CREATE POLICY "Users can view messages of their conversations"
ON public.legal_messages FOR SELECT
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM legal_conversations WHERE legal_conversations.id = legal_messages.conversation_id AND legal_conversations.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.legal_messages;
CREATE POLICY "Users can create messages in their conversations"
ON public.legal_messages FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM legal_conversations WHERE legal_conversations.id = legal_messages.conversation_id AND legal_conversations.user_id = auth.uid()
));

-- 16. notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage all notifications" ON public.notifications;
CREATE POLICY "Admin can manage all notifications"
ON public.notifications FOR ALL
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 17. payment_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.payment_transactions;
CREATE POLICY "Users can view their own payment transactions"
ON public.payment_transactions FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Company members can view company transactions" ON public.payment_transactions;
CREATE POLICY "Company members can view company payment transactions"
ON public.payment_transactions FOR SELECT
USING (auth.uid() IS NOT NULL AND is_company_member(auth.uid(), company_id));

DROP POLICY IF EXISTS "Admin can manage all transactions" ON public.payment_transactions;
CREATE POLICY "Admin can manage all payment transactions"
ON public.payment_transactions FOR ALL
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));