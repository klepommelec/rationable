-- Security Fix 1: Secure shared_decisions table with proper RLS policies
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can view non-expired shared decisions" ON public.shared_decisions;
DROP POLICY IF EXISTS "Anyone can create shared decisions" ON public.shared_decisions;
DROP POLICY IF EXISTS "Anyone can update view count" ON public.shared_decisions;

-- Create secure policies that require authentication for creation
CREATE POLICY "Authenticated users can create shared decisions" 
ON public.shared_decisions 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow public viewing of non-expired shared decisions (for sharing functionality)
-- but with rate limiting handled at application level
CREATE POLICY "Public can view non-expired shared decisions" 
ON public.shared_decisions 
FOR SELECT 
TO public
USING ((expires_at IS NULL) OR (expires_at > now()));

-- Only allow view count updates for non-expired decisions
CREATE POLICY "System can update view count" 
ON public.shared_decisions 
FOR UPDATE 
TO public
USING ((expires_at IS NULL) OR (expires_at > now()))
WITH CHECK ((expires_at IS NULL) OR (expires_at > now()));

-- Security Fix 2: Add sharing tokens for secure access (optional enhancement)
ALTER TABLE public.shared_decisions 
ADD COLUMN IF NOT EXISTS sharing_token text;

-- Create index for efficient token lookups
CREATE INDEX IF NOT EXISTS idx_shared_decisions_sharing_token 
ON public.shared_decisions(sharing_token);

-- Security Fix 3: Strengthen community templates policies
-- Ensure only authenticated users can create templates
DROP POLICY IF EXISTS "Anyone can create templates" ON public.community_templates;
CREATE POLICY "Authenticated users can create templates" 
ON public.community_templates 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Security Fix 4: Add constraint to prevent empty sharing tokens
ALTER TABLE public.shared_decisions 
ADD CONSTRAINT sharing_token_not_empty 
CHECK (sharing_token IS NULL OR length(sharing_token) > 0);