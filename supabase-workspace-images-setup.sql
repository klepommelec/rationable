-- Script pour créer le bucket workspace-images et ses politiques
-- À exécuter dans le SQL Editor du dashboard Supabase

-- Créer le bucket pour les images de workspace
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-images', 'workspace-images', true)
ON CONFLICT (id) DO NOTHING;

-- Créer une politique pour permettre l'upload d'images de workspace
CREATE POLICY "Users can upload workspace images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'workspace-images' AND 
  auth.uid() IS NOT NULL
);

-- Créer une politique pour permettre la lecture des images de workspace
CREATE POLICY "Anyone can view workspace images"
ON storage.objects FOR SELECT
USING (bucket_id = 'workspace-images');

-- Créer une politique pour permettre la mise à jour d'images de workspace
CREATE POLICY "Users can update workspace images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'workspace-images' AND 
  auth.uid() IS NOT NULL
);

-- Créer une politique pour permettre la suppression d'images de workspace
CREATE POLICY "Users can delete workspace images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'workspace-images' AND 
  auth.uid() IS NOT NULL
);

