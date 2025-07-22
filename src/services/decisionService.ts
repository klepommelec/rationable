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
    // Utiliser l'IA pour générer des critères pertinents
    const { callOpenAiApi } = await import('./openai');
    
    const prompt = `Analyse cette question et génère des critères d'évaluation pertinents.

Question: ${dilemma}

Réponds au format JSON avec:
- criteria: array d'objets avec {id, name} - 4 à 6 critères spécifiques et pertinents pour cette question
- suggestedCategory: catégorie suggérée (Technologie, Voyages, Carrière, etc.)
- emoji: emoji approprié pour cette question

Exemple de format:
{
  "criteria": [
    {"id": "performance", "name": "Performance"},
    {"id": "prix", "name": "Prix"},
    {"id": "design", "name": "Design"}
  ],
  "suggestedCategory": "Technologie",
  "emoji": "💻"
}`;

    const result = await callOpenAiApi(prompt, uploadedFiles);
    return result;
  } catch (error) {
    console.error('Error generating criteria:', error);
    // Fallback en cas d'erreur
    return {
      criteria: [
        { id: "prix", name: "Prix" },
        { id: "qualite", name: "Qualité" },
        { id: "facilite", name: "Facilité d'utilisation" },
        { id: "durabilite", name: "Durabilité" }
      ],
      suggestedCategory: "Général",
      emoji: "🤔"
    };
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
    // Utiliser directement l'Edge Function OpenAI
    const { callOpenAiApi } = await import('./openai');
    
    // Construire le prompt pour l'analyse
    const prompt = `Analyse cette question et fournis une recommandation détaillée avec des options.

Question: ${dilemma}

Critères d'évaluation:
${criteria.map(c => `- ${c.name}`).join('\n')}

Réponds au format JSON avec:
- recommendation: la meilleure option recommandée
- description: explication détaillée de pourquoi cette option est recommandée
- breakdown: array d'objets avec {option, pros, cons, score} pour chaque option évaluée
- imageQuery: terme de recherche pour une image représentative`;

    const result = await callOpenAiApi(prompt, uploadedFiles);
    
    // 🔗 Enrichir automatiquement avec les liens Google
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
