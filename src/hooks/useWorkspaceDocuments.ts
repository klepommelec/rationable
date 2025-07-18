import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface WorkspaceDocument {
  id: string;
  workspace_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  content_extracted?: string;
  tags: string[];
  category?: string;
  uploaded_at: string;
  last_used_at?: string;
  usage_count: number;
  metadata: any;
}

export const useWorkspaceDocuments = (workspaceId?: string) => {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDocuments = async () => {
    if (!workspaceId || !user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workspace_documents')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, category?: string, tags: string[] = []) => {
    if (!workspaceId || !user) return null;

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${workspaceId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('decision-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('decision-files')
        .getPublicUrl(fileName);

      // Save document metadata
      const { data, error } = await supabase
        .from('workspace_documents')
        .insert({
          workspace_id: workspaceId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_url: publicUrl,
          category,
          tags,
          metadata: { original_name: file.name }
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger content extraction
      try {
        await supabase.functions.invoke('extract-document-content', {
          body: {
            documentId: data.id,
            fileUrl: publicUrl,
            fileType: file.type
          }
        });
      } catch (extractError) {
        console.error('Content extraction failed:', extractError);
        // Continue anyway, the document is still uploaded
      }

      await fetchDocuments();
      toast({
        title: "Succès",
        description: "Document téléchargé avec succès"
      });

      return data;
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: "Erreur",
        description: "Échec du téléchargement du document",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const updateDocument = async (documentId: string, updates: Partial<WorkspaceDocument>) => {
    try {
      const { error } = await supabase
        .from('workspace_documents')
        .update(updates)
        .eq('id', documentId);

      if (error) throw error;

      await fetchDocuments();
      toast({
        title: "Succès",
        description: "Document mis à jour"
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le document",
        variant: "destructive"
      });
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // Get document to delete file from storage
      const document = documents.find(d => d.id === documentId);
      if (document) {
        const fileName = document.file_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('decision-files')
            .remove([`${workspaceId}/${fileName}`]);
        }
      }

      const { error } = await supabase
        .from('workspace_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      await fetchDocuments();
      toast({
        title: "Succès",
        description: "Document supprimé"
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive"
      });
    }
  };

  const updateDocumentUsage = async (documentId: string) => {
    try {
      await supabase.rpc('update_document_usage', { doc_id: documentId });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [workspaceId, user]);

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    updateDocument,
    deleteDocument,
    updateDocumentUsage,
    refetch: fetchDocuments
  };
};