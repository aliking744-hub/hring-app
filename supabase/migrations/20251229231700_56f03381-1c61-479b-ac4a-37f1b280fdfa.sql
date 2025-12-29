-- Add status column to candidates table
ALTER TABLE public.candidates 
ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Add constraint to ensure valid status values
ALTER TABLE public.candidates 
ADD CONSTRAINT candidates_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'waiting'));