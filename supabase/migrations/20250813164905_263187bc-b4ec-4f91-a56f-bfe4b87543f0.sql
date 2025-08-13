-- Fix security vulnerability: Restrict comment access to authenticated users only
-- This prevents anonymous users from viewing user IDs and comment patterns

-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Anyone can read comments" ON public.decision_comments;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can read comments" 
ON public.decision_comments 
FOR SELECT 
TO authenticated
USING (true);

-- Ensure all other comment policies remain intact and secure
-- The existing policies already properly restrict INSERT, UPDATE, DELETE to comment owners