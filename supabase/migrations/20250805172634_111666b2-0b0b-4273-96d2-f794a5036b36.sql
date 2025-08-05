-- Fix database function security by setting explicit search_path
CREATE OR REPLACE FUNCTION public.generate_public_id()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.generate_template_public_id()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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
 SET search_path TO 'public'
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
 SET search_path TO 'public'
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
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.community_templates 
  SET like_count = like_count + 1,
      updated_at = now()
  WHERE id = template_id AND status = 'approved';
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_comment_content()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate content length
  IF LENGTH(TRIM(NEW.content)) < 1 THEN
    RAISE EXCEPTION 'Comment content cannot be empty';
  END IF;
  
  IF LENGTH(NEW.content) > 10000 THEN
    RAISE EXCEPTION 'Comment content too long (max 10000 characters)';
  END IF;
  
  -- Enhanced XSS prevention
  IF NEW.content ~* '<script|javascript:|on\w+=|data:|vbscript:|mocha:|livescript:' THEN
    RAISE EXCEPTION 'Invalid content detected';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(resource text, identifier text, max_actions integer DEFAULT 5, window_minutes integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.validate_workspace_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Enhanced XSS prevention for name and description
  IF NEW.name ~* '<script|javascript:|on\w+=|data:|vbscript:|mocha:|livescript:' THEN
    RAISE EXCEPTION 'Invalid workspace name detected';
  END IF;
  
  IF NEW.description IS NOT NULL AND NEW.description ~* '<script|javascript:|on\w+=|data:|vbscript:|mocha:|livescript:' THEN
    RAISE EXCEPTION 'Invalid workspace description detected';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add trigger to enforce comment validation
DROP TRIGGER IF EXISTS validate_comment_trigger ON public.decision_comments;
CREATE TRIGGER validate_comment_trigger
  BEFORE INSERT OR UPDATE ON public.decision_comments
  FOR EACH ROW EXECUTE FUNCTION public.validate_comment_content();

-- Add trigger to enforce workspace validation  
DROP TRIGGER IF EXISTS validate_workspace_trigger ON public.workspaces;
CREATE TRIGGER validate_workspace_trigger
  BEFORE INSERT OR UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.validate_workspace_data();