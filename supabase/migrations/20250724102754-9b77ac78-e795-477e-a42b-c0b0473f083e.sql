-- Add user_id column to decision_comments for proper ownership tracking
ALTER TABLE public.decision_comments 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update existing comments to have a placeholder user_id (this will need manual cleanup)
-- In a real scenario, you'd need to identify actual comment owners
UPDATE public.decision_comments 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id not nullable after updating existing records
ALTER TABLE public.decision_comments 
ALTER COLUMN user_id SET NOT NULL;

-- Drop the overly permissive comment policies
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Authenticated users can read comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.decision_comments;

-- Create proper user-based RLS policies for comments
CREATE POLICY "Users can create their own comments" 
ON public.decision_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read comments" 
ON public.decision_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own comments" 
ON public.decision_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.decision_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add additional validation for workspace names and descriptions
CREATE OR REPLACE FUNCTION public.validate_workspace_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate workspace name
  IF LENGTH(TRIM(NEW.name)) < 1 THEN
    RAISE EXCEPTION 'Workspace name cannot be empty';
  END IF;
  
  IF LENGTH(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Workspace name too long (max 100 characters)';
  END IF;
  
  -- Validate description if provided
  IF NEW.description IS NOT NULL AND LENGTH(NEW.description) > 500 THEN
    RAISE EXCEPTION 'Workspace description too long (max 500 characters)';
  END IF;
  
  -- Basic XSS prevention for name and description
  IF NEW.name ~* '<script|javascript:|on\w+=' THEN
    RAISE EXCEPTION 'Invalid workspace name detected';
  END IF;
  
  IF NEW.description IS NOT NULL AND NEW.description ~* '<script|javascript:|on\w+=' THEN
    RAISE EXCEPTION 'Invalid workspace description detected';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for workspace validation
CREATE TRIGGER validate_workspace_data_trigger
  BEFORE INSERT OR UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_workspace_data();

-- Enhance rate limiting function with better security
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  resource text, 
  identifier text, 
  max_actions integer DEFAULT 5, 
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  -- Validate inputs
  IF resource IS NULL OR identifier IS NULL THEN
    RAISE EXCEPTION 'Resource and identifier cannot be null';
  END IF;
  
  IF max_actions < 1 OR window_minutes < 1 THEN
    RAISE EXCEPTION 'Invalid rate limit parameters';
  END IF;
  
  -- Calculate window start time
  window_start_time := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::integer / window_minutes) * 
    (window_minutes || ' minutes')::interval;
  
  -- Get current count for this window
  SELECT action_count INTO current_count
  FROM public.rate_limits
  WHERE resource_type = resource
    AND rate_limits.identifier = check_rate_limit.identifier
    AND window_start = window_start_time;
  
  -- If no record exists, create one
  IF current_count IS NULL THEN
    INSERT INTO public.rate_limits (resource_type, identifier, window_start, action_count)
    VALUES (resource, check_rate_limit.identifier, window_start_time, 1)
    ON CONFLICT (resource_type, identifier, window_start)
    DO UPDATE SET action_count = rate_limits.action_count + 1;
    RETURN true;
  END IF;
  
  -- Check if limit exceeded
  IF current_count >= max_actions THEN
    RETURN false;
  END IF;
  
  -- Increment count
  UPDATE public.rate_limits
  SET action_count = action_count + 1
  WHERE resource_type = resource
    AND rate_limits.identifier = check_rate_limit.identifier
    AND window_start = window_start_time;
  
  RETURN true;
END;
$$;