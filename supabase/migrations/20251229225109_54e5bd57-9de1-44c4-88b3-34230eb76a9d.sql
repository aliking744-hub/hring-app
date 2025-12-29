-- Create campaigns table
CREATE TABLE public.campaigns (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    city TEXT,
    status TEXT NOT NULL DEFAULT 'analyzing',
    progress INTEGER NOT NULL DEFAULT 0,
    job_title TEXT,
    industry TEXT,
    experience_range TEXT,
    education_level TEXT,
    skills TEXT[],
    auto_headhunting BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidates table
CREATE TABLE public.candidates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    skills TEXT,
    experience TEXT,
    education TEXT,
    last_company TEXT,
    location TEXT,
    title TEXT,
    match_score INTEGER DEFAULT 0,
    candidate_temperature TEXT DEFAULT 'cold',
    recommendation TEXT,
    green_flags TEXT[],
    red_flags TEXT[],
    layer_scores JSONB,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaigns - users can only see their own
CREATE POLICY "Users can view their own campaigns"
ON public.campaigns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
ON public.campaigns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
ON public.campaigns FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
ON public.campaigns FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for candidates - users can access candidates of their campaigns
CREATE POLICY "Users can view candidates of their campaigns"
ON public.candidates FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = candidates.campaign_id 
    AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can create candidates for their campaigns"
ON public.candidates FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = candidates.campaign_id 
    AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can update candidates of their campaigns"
ON public.candidates FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = candidates.campaign_id 
    AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can delete candidates of their campaigns"
ON public.candidates FOR DELETE
USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = candidates.campaign_id 
    AND campaigns.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();