-- Migration complète pour corriger toutes les politiques RLS
-- Cette migration corrige les problèmes d'accès aux votes, commentaires et partage

-- ============================================
-- 1. CORRIGER LES POLITIQUES RLS POUR decision_votes
-- ============================================

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Users can view votes on decisions they participate in" ON public.decision_votes;
DROP POLICY IF EXISTS "Participants can vote on decision options" ON public.decision_votes;
DROP POLICY IF EXISTS "Users can remove their own votes" ON public.decision_votes;
DROP POLICY IF EXISTS "Authenticated users can view all votes" ON public.decision_votes;
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.decision_votes;

-- Nouvelle politique : Les utilisateurs peuvent voir les votes sur leurs propres décisions
CREATE POLICY "Users can view votes on their decisions" 
ON public.decision_votes 
FOR SELECT 
USING (
  -- L'utilisateur peut voir les votes sur ses propres décisions
  EXISTS (
    SELECT 1 FROM public.decisions d
    WHERE d.id::text = decision_votes.decision_id
    AND d.user_id = auth.uid()
  )
  OR
  -- OU l'utilisateur est un participant
  EXISTS (
    SELECT 1 FROM public.decision_participants dp 
    WHERE dp.decision_id = decision_votes.decision_id 
    AND dp.user_id = auth.uid()
  )
);

-- Nouvelle politique : Les utilisateurs peuvent voter sur leurs propres décisions
CREATE POLICY "Users can vote on their decisions" 
ON public.decision_votes 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- L'utilisateur peut voter sur ses propres décisions
    EXISTS (
      SELECT 1 FROM public.decisions d
      WHERE d.id::text = decision_votes.decision_id
      AND d.user_id = auth.uid()
    )
    OR
    -- OU l'utilisateur est un participant
    EXISTS (
      SELECT 1 FROM public.decision_participants dp 
      WHERE dp.decision_id = decision_votes.decision_id 
      AND dp.user_id = auth.uid()
    )
  )
);

-- Les utilisateurs peuvent retirer leurs propres votes
CREATE POLICY "Users can remove their own votes" 
ON public.decision_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- 2. CORRIGER LES POLITIQUES RLS POUR decision_participants
-- ============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view participants of decisions they participate in" ON public.decision_participants;
DROP POLICY IF EXISTS "Users can join decisions they are invited to" ON public.decision_participants;
DROP POLICY IF EXISTS "Users can update their own role if they are contributors" ON public.decision_participants;
DROP POLICY IF EXISTS "Users can leave decisions" ON public.decision_participants;

-- Nouvelle politique : Les utilisateurs peuvent voir les participants de leurs propres décisions
CREATE POLICY "Users can view participants of their decisions" 
ON public.decision_participants 
FOR SELECT 
USING (
  -- L'utilisateur peut voir les participants de ses propres décisions
  EXISTS (
    SELECT 1 FROM public.decisions d
    WHERE d.id::text = decision_participants.decision_id
    AND d.user_id = auth.uid()
  )
  OR
  -- OU l'utilisateur est lui-même un participant
  auth.uid() = user_id
);

-- Les utilisateurs peuvent s'ajouter comme participants (pour leurs propres décisions ou si invités)
CREATE POLICY "Users can join decisions" 
ON public.decision_participants 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- L'utilisateur peut s'ajouter à ses propres décisions
    EXISTS (
      SELECT 1 FROM public.decisions d
      WHERE d.id::text = decision_participants.decision_id
      AND d.user_id = auth.uid()
    )
    OR
    -- OU l'utilisateur est invité (invited_by est défini)
    invited_by IS NOT NULL
  )
);

-- Les utilisateurs peuvent mettre à jour leur propre rôle
CREATE POLICY "Users can update their own participation" 
ON public.decision_participants 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent quitter une décision
CREATE POLICY "Users can leave decisions" 
ON public.decision_participants 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- 3. CORRIGER LES POLITIQUES RLS POUR decision_comments
-- ============================================

-- Supprimer toutes les anciennes politiques de commentaires
DROP POLICY IF EXISTS "Users can read comments on their participated decisions" ON public.decision_comments;
DROP POLICY IF EXISTS "Users can read comments on accessible decisions" ON public.decision_comments;
DROP POLICY IF EXISTS "Users can create comments on accessible decisions" ON public.decision_comments;
DROP POLICY IF EXISTS "Authenticated users can read comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Users can read comments from their own decisions" ON public.decision_comments;

-- Nouvelle politique : Les utilisateurs peuvent lire les commentaires sur leurs propres décisions
CREATE POLICY "Users can read comments on their decisions" 
ON public.decision_comments 
FOR SELECT 
USING (
  -- L'utilisateur peut lire ses propres commentaires
  auth.uid() = user_id 
  OR 
  -- OU l'utilisateur peut lire les commentaires sur ses propres décisions
  EXISTS (
    SELECT 1 FROM public.decisions d
    WHERE d.id::text = decision_comments.decision_id
    AND d.user_id = auth.uid()
  )
  OR
  -- OU l'utilisateur a déjà créé un commentaire sur cette décision
  EXISTS (
    SELECT 1 FROM public.decision_comments dc2 
    WHERE dc2.decision_id = decision_comments.decision_id 
    AND dc2.user_id = auth.uid()
  )
  OR
  -- OU la décision est partagée publiquement
  EXISTS (
    SELECT 1 FROM public.shared_decisions sd 
    WHERE sd.decision_data->>'id' = decision_comments.decision_id
    AND ((sd.expires_at IS NULL) OR (sd.expires_at > now()))
  )
);

-- Nouvelle politique : Les utilisateurs peuvent créer des commentaires sur leurs propres décisions
CREATE POLICY "Users can create comments on their decisions" 
ON public.decision_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- L'utilisateur peut créer des commentaires sur ses propres décisions
    EXISTS (
      SELECT 1 FROM public.decisions d
      WHERE d.id::text = decision_comments.decision_id
      AND d.user_id = auth.uid()
    )
    OR
    -- OU l'utilisateur est un participant
    EXISTS (
      SELECT 1 FROM public.decision_participants dp
      WHERE dp.decision_id = decision_comments.decision_id
      AND dp.user_id = auth.uid()
    )
    OR
    -- OU la décision est partagée publiquement
    EXISTS (
      SELECT 1 FROM public.shared_decisions sd 
      WHERE sd.decision_data->>'id' = decision_comments.decision_id
      AND ((sd.expires_at IS NULL) OR (sd.expires_at > now()))
    )
  )
);

-- Les utilisateurs peuvent mettre à jour leurs propres commentaires
DROP POLICY IF EXISTS "Users can update their own comments" ON public.decision_comments;
CREATE POLICY "Users can update their own comments" 
ON public.decision_comments 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres commentaires
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.decision_comments;
CREATE POLICY "Users can delete their own comments" 
ON public.decision_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- 4. VÉRIFIER ET CORRIGER LES FONCTIONS RPC
-- ============================================

-- S'assurer que la fonction get_decision_vote_counts existe et fonctionne
CREATE OR REPLACE FUNCTION public.get_decision_vote_counts(decision_id_param TEXT)
RETURNS TABLE(option_name TEXT, vote_count BIGINT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    dv.option_name,
    COUNT(*) as vote_count
  FROM public.decision_votes dv
  WHERE dv.decision_id = decision_id_param
  GROUP BY dv.option_name
  ORDER BY vote_count DESC, option_name;
$$;

-- S'assurer que la fonction has_user_voted existe et fonctionne
CREATE OR REPLACE FUNCTION public.has_user_voted(decision_id_param TEXT, option_name_param TEXT, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.decision_votes 
    WHERE decision_id = decision_id_param 
    AND option_name = option_name_param 
    AND user_id = user_id_param
  );
$$;

-- ============================================
-- 5. CRÉER DES INDEX POUR AMÉLIORER LES PERFORMANCES
-- ============================================

-- Index pour améliorer les requêtes de votes par decision_id
CREATE INDEX IF NOT EXISTS idx_decision_votes_decision_id_option ON public.decision_votes (decision_id, option_name);
CREATE INDEX IF NOT EXISTS idx_decision_participants_decision_user ON public.decision_participants (decision_id, user_id);





