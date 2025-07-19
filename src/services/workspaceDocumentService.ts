
import { supabase } from '@/integrations/supabase/client';
import { WorkspaceDocument } from '@/hooks/useWorkspaceDocuments';

export interface DocumentContent {
  document: WorkspaceDocument;
  content: string;
  chunks: string[];
}

export const getWorkspaceDocumentsForAnalysis = async (workspaceId: string, dilemma: string): Promise<DocumentContent[]> => {
  try {
    // Vérifier si la question nécessite réellement des documents workspace
    const isOutOfContextQuestion = detectOutOfContextQuestion(dilemma);
    
    if (isOutOfContextQuestion) {
      console.log('🚫 Question hors contexte détectée - ignorer les documents workspace:', dilemma);
      return [];
    }

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

    // Filtrer par pertinence réelle avant de marquer comme utilisés
    const relevantDocuments = documentsWithContent.filter(docContent => 
      isDocumentRelevant(docContent, dilemma)
    );

    console.log(`📚 Found ${relevantDocuments.length} relevant documents out of ${documentsWithContent.length} total`);
    
    // Mettre à jour l'usage UNIQUEMENT des documents pertinents
    for (const docContent of relevantDocuments) {
      try {
        await supabase.rpc('update_document_usage', { doc_id: docContent.document.id });
      } catch (error) {
        console.error('Error updating document usage:', error);
      }
    }

    return relevantDocuments;
  } catch (error) {
    console.error('Error in getWorkspaceDocumentsForAnalysis:', error);
    return [];
  }
};

// Fonction pour détecter les questions hors contexte
const detectOutOfContextQuestion = (dilemma: string): boolean => {
  const outOfContextPatterns = [
    /draft.*NBA/i,
    /champion.*NBA/i,
    /gagnant.*titre/i,
    /premier.*choix/i,
    /élection.*\d{4}/i,
    /actualité.*sport/i,
    /résultat.*match/i
  ];
  
  return outOfContextPatterns.some(pattern => pattern.test(dilemma));
};

// Fonction pour vérifier la pertinence d'un document
const isDocumentRelevant = (docContent: DocumentContent, dilemma: string): boolean => {
  const queryLower = dilemma.toLowerCase();
  const contentLower = docContent.content.toLowerCase();
  
  // Extraire les mots-clés principaux du dilemme (exclure les mots vides)
  const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'que', 'qui', 'pour', 'avec', 'sur', 'dans'];
  const queryWords = queryLower
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  if (queryWords.length === 0) return false;
  
  // Calculer le score de pertinence
  let relevanceScore = 0;
  let foundWords = 0;
  
  queryWords.forEach(word => {
    const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
    if (matches > 0) {
      foundWords++;
      relevanceScore += matches;
    }
  });
  
  // Considérer comme pertinent si au moins 30% des mots-clés sont trouvés
  // ET si le score total est significatif
  const wordCoverage = foundWords / queryWords.length;
  const isRelevant = wordCoverage >= 0.3 && relevanceScore >= 2;
  
  console.log(`📊 Document "${docContent.document.file_name}" relevance:`, {
    wordCoverage: Math.round(wordCoverage * 100) + '%',
    relevanceScore,
    isRelevant,
    foundWords,
    totalWords: queryWords.length
  });
  
  return isRelevant;
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
