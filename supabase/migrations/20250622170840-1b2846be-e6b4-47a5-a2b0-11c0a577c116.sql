
-- Créer le bucket pour stocker les fichiers de décision
INSERT INTO storage.buckets (id, name, public)
VALUES ('decision-files', 'decision-files', true);

-- Créer une politique pour permettre l'upload de fichiers
CREATE POLICY "Allow file uploads for decision files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'decision-files');

-- Créer une politique pour permettre la lecture des fichiers
CREATE POLICY "Allow file downloads for decision files"
ON storage.objects FOR SELECT
USING (bucket_id = 'decision-files');

-- Créer une politique pour permettre la suppression des fichiers
CREATE POLICY "Allow file deletion for decision files"
ON storage.objects FOR DELETE
USING (bucket_id = 'decision-files');
