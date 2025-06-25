
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { callOpenAiApi } from './openai';
import { UploadedFileInfo } from './fileUploadService';
import { supabase } from '@/integrations/supabase/client';

export const generateCriteriaOnly = async (dilemma: string, files?: UploadedFileInfo[]) => {
  let prompt = `
Analysez ce dilemme et retournez une réponse JSON avec les éléments suivants :

1. "emoji": Un emoji représentant le dilemme (ex: 💻, ✈️, 🏠, etc.)
2. "criteria": Une liste de 3-6 critères importants pour évaluer les options de ce dilemme
3. "suggestedCategory": L'ID de la catégorie la plus appropriée parmi : ${DEFAULT_CATEGORIES.map(c => `"${c.id}" (${c.name} ${c.emoji})`).join(', ')}

Dilemme: "${dilemma}"`;

  if (files && files.length > 0) {
    prompt += `

Documents joints à analyser (${files.length} fichier(s)) :
${files.map(f => `- ${f.fileName} (${f.fileType})`).join('\n')}

Analysez le contenu de ces documents pour mieux comprendre le contexte du dilemme et ajustez les critères en conséquence.`;
  }

  prompt += `

Répondez UNIQUEMENT avec un objet JSON valide contenant "emoji", "criteria" et "suggestedCategory".

Exemple de format:
{
  "emoji": "💻",
  "criteria": ["Performance", "Prix", "Facilité d'utilisation"],
  "suggestedCategory": "tech"
}`;

  const response = await callOpenAiApi(prompt, files);
  
  return {
    emoji: response.emoji || '🤔',
    criteria: response.criteria || [],
    suggestedCategory: response.suggestedCategory
  };
};

export const generateOptions = async (dilemma: string, criteria: ICriterion[], files?: UploadedFileInfo[]): Promise<IResult> => {
  const criteriaList = criteria.map(c => c.name).join(', ');
  
  let prompt = `
Analysez ce dilemme et générez des options avec évaluation détaillée.

Dilemme: "${dilemma}"
Critères d'évaluation: ${criteriaList}`;

  if (files && files.length > 0) {
    prompt += `

Documents joints à analyser (${files.length} fichier(s)) :
${files.map(f => `- ${f.fileName} (${f.fileType})`).join('\n')}

Analysez le contenu de ces documents pour enrichir votre analyse et vos recommandations.`;
  }

  prompt += `

Retournez un objet JSON avec:
1. "recommendation": La meilleure option recommandée (texte court)
2. "description": Explication détaillée de pourquoi cette option est recommandée
3. "imageQuery": Description pour générer une image (en anglais, très descriptive)
4. "infoLinks": Tableau de liens utiles avec "title" et "url"
5. "shoppingLinks": Tableau de liens d'achat avec "title" et "url"  
6. "breakdown": Tableau d'objets avec:
   - "option": Nom de l'option
   - "pros": Tableau des avantages
   - "cons": Tableau des inconvénients  
   - "score": Note sur 100

Générez 3-5 options différentes et pertinentes. Soyez concret et actionnable.

Répondez UNIQUEMENT avec un objet JSON valide.`;

  const result = await callOpenAiApi(prompt, files);
  
  // Fetch social content (YouTube videos) en parallèle
  try {
    console.log('🔍 Fetching social content for:', result.recommendation);
    const { data: socialData, error } = await supabase.functions.invoke('social-content-fetcher', {
      body: { query: result.recommendation }
    });
    
    if (error) {
      console.error('❌ Error fetching social content:', error);
    } else if (socialData?.youtubeVideos && socialData.youtubeVideos.length > 0) {
      console.log(`✅ Found ${socialData.youtubeVideos.length} YouTube videos`);
      result.socialContent = {
        youtubeVideos: socialData.youtubeVideos
      };
    }
  } catch (socialError) {
    console.error('❌ Social content fetch failed:', socialError);
    // Continue without social content
  }
  
  return result;
};
