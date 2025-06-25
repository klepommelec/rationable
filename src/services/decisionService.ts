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

CONTRAINTES ULTRA-STRICTES DE SÉCURITÉ:
- Votre réponse doit être appropriée pour tous les publics (famille, enfants)
- INTERDICTION ABSOLUE: politique, violence, discrimination, contenu adulte
- Pour les liens, utilisez EXCLUSIVEMENT ces domaines autorisés:
  * Institutions: gov.fr, gouv.fr, europa.eu, who.int, unesco.org
  * Références: wikipedia.org, britannica.com, larousse.fr
  * E-commerce: amazon.fr, fnac.com, darty.com, boulanger.com, leclerc.com, carrefour.fr
  * Voyage/Restaurant: tripadvisor.fr, booking.com, michelin.com, lafourchette.com
  * Médias: lemonde.fr, figaro.fr, bbc.com, reuters.com
  * Tech: apple.com, microsoft.com, google.com, adobe.com
  * Recettes: marmiton.org, 750g.com, cuisineaz.com
- AUCUN autre domaine n'est autorisé
- Privilégiez des recommandations constructives et éducatives

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
1. "recommendation": La meilleure option recommandée (texte approprié et constructif)
2. "description": Explication détaillée et positive (évitez tout contenu négatif)
3. "imageQuery": Description pour image (en anglais, familial et positif)
4. "infoLinks": Liens informatifs avec "title" et "url" - UNIQUEMENT domaines autorisés
5. "shoppingLinks": Liens d'achat avec "title" et "url" - UNIQUEMENT sites autorisés
6. "breakdown": Options avec "option", "pros", "cons" (constructifs), "score"

ATTENTION: Tout lien vers un domaine non autorisé sera automatiquement bloqué.
Générez 3-5 options pertinentes. Restez positif, constructif et familial.

Répondez UNIQUEMENT avec un objet JSON valide.`;

  const result = await callOpenAiApi(prompt, files);
  
  // PHASE 2: Modération ultra-stricte du contenu généré
  const moderationChecks = [
    { content: result.recommendation, name: 'recommendation' },
    { content: result.description, name: 'description' },
    { content: result.imageQuery, name: 'imageQuery' }
  ];

  for (const check of moderationChecks) {
    if (check.content) {
      const moderation = ContentModerationService.moderateText(check.content);
      if (!moderation.isAppropriate) {
        console.error(`🚫 Contenu ${check.name} modéré:`, check.content);
        throw new Error(`Contenu inapproprié généré par l'IA dans ${check.name}: ${moderation.reason}`);
      }
    }
  }

  // PHASE 2: Modération renforcée des options du breakdown
  if (result.breakdown && Array.isArray(result.breakdown)) {
    for (const option of result.breakdown) {
      const optionModeration = ContentModerationService.moderateText(option.option);
      if (!optionModeration.isAppropriate) {
        throw new Error(`Option inappropriée: ${optionModeration.reason}`);
      }
      
      // Vérifier les pros et cons avec un seuil de tolérance zéro
      if (option.pros && Array.isArray(option.pros)) {
        for (const pro of option.pros) {
          const proModeration = ContentModerationService.moderateText(pro);
          if (!proModeration.isAppropriate) {
            throw new Error(`Avantage inapproprié: ${proModeration.reason}`);
          }
        }
      }
      
      if (option.cons && Array.isArray(option.cons)) {
        for (const con of option.cons) {
          const conModeration = ContentModerationService.moderateText(con);
          if (!conModeration.isAppropriate) {
            throw new Error(`Inconvénient inapproprié: ${conModeration.reason}`);
          }
        }
      }
    }
  }

  // PHASE 2: Validation stricte des liens avec rapport détaillé
  if (result.infoLinks && Array.isArray(result.infoLinks)) {
    const linkValidation = ContentModerationService.validateLinksStrict(
      result.infoLinks,
      dilemma
    );
    
    // Remplacer les liens bloqués par des recherches sécurisées
    result.infoLinks = linkValidation.validLinks.concat(
      linkValidation.blockedLinks.map(blocked => ({
        title: blocked.title,
        url: ContentModerationService.generateSafeSearchUrl(blocked.title)
      }))
    );

    // Log des liens bloqués pour monitoring
    if (linkValidation.totalBlocked > 0) {
      console.warn(`⚠️ ${linkValidation.totalBlocked} liens d'information bloqués et remplacés par des recherches sécurisées`);
      linkValidation.blockedLinks.forEach(blocked => {
        console.warn(`🚫 Lien bloqué: ${blocked.url} - ${blocked.reason}`);
      });
    }
  }

  if (result.shoppingLinks && Array.isArray(result.shoppingLinks)) {
    const shoppingValidation = ContentModerationService.validateLinksStrict(
      result.shoppingLinks,
      `acheter ${result.recommendation}`
    );
    
    // Remplacer les liens d'achat bloqués par des recherches shopping sécurisées
    result.shoppingLinks = shoppingValidation.validLinks.concat(
      shoppingValidation.blockedLinks.map(blocked => ({
        title: blocked.title,
        url: ContentModerationService.generateSafeSearchUrl(`acheter ${blocked.title}`, true)
      }))
    );

    // Log des liens d'achat bloqués
    if (shoppingValidation.totalBlocked > 0) {
      console.warn(`⚠️ ${shoppingValidation.totalBlocked} liens d'achat bloqués et remplacés par des recherches shopping sécurisées`);
      shoppingValidation.blockedLinks.forEach(blocked => {
        console.warn(`🚫 Lien d'achat bloqué: ${blocked.url} - ${blocked.reason}`);
      });
    }
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
