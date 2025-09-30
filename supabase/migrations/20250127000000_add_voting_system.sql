-- Add voting system for decision options
-- This migration creates tables for votes and decision participants with roles

-- 1. Create enum for participant roles
CREATE TYPE public.participant_role AS ENUM ('observer', 'contributor');

-- 2. Create decision_participants table to track who has access to a decision
CREATE TABLE public.decision_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role participant_role NOT NULL DEFAULT 'observer',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(decision_id, user_id)
);

-- 3. Create decision_votes table for simple +1 votes on options
CREATE TABLE public.decision_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id TEXT NOT NULL,
  option_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(decision_id, option_name, user_id)
);

-- 4. Enable RLS on both tables
ALTER TABLE public.decision_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_votes ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for decision_participants
CREATE POLICY "Users can view participants of decisions they participate in" 
ON public.decision_participants 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.decision_participants dp2 
    WHERE dp2.decision_id = decision_participants.decision_id 
    AND dp2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join decisions they are invited to" 
ON public.decision_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own role if they are contributors" 
ON public.decision_participants 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave decisions" 
ON public.decision_participants 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Create RLS policies for decision_votes
CREATE POLICY "Users can view votes on decisions they participate in" 
ON public.decision_votes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.decision_participants dp 
    WHERE dp.decision_id = decision_votes.decision_id 
    AND dp.user_id = auth.uid()
  )
);

CREATE POLICY "Participants can vote on decision options" 
ON public.decision_votes 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.decision_participants dp 
    WHERE dp.decision_id = decision_votes.decision_id 
    AND dp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove their own votes" 
ON public.decision_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Create indexes for performance
CREATE INDEX idx_decision_participants_decision_id ON public.decision_participants (decision_id);
CREATE INDEX idx_decision_participants_user_id ON public.decision_participants (user_id);
CREATE INDEX idx_decision_votes_decision_id ON public.decision_votes (decision_id);
CREATE INDEX idx_decision_votes_option_name ON public.decision_votes (option_name);
CREATE INDEX idx_decision_votes_user_id ON public.decision_votes (user_id);

-- 8. Create function to get vote counts for a decision
CREATE OR REPLACE FUNCTION public.get_decision_vote_counts(decision_id_param TEXT)
RETURNS TABLE(option_name TEXT, vote_count BIGINT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    dv.option_name,
    COUNT(*) as vote_count
  FROM public.decision_votes dv
  WHERE dv.decision_id = decision_id_param
  GROUP BY dv.option_name
  ORDER BY vote_count DESC, option_name;
$$;

-- 9. Create function to check if user has voted on an option
CREATE OR REPLACE FUNCTION public.has_user_voted(decision_id_param TEXT, option_name_param TEXT, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.decision_votes 
    WHERE decision_id = decision_id_param 
    AND option_name = option_name_param 
    AND user_id = user_id_param
  );
$$;

-- 10. Create function to get user's role in a decision
CREATE OR REPLACE FUNCTION public.get_user_decision_role(decision_id_param TEXT, user_id_param UUID)
RETURNS participant_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.decision_participants 
  WHERE decision_id = decision_id_param 
  AND user_id = user_id_param;
$$;
