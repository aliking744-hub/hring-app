-- Create app_role enum for strategic compass (ceo, deputy, manager)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'compass_role') THEN
    CREATE TYPE public.compass_role AS ENUM ('ceo', 'deputy', 'manager');
  END IF;
END$$;

-- Strategic Intents table (CEO's strategic directives)
CREATE TABLE IF NOT EXISTS public.strategic_intents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ceo_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  strategic_weight INTEGER NOT NULL DEFAULT 5 CHECK (strategic_weight >= 1 AND strategic_weight <= 10),
  tolerance_zone INTEGER NOT NULL DEFAULT 5 CHECK (tolerance_zone >= 1 AND tolerance_zone <= 10),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Intent Assignments (link intents to users)
CREATE TABLE IF NOT EXISTS public.intent_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_id UUID NOT NULL REFERENCES public.strategic_intents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(intent_id, user_id)
);

-- Behaviors table (deputy actions/reports)
CREATE TABLE IF NOT EXISTS public.behaviors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deputy_id UUID NOT NULL,
  intent_id UUID NOT NULL REFERENCES public.strategic_intents(id) ON DELETE CASCADE,
  action_description TEXT NOT NULL,
  time_spent INTEGER NOT NULL DEFAULT 0,
  resources_used NUMERIC NOT NULL DEFAULT 0,
  result_score INTEGER CHECK (result_score IS NULL OR (result_score >= 0 AND result_score <= 100)),
  alignment_score INTEGER CHECK (alignment_score IS NULL OR (alignment_score >= 0 AND alignment_score <= 100)),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Scenarios table (situational judgment tests)
CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ceo_id UUID,
  intent_id UUID REFERENCES public.strategic_intents(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  ceo_answer TEXT CHECK (ceo_answer IN ('a', 'b', 'c')),
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Scenario Responses (user answers to scenarios)
CREATE TABLE IF NOT EXISTS public.scenario_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  answer TEXT NOT NULL CHECK (answer IN ('a', 'b', 'c')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(scenario_id, user_id)
);

-- Strategic Bets (yearly goals with coin allocation)
CREATE TABLE IF NOT EXISTS public.strategic_bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ceo_id UUID NOT NULL,
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bet Allocations (how users distribute coins)
CREATE TABLE IF NOT EXISTS public.bet_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bet_id UUID NOT NULL REFERENCES public.strategic_bets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0 AND coins <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bet_id, user_id)
);

-- Decision Journals (documentation of decision rationale)
CREATE TABLE IF NOT EXISTS public.decision_journals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  behavior_id UUID NOT NULL REFERENCES public.behaviors(id) ON DELETE CASCADE,
  rejected_options TEXT NOT NULL,
  supporting_data TEXT NOT NULL,
  risk_prediction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(behavior_id)
);

-- Compass Profiles (extended profiles for strategic compass)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS title TEXT;

-- Compass User Roles table
CREATE TABLE IF NOT EXISTS public.compass_user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  role compass_role NOT NULL DEFAULT 'manager',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.strategic_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intent_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compass_user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check compass role
CREATE OR REPLACE FUNCTION public.has_compass_role(_user_id uuid, _role compass_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.compass_user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is CEO
CREATE OR REPLACE FUNCTION public.is_ceo(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_compass_role(_user_id, 'ceo')
$$;

-- RLS Policies for strategic_intents
CREATE POLICY "CEO can manage intents" ON public.strategic_intents
FOR ALL USING (public.is_ceo(auth.uid()));

CREATE POLICY "Users can view active intents" ON public.strategic_intents
FOR SELECT USING (status = 'active');

-- RLS Policies for intent_assignments
CREATE POLICY "CEO can manage assignments" ON public.intent_assignments
FOR ALL USING (public.is_ceo(auth.uid()));

CREATE POLICY "Users can view their assignments" ON public.intent_assignments
FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for behaviors
CREATE POLICY "Users can manage their behaviors" ON public.behaviors
FOR ALL USING (auth.uid() = deputy_id);

CREATE POLICY "CEO can view all behaviors" ON public.behaviors
FOR SELECT USING (public.is_ceo(auth.uid()));

-- RLS Policies for scenarios
CREATE POLICY "CEO can manage scenarios" ON public.scenarios
FOR ALL USING (public.is_ceo(auth.uid()));

CREATE POLICY "Users can view active scenarios" ON public.scenarios
FOR SELECT USING (is_active = true);

-- RLS Policies for scenario_responses
CREATE POLICY "Users can manage their responses" ON public.scenario_responses
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "CEO can view all responses" ON public.scenario_responses
FOR SELECT USING (public.is_ceo(auth.uid()));

-- RLS Policies for strategic_bets
CREATE POLICY "CEO can manage bets" ON public.strategic_bets
FOR ALL USING (public.is_ceo(auth.uid()));

CREATE POLICY "Users can view bets" ON public.strategic_bets
FOR SELECT USING (true);

-- RLS Policies for bet_allocations
CREATE POLICY "Users can manage their allocations" ON public.bet_allocations
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "CEO can view all allocations" ON public.bet_allocations
FOR SELECT USING (public.is_ceo(auth.uid()));

-- RLS Policies for decision_journals
CREATE POLICY "Users can manage their journals" ON public.decision_journals
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.behaviors
    WHERE behaviors.id = decision_journals.behavior_id
    AND behaviors.deputy_id = auth.uid()
  )
);

CREATE POLICY "CEO can view all journals" ON public.decision_journals
FOR SELECT USING (public.is_ceo(auth.uid()));

-- RLS Policies for compass_user_roles
CREATE POLICY "CEO can manage roles" ON public.compass_user_roles
FOR ALL USING (public.is_ceo(auth.uid()));

CREATE POLICY "Users can view their role" ON public.compass_user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Trigger for updated_at on strategic_intents
CREATE TRIGGER update_strategic_intents_updated_at
BEFORE UPDATE ON public.strategic_intents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();