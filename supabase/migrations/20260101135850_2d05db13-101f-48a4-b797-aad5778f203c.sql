-- Create table for legal advisor conversations
CREATE TABLE public.legal_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'مکالمه جدید',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for messages in conversations
CREATE TABLE public.legal_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.legal_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for legal_conversations
CREATE POLICY "Users can view their own conversations"
ON public.legal_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.legal_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.legal_conversations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.legal_conversations
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for legal_messages
CREATE POLICY "Users can view messages of their conversations"
ON public.legal_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.legal_conversations
  WHERE id = legal_messages.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their conversations"
ON public.legal_messages
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.legal_conversations
  WHERE id = legal_messages.conversation_id AND user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_legal_conversations_user_id ON public.legal_conversations(user_id);
CREATE INDEX idx_legal_messages_conversation_id ON public.legal_messages(conversation_id);

-- Update trigger for updated_at
CREATE TRIGGER update_legal_conversations_updated_at
  BEFORE UPDATE ON public.legal_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();