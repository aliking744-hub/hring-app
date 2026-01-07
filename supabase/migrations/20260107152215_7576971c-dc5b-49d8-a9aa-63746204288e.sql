-- Create table for storing strategic radar analyses
CREATE TABLE public.strategic_radar_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  company_ticker TEXT,
  company_logo TEXT,
  industry TEXT,
  sector TEXT,
  competitors JSONB DEFAULT '[]'::jsonb,
  revenue TEXT,
  revenue_value NUMERIC,
  cash_liquidity TEXT,
  strategic_goal TEXT,
  technology_lag INTEGER DEFAULT 3,
  maturity_score INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.strategic_radar_analyses ENABLE ROW LEVEL SECURITY;

-- Users can view their own analyses
CREATE POLICY "Users can view their own analyses"
ON public.strategic_radar_analyses
FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can create their own analyses
CREATE POLICY "Users can create their own analyses"
ON public.strategic_radar_analyses
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can update their own analyses
CREATE POLICY "Users can update their own analyses"
ON public.strategic_radar_analyses
FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete their own analyses"
ON public.strategic_radar_analyses
FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_strategic_radar_user_id ON public.strategic_radar_analyses(user_id);
CREATE INDEX idx_strategic_radar_created_at ON public.strategic_radar_analyses(created_at DESC);