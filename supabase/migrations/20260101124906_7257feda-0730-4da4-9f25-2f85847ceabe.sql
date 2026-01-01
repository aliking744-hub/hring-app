-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Create legal_docs table for storing legal documents with embeddings
CREATE TABLE public.legal_docs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  source_url TEXT NOT NULL,
  embedding extensions.vector(768),
  article_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX ON public.legal_docs USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 100);

-- Create index for category filtering
CREATE INDEX idx_legal_docs_category ON public.legal_docs(category);

-- Enable RLS
ALTER TABLE public.legal_docs ENABLE ROW LEVEL SECURITY;

-- Allow admins full access
CREATE POLICY "Admin can manage legal docs"
ON public.legal_docs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow authenticated users to read legal docs
CREATE POLICY "Authenticated users can read legal docs"
ON public.legal_docs
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Add updated_at trigger
CREATE TRIGGER update_legal_docs_updated_at
BEFORE UPDATE ON public.legal_docs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();