
-- Ajouter une colonne avatar_url à la table profiles
ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;

-- Créer le bucket pour les avatars utilisateur
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Créer une politique pour permettre l'upload d'avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Créer une politique pour permettre la lecture des avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Créer une politique pour permettre la mise à jour d'avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Créer une politique pour permettre la suppression d'avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
