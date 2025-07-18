
import { supabase } from '@/integrations/supabase/client';
import { WorkspaceDocument } from '@/hooks/useWorkspaceDocuments';

export interface DocumentContent {
  document: WorkspaceDocument;
  content: string;
  chunks: string[];
}

export const getWorkspaceDocumentsForAnalysis = async (workspaceId: string, dilemma: string): Promise<DocumentContent[]> => {
  try {
    // Récupérer les documents du workspace avec leur contenu extrait
    const { data: documents, error: docsError } = await supabase
      .from('workspace_documents')
      .select(`
        *,
        document_content (
          content_text,
          content_chunks
        )
      `)
      .eq('workspace_id', workspaceId)
      .not('content_extracted', 'is', null);

    if (docsError) {
      console.error('Error fetching workspace documents:', docsError);
      return [];
    }

    if (!documents || documents.length === 0) {
      console.log('No documents found in workspace');
      return [];
    }

    // Filtrer et préparer les documents avec contenu
    const documentsWithContent: DocumentContent[] = documents
      .filter(doc => doc.document_content && doc.document_content.length > 0)
      .map(doc => ({
        document: doc as WorkspaceDocument,
        content: doc.document_content[0]?.content_text || '',
        chunks: doc.document_content[0]?.content_chunks || []
      }))
      .filter(doc => doc.content.length > 0);

    console.log(`📚 Found ${documentsWithContent.length} documents with content for analysis`);
    
    // Mettre à jour l'usage des documents utilisés
    for (const docContent of documentsWithContent) {
      try {
        await supabase.rpc('update_document_usage', { doc_id: docContent.document.id });
      } catch (error) {
        console.error('Error updating document usage:', error);
      }
    }

    return documentsWithContent;
  } catch (error) {
    console.error('Error in getWorkspaceDocumentsForAnalysis:', error);
    return [];
  }
};

export const searchRelevantContent = (documents: DocumentContent[], query: string, maxChunks: number = 10): string => {
  if (documents.length === 0) return '';

  const queryLower = query.toLowerCase();
  const relevantChunks: { chunk: string; relevance: number; source: string }[] = [];

  // Analyser chaque document pour trouver le contenu pertinent
  documents.forEach(docContent => {
    const { document, chunks } = docContent;
    
    chunks.forEach(chunk => {
      if (chunk.length < 20) return; // Ignorer les chunks trop courts
      
      const chunkLower = chunk.toLowerCase();
      let relevance = 0;
      
      // Calculer la pertinence basée sur les mots-clés du dilemme
      const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
      queryWords.forEach(word => {
        const matches = (chunkLower.match(new RegExp(word, 'g')) || []).length;
        relevance += matches;
      });
      
      if (relevance > 0) {
        relevantChunks.push({
          chunk: chunk.trim(),
          relevance,
          source: document.file_name
        });
      }
    });
  });

  // Trier par pertinence et prendre les meilleurs chunks
  const topChunks = relevantChunks
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, maxChunks);

  if (topChunks.length === 0) {
    // Si aucun chunk pertinent, prendre un échantillon du contenu de chaque document
    return documents
      .map(doc => `[${doc.document.file_name}]\n${doc.content.substring(0, 500)}...`)
      .join('\n\n');
  }

  // Formater le contenu pertinent avec les sources
  const formattedContent = topChunks
    .map(item => `[${item.source}] ${item.chunk}`)
    .join('\n\n');

  const sourcesList = [...new Set(topChunks.map(item => item.source))];
  
  return `CONTENU PERTINENT DES DOCUMENTS WORKSPACE:\n\n${formattedContent}\n\nSOURCES: ${sourcesList.join(', ')}`;
};
