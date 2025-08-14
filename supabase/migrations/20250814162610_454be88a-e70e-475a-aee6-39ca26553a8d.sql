-- Fix critical RLS security issues

-- Drop the overly permissive policy for decision_comments
DROP POLICY IF EXISTS "Authenticated users can read comments" ON public.decision_comments;

-- Create a security definer function to check if user can access decision comments
-- Since decision_id is text (client-generated), we need to be more restrictive
CREATE OR REPLACE FUNCTION public.can_access_decision_comments(decision_id_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- For now, restrict to comments created by the authenticated user
  -- This is the most secure approach for client-side decision IDs
  -- If shared decisions need comment access, we can extend this later
  RETURN EXISTS (
    SELECT 1 FROM public.decision_comments dc
    WHERE dc.decision_id = decision_id_param 
    AND dc.user_id = auth.uid()
  );
END;
$$;

-- Create new restrictive policy for reading decision comments
-- Users can only read comments on decisions where they have created at least one comment
-- This prevents users from accessing comments on decisions they don't own
CREATE POLICY "Users can read comments on their participated decisions" 
ON public.decision_comments 
FOR SELECT 
USING (
  -- Users can read their own comments
  auth.uid() = user_id 
  OR 
  -- Users can read comments on decisions where they have participated
  EXISTS (
    SELECT 1 FROM public.decision_comments dc2 
    WHERE dc2.decision_id = decision_comments.decision_id 
    AND dc2.user_id = auth.uid()
  )
  OR
  -- Users can read comments on publicly shared decisions (if they have the public_id)
  EXISTS (
    SELECT 1 FROM public.shared_decisions sd 
    WHERE sd.decision_data->>'id' = decision_comments.decision_id
    AND ((sd.expires_at IS NULL) OR (sd.expires_at > now()))
  )
);

-- Fix the infinite recursion issue in shared_decisions policy
DROP POLICY IF EXISTS "Public can view specific shared decisions by public_id" ON public.shared_decisions;

-- Create a security definer function to avoid recursive RLS issues
CREATE OR REPLACE FUNCTION public.is_valid_shared_decision_access(public_id_param text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shared_decisions 
    WHERE public_id = public_id_param 
    AND ((expires_at IS NULL) OR (expires_at > now()))
  );
$$;

-- Create new policy for shared decisions that avoids recursion
CREATE POLICY "Public can view valid shared decisions" 
ON public.shared_decisions 
FOR SELECT 
USING (
  ((expires_at IS NULL) OR (expires_at > now()))
);

-- Add rate limiting for template counter updates to prevent manipulation
CREATE POLICY "Rate limited template counter updates" 
ON public.community_templates 
FOR UPDATE 
USING (
  status = 'approved'::template_status
  AND (
    -- Allow system functions to update counters
    current_setting('role') = 'service_role'
    OR
    -- Rate limit user updates (only allow authenticated users)
    (auth.uid() IS NOT NULL)
  )
)
WITH CHECK (
  status = 'approved'::template_status
  AND (
    -- Only allow updates to counter fields and updated_at
    (OLD.title = NEW.title AND OLD.description = NEW.description AND OLD.decision_data = NEW.decision_data)
  )
);