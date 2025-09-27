-- Script complet pour corriger les problèmes des workspaces
-- À exécuter dans le SQL Editor du dashboard Supabase

-- 1. Ajouter la colonne image_url à la table workspaces
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Créer le bucket pour les images de workspace
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-images', 'workspace-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Créer les politiques pour le bucket workspace-images
CREATE POLICY "Users can upload workspace images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'workspace-images' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view workspace images"
ON storage.objects FOR SELECT
USING (bucket_id = 'workspace-images');

CREATE POLICY "Users can update workspace images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'workspace-images' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete workspace images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'workspace-images' AND 
  auth.uid() IS NOT NULL
);

