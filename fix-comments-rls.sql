-- Script pour corriger les politiques RLS des commentaires
-- À exécuter dans le SQL Editor de Supabase

-- 1. Supprimer les politiques problématiques
DROP POLICY IF EXISTS "Users can read comments on their participated decisions" ON public.decision_comments;
DROP POLICY IF EXISTS "Users can create their own comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.decision_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.decision_comments;

-- 2. Créer de nouvelles politiques simples et fonctionnelles
CREATE POLICY "Users can read their own comments"
ON public.decision_comments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can read comments on shared decisions"
ON public.decision_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shared_decisions sd
    WHERE sd.decision_data->>'id' = decision_comments.decision_id
    AND ((sd.expires_at IS NULL) OR (sd.expires_at > now()))
  )
);

CREATE POLICY "Users can create their own comments"
ON public.decision_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.decision_comments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.decision_comments
FOR DELETE
USING (auth.uid() = user_id);

-- 3. Vérifier que RLS est activé
ALTER TABLE public.decision_comments ENABLE ROW LEVEL SECURITY;
