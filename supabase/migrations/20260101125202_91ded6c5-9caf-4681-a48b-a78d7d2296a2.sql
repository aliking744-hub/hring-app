-- Create a function for semantic similarity search on legal_docs
CREATE OR REPLACE FUNCTION public.search_legal_docs(
  query_embedding extensions.vector(768),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  category TEXT,
  source_url TEXT,
  article_number TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ld.id,
    ld.content,
    ld.category,
    ld.source_url,
    ld.article_number,
    1 - (ld.embedding <=> query_embedding) AS similarity
  FROM public.legal_docs ld
  WHERE 
    ld.embedding IS NOT NULL
    AND (filter_category IS NULL OR ld.category = filter_category)
    AND 1 - (ld.embedding <=> query_embedding) > match_threshold
  ORDER BY ld.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;