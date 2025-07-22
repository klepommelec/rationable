import { ICriterion, IResult } from '@/types/decision';
import { UploadedFileInfo } from './fileUploadService';
import { fetchUsefulLinks } from './googleSearchService';

export const generateCriteriaOnly = async (
  dilemma: string,
  uploadedFiles: UploadedFileInfo[] = [],
  workspaceId?: string
): Promise<{
  criteria: ICriterion[];
  suggestedCategory: string;
  emoji: string;
}> => {
  try {
    // Pour l'instant, on génère des critères basiques côté client
    // TODO: Implémenter une vraie génération via IA si nécessaire
    const basicCriteria: ICriterion[] = [
      { id: "prix", name: "Prix" },
      { id: "qualite", name: "Qualité" },
      { id: "facilite", name: "Facilité d'utilisation" },
      { id: "durabilite", name: "Durabilité" }
    ];

    return {
      criteria: basicCriteria,
      suggestedCategory: "Général",
      emoji: "🤔"
    };
  } catch (error) {
    console.error('Error generating criteria:', error);
    throw error;
  }
};

export const generateOptions = async (
  dilemma: string, 
  criteria: ICriterion[], 
  uploadedFiles: UploadedFileInfo[] = [],
  workspaceId?: string
): Promise<IResult> => {
  console.log("📡 Starting generateOptions with enhanced links");
  
  try {
    // Appel à l'API existante (Claude ou OpenAI)
    const response = await fetch('/api/decision-maker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dilemma,
        criteria,
        uploadedFiles,
        workspaceId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: IResult = await response.json();
    
    // 🔗 NOUVEAU : Enrichir automatiquement avec les liens Google
    console.log("🔍 Enriching result with Google search links...");
    
    try {
      const googleLinks = await fetchUsefulLinks(result.recommendation, dilemma);
      
      // Remplacer ou enrichir les liens existants
      result.infoLinks = googleLinks.infoLinks;
      result.shoppingLinks = googleLinks.shoppingLinks;
      
      console.log("✅ Result enriched with Google links:", {
        infoLinksCount: result.infoLinks.length,
        shoppingLinksCount: result.shoppingLinks.length
      });
    } catch (linkError) {
      console.error("⚠️ Error fetching Google links, keeping original links:", linkError);
      // On garde les liens originaux en cas d'erreur
    }
    
    return result;
    
  } catch (error) {
    console.error("❌ Error in generateOptions:", error);
    throw error;
  }
};
