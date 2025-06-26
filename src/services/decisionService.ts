
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { callOpenAiApi } from './openai';
import { UploadedFileInfo } from './fileUploadService';
import { supabase } from '@/integrations/supabase/client';
import { searchWithPerplexity, detectRealTimeQuery, PerplexitySearchResult } from './perplexityService';

// Cache simple pour éviter les appels Perplexity répétés
const perplexityCache = new Map<string, { data: PerplexitySearchResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedPerplexityData = async (query: string, context: string): Promise<PerplexitySearchResult> => {
  const cacheKey = `${query}-${context}`;
  const cached = perplexityCache.get(cacheKey);
  
  // Vérifier si le cache est encore valide
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('🚀 Using cached Perplexity data');
    return cached.data;
  }
  
  // Appeler Perplexity et mettre en cache
  const data = await searchWithPerplexity(query, context);
  perplexityCache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
};

export const generateCriteriaOnly = async (dilemma: string, files?: UploadedFileInfo[]) => {
  // Détecter si la requête nécessite des données en temps réel
  const needsRealTimeData = detectRealTimeQuery(dilemma);
  let realTimeContext = '';
  let realTimeData = null;

  if (needsRealTimeData) {
    console.log('🔍 Real-time data needed for:', dilemma);
    realTimeData = await getCachedPerplexityData(dilemma, 'Criteria generation for decision making');
    if (realTimeData.content) {
      realTimeContext = `\n\nINFORMATIONS RÉCENTES (${realTimeData.timestamp}):\n${realTimeData.content}`;
    }
  }

  let prompt = `
Analysez ce dilemme et retournez une réponse JSON avec les éléments suivants :

1. "emoji": Un emoji représentant le dilemme (ex: 💻, ✈️, 🏠, etc.)
2. "criteria": Une liste de 3-6 critères importants pour évaluer les options de ce dilemma
3. "suggestedCategory": L'ID de la catégorie la plus appropriée parmi : ${DEFAULT_CATEGORIES.map(c => `"${c.id}" (${c.name} ${c.emoji})`).join(', ')}

Dilemme: "${dilemma}"${realTimeContext}`;

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
    suggestedCategory: response.suggestedCategory,
    realTimeData: realTimeData
  };
};

export const generateOptions = async (
  dilemma: string, 
  criteria: ICriterion[], 
  files?: UploadedFileInfo[],
  cachedRealTimeData?: PerplexitySearchResult
): Promise<IResult> => {
  const criteriaList = criteria.map(c => c.name).join(', ');
  
  // Utiliser les données en cache si disponibles, sinon faire un nouvel appel
  const needsRealTimeData = detectRealTimeQuery(dilemma);
  let realTimeContext = '';
  let realTimeData = null;
  let confidenceContext = '';

  if (needsRealTimeData) {
    if (cachedRealTimeData) {
      console.log('🚀 Réutilisation des données Perplexity en cache');
      realTimeData = cachedRealTimeData;
    } else {
      console.log('🔍 Real-time data needed for options generation:', dilemma);
      realTimeData = await getCachedPerplexityData(dilemma, 'Options analysis and recommendations');
    }
    
    if (realTimeData.content) {
      realTimeContext = `\n\nINFORMATIONS RÉCENTES (${realTimeData.timestamp}):\n${realTimeData.content}`;
      confidenceContext = `\n\nIMPORTANT: Cette analyse utilise des données récentes. Ajustez vos scores et votre niveau de confiance en conséquence. Pour les événements futurs, basez-vous sur les tendances et analyses d'experts récentes.`;
    } else if (realTimeData.error) {
      confidenceContext = `\n\nATTENTION: Données en temps réel non disponibles (${realTimeData.fallbackMessage}). Analysez avec prudence et indiquez l'incertitude dans vos scores.`;
    }
  }
  
  let prompt = `
Analysez ce dilemme et générez des options avec évaluation détaillée.

Dilemme: "${dilemma}"
Critères d'évaluation: ${criteriaList}${realTimeContext}${confidenceContext}`;

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
4. "confidenceLevel": Niveau de confiance de l'analyse (1-100) basé sur la qualité et fraîcheur des données
5. "dataFreshness": Fraîcheur des données utilisées ("very-fresh", "fresh", "moderate", "stale")
6. "infoLinks": Tableau de liens utiles avec "title" et "url" - FOURNIR DES LIENS RÉELS ET FONCTIONNELS ou des descriptions de recherche précises
7. "shoppingLinks": Tableau de liens d'achat avec "title" et "url" - FOURNIR DES LIENS RÉELS vers des sites fiables (Amazon, Fnac, etc.) ou des descriptions de recherche précises
8. "breakdown": Tableau d'objets avec:
   - "option": Nom de l'option
   - "pros": Tableau des avantages
   - "cons": Tableau des inconvénients  
   - "score": Note sur 100 (ajustée selon la qualité des données disponibles)

IMPORTANT pour les liens:
- Privilégiez les sites officiels, Wikipedia, sites gouvernementaux, grandes plateformes reconnues
- Pour les liens d'achat: Amazon.fr, Fnac.com, Darty.com, Boulanger.com, etc.
- Si vous n'êtes pas sûr d'un lien, utilisez une description claire pour une recherche Google

Générez 3-5 options différentes et pertinentes. Soyez concret et actionnable.

Répondez UNIQUEMENT avec un objet JSON valide.`;

  // Lancer l'appel OpenAI et le fetch des vidéos YouTube en parallèle
  const [result, socialData] = await Promise.allSettled([
    callOpenAiApi(prompt, files),
    fetchSocialContent(dilemma)
  ]);

  // Traiter les résultats
  let finalResult;
  if (result.status === 'fulfilled') {
    finalResult = result.value;
  } else {
    console.error('❌ Error in OpenAI call:', result.reason);
    throw result.reason;
  }

  // Ajouter les métadonnées de données en temps réel
  if (realTimeData) {
    finalResult.realTimeData = {
      hasRealTimeData: !!realTimeData.content,
      timestamp: realTimeData.timestamp,
      sourcesCount: realTimeData.sources?.length || 0,
      searchQuery: realTimeData.searchQuery,
      error: realTimeData.error
    };
  }

  // Ajouter le contenu social si disponible
  if (socialData.status === 'fulfilled' && socialData.value?.youtubeVideos && socialData.value.youtubeVideos.length > 0) {
    console.log(`✅ Found ${socialData.value.youtubeVideos.length} YouTube videos`);
    finalResult.socialContent = {
      youtubeVideos: socialData.value.youtubeVideos
    };
  } else if (socialData.status === 'rejected') {
    console.error('❌ Social content fetch failed:', socialData.reason);
  }
  
  return finalResult;
};

// Fonction helper pour fetch du contenu social en parallèle
const fetchSocialContent = async (dilemma: string) => {
  try {
    console.log('🔍 Fetching social content in parallel for:', dilemma);
    const { data, error } = await supabase.functions.invoke('social-content-fetcher', {
      body: { 
        query: dilemma,
        dilemma: dilemma,
        recommendation: dilemma // Utiliser le dilemme comme fallback
      }
    });
    
    if (error) {
      console.error('❌ Error fetching social content:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Social content fetch failed:', error);
    return null;
  }
};
