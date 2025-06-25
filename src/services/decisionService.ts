
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { callOpenAiApi } from './openai';
import { UploadedFileInfo } from './fileUploadService';
import { supabase } from '@/integrations/supabase/client';
import { ContentModerationService } from './contentModerationService';

export const generateCriteriaOnly = async (dilemma: string, files?: UploadedFileInfo[]) => {
  // Modérer le dilemme avant traitement
  const dilemmaModeration = ContentModerationService.moderateText(dilemma);
  if (!dilemmaModeration.isAppropriate) {
    throw new Error(`Contenu inapproprié détecté dans le dilemme: ${dilemmaModeration.reason}`);
  }

  let prompt = `
Analysez ce dilemme et retournez une réponse JSON avec les éléments suivants :

1. "emoji": Un emoji représentant le dilemme (ex: 💻, ✈️, 🏠, etc.)
2. "criteria": Une liste de 3-6 critères importants pour évaluer les options de ce dilemme
3. "suggestedCategory": L'ID de la catégorie la plus appropriée parmi : ${DEFAULT_CATEGORIES.map(c => `"${c.id}" (${c.name} ${c.emoji})`).join(', ')}

IMPORTANT: Votre réponse doit être appropriée pour tous les publics, éviter tout contenu politique, violent, discriminatoire ou inapproprié.

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
  
  // Modérer la réponse de l'IA
  if (response.criteria && Array.isArray(response.criteria)) {
    for (const criterion of response.criteria) {
      const moderation = ContentModerationService.moderateText(criterion);
      if (!moderation.isAppropriate) {
        console.warn(`Critère modéré: ${criterion} - ${moderation.reason}`);
        throw new Error(`Contenu inapproprié généré par l'IA: ${moderation.reason}`);
      }
    }
  }
  
  return {
    emoji: response.emoji || '🤔',
    criteria: response.criteria || [],
    suggestedCategory: response.suggestedCategory
  };
};

export const generateOptions = async (dilemma: string, criteria: ICriterion[], files?: UploadedFileInfo[]): Promise<IResult> => {
  // Modérer le dilemme
  const dilemmaModeration = ContentModerationService.moderateText(dilemma);
  if (!dilemmaModeration.isAppropriate) {
    throw new Error(`Contenu inapproprié détecté: ${dilemmaModeration.reason}`);
  }

  const criteriaList = criteria.map(c => c.name).join(', ');
  
  let prompt = `
Analysez ce dilemme et générez des options avec évaluation détaillée.

CONTRAINTES IMPORTANTES:
- Votre réponse doit être appropriée pour tous les publics
- Évitez tout contenu politique, violent, discriminatoire ou inapproprié
- Privilégiez des recommandations constructives et positives
- Pour les liens, utilisez UNIQUEMENT des sites web reconnus et fiables

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
1. "recommendation": La meilleure option recommandée (texte court et approprié)
2. "description": Explication détaillée et positive de pourquoi cette option est recommandée
3. "imageQuery": Description pour générer une image (en anglais, très descriptive, appropriée)
4. "infoLinks": Tableau de liens utiles avec "title" et "url" - UTILISEZ UNIQUEMENT des sites reconnus et fiables
5. "shoppingLinks": Tableau de liens d'achat avec "title" et "url" - UTILISEZ UNIQUEMENT des sites de confiance
6. "breakdown": Tableau d'objets avec:
   - "option": Nom de l'option (approprié)
   - "pros": Tableau des avantages (positifs)
   - "cons": Tableau des inconvénients (constructifs)
   - "score": Note sur 100

SITES AUTORISÉS pour les liens:
- Wikipedia, sites gouvernementaux officiels
- Amazon.fr, Fnac.com, Darty.com, Boulanger.com (pour l'achat)
- TripAdvisor, Booking.com, LaFourchette (pour voyage/restaurant)
- Sites officiels des marques/entreprises

Générez 3-5 options différentes et pertinentes. Soyez concret, positif et approprié.

Répondez UNIQUEMENT avec un objet JSON valide.`;

  const result = await callOpenAiApi(prompt, files);
  
  // Modération ultra-stricte du contenu généré
  const moderationChecks = [
    { content: result.recommendation, name: 'recommendation' },
    { content: result.description, name: 'description' },
    { content: result.imageQuery, name: 'imageQuery' }
  ];

  for (const check of moderationChecks) {
    if (check.content) {
      const moderation = ContentModerationService.moderateText(check.content);
      if (!moderation.isAppropriate) {
        console.error(`Contenu ${check.name} modéré:`, check.content);
        throw new Error(`Contenu inapproprié généré par l'IA dans ${check.name}: ${moderation.reason}`);
      }
    }
  }

  // Modération des options du breakdown
  if (result.breakdown && Array.isArray(result.breakdown)) {
    for (const option of result.breakdown) {
      const optionModeration = ContentModerationService.moderateText(option.option);
      if (!optionModeration.isAppropriate) {
        throw new Error(`Option inappropriée: ${optionModeration.reason}`);
      }
      
      // Vérifier les pros et cons
      if (option.pros) {
        for (const pro of option.pros) {
          const proModeration = ContentModerationService.moderateText(pro);
          if (!proModeration.isAppropriate) {
            throw new Error(`Avantage inapproprié: ${proModeration.reason}`);
          }
        }
      }
      
      if (option.cons) {
        for (const con of option.cons) {
          const conModeration = ContentModerationService.moderateText(con);
          if (!conModeration.isAppropriate) {
            throw new Error(`Inconvénient inapproprié: ${conModeration.reason}`);
          }
        }
      }
    }
  }

  // Validation et nettoyage des liens
  if (result.infoLinks && Array.isArray(result.infoLinks)) {
    result.infoLinks = result.infoLinks
      .map(link => ({
        ...link,
        url: ContentModerationService.validateUrl(link.url).isValid 
          ? link.url 
          : ContentModerationService.generateSafeSearchUrl(link.title || dilemma)
      }))
      .filter(link => {
        const titleModeration = ContentModerationService.moderateText(link.title);
        return titleModeration.isAppropriate;
      });
  }

  if (result.shoppingLinks && Array.isArray(result.shoppingLinks)) {
    result.shoppingLinks = result.shoppingLinks
      .map(link => ({
        ...link,
        url: ContentModerationService.validateUrl(link.url).isValid 
          ? link.url 
          : ContentModerationService.generateSafeSearchUrl(`acheter ${result.recommendation}`, true)
      }))
      .filter(link => {
        const titleModeration = ContentModerationService.moderateText(link.title);
        return titleModeration.isAppropriate;
      });
  }
  
  // Fetch social content (vidéos YouTube filtrées) en parallèle
  try {
    console.log('🔍 Fetching social content for:', result.recommendation);
    const { data: socialData, error } = await supabase.functions.invoke('social-content-fetcher', {
      body: { 
        query: result.recommendation,
        dilemma: dilemma,
        recommendation: result.recommendation
      }
    });
    
    if (error) {
      console.error('❌ Error fetching social content:', error);
    } else if (socialData?.youtubeVideos && socialData.youtubeVideos.length > 0) {
      console.log(`✅ Found ${socialData.youtubeVideos.length} filtered YouTube videos`);
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
