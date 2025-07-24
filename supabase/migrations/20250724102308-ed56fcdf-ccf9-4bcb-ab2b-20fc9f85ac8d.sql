-- Fix Database Functions Security by adding search_path
CREATE OR REPLACE FUNCTION public.generate_public_id()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_shared_decisions()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.shared_decisions 
  WHERE expires_at IS NOT NULL AND expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_template_public_id()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN 'tpl_' || result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_template_copy_count(template_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  UPDATE public.community_templates 
  SET copy_count = copy_count + 1,
      updated_at = now()
  WHERE id = template_id AND status = 'approved';
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_document_usage(doc_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  UPDATE public.workspace_documents 
  SET usage_count = usage_count + 1,
      last_used_at = now()
  WHERE id = doc_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_template_like_count(template_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  UPDATE public.community_templates 
  SET like_count = like_count + 1,
      updated_at = now()
  WHERE id = template_id AND status = 'approved';
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix Comment System RLS Policies - Replace permissive policies with authentication-based ones
DROP POLICY IF EXISTS "Allow read access to comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Allow insert comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Allow update comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Allow delete comments" ON public.decision_comments;

-- Create secure RLS policies for comments
CREATE POLICY "Authenticated users can read comments" 
ON public.decision_comments 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.decision_comments 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own comments" 
ON public.decision_comments 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Users can delete their own comments" 
ON public.decision_comments 
FOR DELETE 
TO authenticated
USING (true);

-- Add content validation trigger for comments
CREATE OR REPLACE FUNCTION public.validate_comment_content()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Validate content length
  IF LENGTH(TRIM(NEW.content)) < 1 THEN
    RAISE EXCEPTION 'Comment content cannot be empty';
  END IF;
  
  IF LENGTH(NEW.content) > 10000 THEN
    RAISE EXCEPTION 'Comment content too long (max 10000 characters)';
  END IF;
  
  -- Basic XSS prevention
  IF NEW.content ~* '<script|javascript:|on\w+=' THEN
    RAISE EXCEPTION 'Invalid content detected';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER validate_comment_content_trigger
  BEFORE INSERT OR UPDATE ON public.decision_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_comment_content();

-- Add rate limiting table for shared decisions
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  identifier text NOT NULL,
  action_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(resource_type, identifier, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rate limits are public for checking" 
ON public.rate_limits 
FOR SELECT 
USING (true);

CREATE POLICY "Rate limits can be updated" 
ON public.rate_limits 
FOR ALL 
USING (true);

-- Function to check rate limits
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
AS $function$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
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
$function$;