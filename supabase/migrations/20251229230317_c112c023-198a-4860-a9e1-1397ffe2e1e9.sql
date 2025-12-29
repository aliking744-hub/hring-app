-- Tighten RLS policies to authenticated role only (avoid anonymous-role warnings)

-- campaigns
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;

CREATE POLICY "Users can view their own campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
ON public.campaigns
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
ON public.campaigns
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
ON public.campaigns
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- candidates
DROP POLICY IF EXISTS "Users can view candidates of their campaigns" ON public.candidates;
DROP POLICY IF EXISTS "Users can create candidates for their campaigns" ON public.candidates;
DROP POLICY IF EXISTS "Users can update candidates of their campaigns" ON public.candidates;
DROP POLICY IF EXISTS "Users can delete candidates of their campaigns" ON public.candidates;

CREATE POLICY "Users can view candidates of their campaigns"
ON public.candidates
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.campaigns
    WHERE campaigns.id = candidates.campaign_id
      AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create candidates for their campaigns"
ON public.candidates
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.campaigns
    WHERE campaigns.id = candidates.campaign_id
      AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update candidates of their campaigns"
ON public.candidates
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.campaigns
    WHERE campaigns.id = candidates.campaign_id
      AND campaigns.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.campaigns
    WHERE campaigns.id = candidates.campaign_id
      AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete candidates of their campaigns"
ON public.candidates
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.campaigns
    WHERE campaigns.id = candidates.campaign_id
      AND campaigns.user_id = auth.uid()
  )
);
