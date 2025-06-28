
-- Create table for decision comments
CREATE TABLE public.decision_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_id TEXT NOT NULL, -- References the local decision ID from localStorage
  content TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'general', -- 'general', 'criteria', 'option', 'recommendation'
  step_context TEXT, -- Additional context like criterion name or option name
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - for now making it public since we don't have user auth
ALTER TABLE public.decision_comments ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to view comments (since decisions are stored locally)
CREATE POLICY "Allow read access to comments" 
  ON public.decision_comments 
  FOR SELECT 
  USING (true);

-- Create policy that allows anyone to insert comments
CREATE POLICY "Allow insert comments" 
  ON public.decision_comments 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows anyone to update comments
CREATE POLICY "Allow update comments" 
  ON public.decision_comments 
  FOR UPDATE 
  USING (true);

-- Create policy that allows anyone to delete comments
CREATE POLICY "Allow delete comments" 
  ON public.decision_comments 
  FOR DELETE 
  USING (true);

-- Create index for better performance when querying by decision_id
CREATE INDEX idx_decision_comments_decision_id ON public.decision_comments (decision_id);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_decision_comments_updated_at
  BEFORE UPDATE ON public.decision_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
