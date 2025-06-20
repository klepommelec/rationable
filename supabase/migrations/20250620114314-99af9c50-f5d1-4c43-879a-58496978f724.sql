
-- Create a table for publicly shared decisions
CREATE TABLE public.shared_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  decision_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  view_count INTEGER NOT NULL DEFAULT 0
);

-- Create index for faster lookups by public_id
CREATE INDEX idx_shared_decisions_public_id ON public.shared_decisions(public_id);

-- Create index for cleanup of expired decisions
CREATE INDEX idx_shared_decisions_expires_at ON public.shared_decisions(expires_at);

-- Enable Row Level Security
ALTER TABLE public.shared_decisions ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to read non-expired shared decisions
CREATE POLICY "Anyone can view non-expired shared decisions" 
  ON public.shared_decisions 
  FOR SELECT 
  USING (expires_at IS NULL OR expires_at > now());

-- Create policy that allows anyone to insert shared decisions (for anonymous sharing)
CREATE POLICY "Anyone can create shared decisions" 
  ON public.shared_decisions 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows updating view count
CREATE POLICY "Anyone can update view count" 
  ON public.shared_decisions 
  FOR UPDATE 
  USING (expires_at IS NULL OR expires_at > now())
  WITH CHECK (expires_at IS NULL OR expires_at > now());

-- Function to generate a short readable public ID
CREATE OR REPLACE FUNCTION generate_public_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired shared decisions (optional, can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_shared_decisions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.shared_decisions 
  WHERE expires_at IS NOT NULL AND expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
