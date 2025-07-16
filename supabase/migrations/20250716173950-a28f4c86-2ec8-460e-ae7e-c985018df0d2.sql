-- Add use_context column to workspaces table
ALTER TABLE public.workspaces 
ADD COLUMN use_context text DEFAULT 'personal' CHECK (use_context IN ('personal', 'professional'));

-- Update existing workspaces with default context
UPDATE public.workspaces 
SET use_context = 'personal' 
WHERE use_context IS NULL;