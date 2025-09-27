-- Création de la table workspace_documents
CREATE TABLE IF NOT EXISTS workspace_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_workspace_documents_workspace_id ON workspace_documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_documents_user_id ON workspace_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_documents_created_at ON workspace_documents(created_at);

-- RLS (Row Level Security)
ALTER TABLE workspace_documents ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir les documents de leurs workspaces
CREATE POLICY "Users can view documents from their workspaces" ON workspace_documents
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE user_id = auth.uid() 
      OR id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Politique pour permettre aux utilisateurs d'insérer des documents dans leurs workspaces
CREATE POLICY "Users can insert documents in their workspaces" ON workspace_documents
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE user_id = auth.uid() 
      OR id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Politique pour permettre aux utilisateurs de modifier leurs propres documents
CREATE POLICY "Users can update their own documents" ON workspace_documents
  FOR UPDATE USING (user_id = auth.uid());

-- Politique pour permettre aux utilisateurs de supprimer leurs propres documents
CREATE POLICY "Users can delete their own documents" ON workspace_documents
  FOR DELETE USING (user_id = auth.uid());

-- Création du bucket de stockage pour les documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Politique de stockage pour permettre l'upload de documents
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );

-- Politique de stockage pour permettre la lecture des documents
CREATE POLICY "Users can view documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

-- Politique de stockage pour permettre la suppression des documents
CREATE POLICY "Users can delete documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );


