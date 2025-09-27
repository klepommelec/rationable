import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WorkspaceDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  workspace_id: string;
  user_id: string;
  created_at: string;
  description?: string;
  tags?: string[];
  usage_count?: number;
  last_used_at?: string;
}

export const useWorkspaceDocuments = (workspaceId?: string) => {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!workspaceId) {
      setDocuments([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('workspace_documents')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching workspace documents:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const addDocument = async (document: Omit<WorkspaceDocument, 'id' | 'created_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('workspace_documents')
        .insert(document)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setDocuments(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding document:', err);
      throw err;
    }
  };

  const updateDocument = async (id: string, updates: Partial<WorkspaceDocument>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('workspace_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setDocuments(prev => 
        prev.map(doc => doc.id === id ? data : doc)
      );
      return data;
    } catch (err) {
      console.error('Error updating document:', err);
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('workspace_documents')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      console.error('Error deleting document:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [workspaceId]);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument
  };
};