-- Create decisions table for cloud-synchronized history
CREATE TABLE public.decisions (
  id text PRIMARY KEY,
  user_id uuid NOT NULL,
  workspace_id uuid,
  dilemma text NOT NULL,
  emoji text,
  category text,
  tags text[] DEFAULT '{}',
  thread_id text,
  decision_data jsonb NOT NULL,
  timestamp timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own decisions" 
ON public.decisions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decisions" 
ON public.decisions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decisions" 
ON public.decisions 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decisions" 
ON public.decisions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_decisions_user_updated_at ON public.decisions (user_id, updated_at DESC);
CREATE INDEX idx_decisions_user_workspace_updated_at ON public.decisions (user_id, workspace_id, updated_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_decisions_updated_at
BEFORE UPDATE ON public.decisions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();