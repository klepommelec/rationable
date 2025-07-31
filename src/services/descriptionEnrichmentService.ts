import { IResult } from '@/types/decision';
import { callOpenAiApi } from './openai';

export interface DescriptionEnrichmentOptions {
  dilemma: string;
  questionType: 'factual' | 'comparative';
  rawResponse?: string;
  domain?: string;
}

/**
 * Valide si une description est générique ou spécifique
 */
export const validateDescriptionQuality = (description: string, dilemma: string): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  const genericPhrases = [
    'le choix de',
    'cette décision',
    'il est important de',
    'cela dépend de',
    'en conclusion',
    'pour résumer',
    'option a',
    'option b',
    'joueur a',
    'joueur b',
    'produit a',
    'produit b'
  ];

  const lowerDescription = description.toLowerCase();
  const lowerDilemma = dilemma.toLowerCase();

  // Vérifier les phrases génériques
  const foundGenericPhrases = genericPhrases.filter(phrase => 
    lowerDescription.includes(phrase)
  );
  
  if (foundGenericPhrases.length > 0) {
    issues.push(`Contient des phrases génériques: ${foundGenericPhrases.join(', ')}`);
  }

  // Vérifier la longueur minimale
  if (description.length < 50) {
    issues.push('Description trop courte');
  }

  // Vérifier si la description contient des éléments du dilemme
  const dilemmaWords = lowerDilemma.split(' ').filter(word => word.length > 3);
  const hasContextualWords = dilemmaWords.some(word => 
    lowerDescription.includes(word)
  );

  if (!hasContextualWords && dilemmaWords.length > 0) {
    issues.push('Manque de contexte spécifique au dilemme');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Enrichit une réponse factuelle brute de Perplexity
 */
export const enrichFactualDescription = async (
  dilemma: string,
  rawResponse: string,
  domain?: string
): Promise<string> => {
  const prompt = `Enrichissez cette réponse factuelle en gardant la cohérence totale avec la réponse originale:

DILEMME: "${dilemma}"
RÉPONSE FACTUELLE: "${rawResponse}"

Créez une description enrichie qui:
1. RESPECTE EXACTEMENT la réponse factuelle originale "${rawResponse}"
2. Ajoute du contexte explicatif pertinent au domaine ${domain || 'général'}
3. Explique pourquoi c'est la bonne réponse
4. Reste factuelle et précise

INTERDICTIONS ABSOLUES:
- Ne changez PAS la réponse originale "${rawResponse}"
- Pas de phrases génériques comme "Le choix de...", "Cette décision..."
- Pas d'informations contradictoires

Format: Description enrichie en 2-3 phrases maximum.`;

  try {
    const response = await callOpenAiApi(prompt);
    return response.generatedText || rawResponse;
  } catch (error) {
    console.error('Erreur lors de l\'enrichissement de la description:', error);
    return rawResponse;
  }
};

/**
 * Analyse le domaine d'un dilemme pour personnaliser la description
 */
export const detectDilemmaContext = (dilemma: string): {
  domain: string;
  keywords: string[];
  tone: 'professional' | 'casual' | 'technical';
} => {
  const lowerDilemma = dilemma.toLowerCase();
  
  // Détection du domaine
  let domain = 'général';
  let tone: 'professional' | 'casual' | 'technical' = 'casual';
  
  if (lowerDilemma.includes('ordinateur') || lowerDilemma.includes('tech') || lowerDilemma.includes('logiciel')) {
    domain = 'technologie';
    tone = 'technical';
  } else if (lowerDilemma.includes('voyage') || lowerDilemma.includes('vacances') || lowerDilemma.includes('destination')) {
    domain = 'voyage';
    tone = 'casual';
  } else if (lowerDilemma.includes('voiture') || lowerDilemma.includes('achat') || lowerDilemma.includes('investissement')) {
    domain = 'achat';
    tone = 'professional';
  } else if (lowerDilemma.includes('sport') || lowerDilemma.includes('équipe') || lowerDilemma.includes('joueur')) {
    domain = 'sport';
    tone = 'casual';
  } else if (lowerDilemma.includes('carrière') || lowerDilemma.includes('travail') || lowerDilemma.includes('emploi')) {
    domain = 'carrière';
    tone = 'professional';
  }

  // Extraction des mots-clés importants
  const keywords = dilemma
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 5);

  return { domain, keywords, tone };
};

/**
 * Améliore une description existante si elle est générique
 */
export const improveDescription = async (
  description: string,
  dilemma: string,
  result: IResult
): Promise<string> => {
  // Vérifier si la description mentionne déjà la recommandation
  const mentionsRecommendation = description.toLowerCase().includes(result.recommendation.toLowerCase());
  
  if (mentionsRecommendation) {
    const validation = validateDescriptionQuality(description, dilemma);
    if (validation.isValid) {
      return description;
    }
  }

  console.log('🔧 Description nécessite une amélioration focalisée sur la recommandation...');

  const context = detectDilemmaContext(dilemma);

  const prompt = `Créé une description spécifique et utile pour cette recommandation:

DILEMME: "${dilemma}"
RECOMMANDATION: "${result.recommendation}"
CONTEXTE: ${context.domain}
DESCRIPTION ACTUELLE: "${description}"

CONSIGNES CRITIQUES:
1. Commence OBLIGATOIREMENT par "${result.recommendation}"
2. Explique les bénéfices CONCRETS et SPÉCIFIQUES de cette option
3. Utilise le vocabulaire du domaine ${context.domain}
4. INTERDICTION d'utiliser: "Cette décision", "Le choix de", "Il est important", "En conclusion"
5. Maximum 100 mots, style direct et informatif
6. Intègre des éléments du contexte "${dilemma}"

MODÈLE OBLIGATOIRE:
"${result.recommendation} [bénéfice principal spécifique] grâce à [caractéristique concrète]. Cette option [avantage pratique] pour [situation du dilemma]. [Détail technique/pratique précis]."

EXEMPLES:
- Pour un restaurant: "Restaurant XYZ offre la meilleure expérience culinaire grâce à sa cuisine française authentique et son service personnalisé. Cette option garantit un repas mémorable pour votre anniversaire de mariage avec un cadre romantique et une cave à vins exceptionnelle."
- Pour un produit tech: "iPhone 15 Pro combine puissance et efficacité énergétique grâce à sa puce A17 Pro et son autonomie de 23h. Cette option répond parfaitement à vos besoins de photographe mobile avec son système de caméras avancé et sa résistance professionnelle."

Réponds UNIQUEMENT avec la nouvelle description focalisée.`;

  try {
    const response = await callOpenAiApi(prompt);
    const improvedDescription = response.generatedText || description;
    
    // Validation stricte : doit mentionner la recommandation
    const mentionsRecommendationAfter = improvedDescription.toLowerCase().includes(result.recommendation.toLowerCase());
    
    if (!mentionsRecommendationAfter) {
      console.log('⚠️ Forçage de la mention de la recommandation');
      return `${result.recommendation} est recommandé. ${improvedDescription.replace(/^[A-Z]/, (char) => char.toLowerCase())}`;
    }
    
    const validation = validateDescriptionQuality(improvedDescription, dilemma);
    
    if (validation.isValid) {
      console.log('✅ Description améliorée avec succès');
      return improvedDescription;
    } else {
      console.log('⚠️ Description toujours générique, utilisation du fallback');
      return `${result.recommendation} est la solution recommandée en raison de ses avantages pour votre situation.`;
    }
  } catch (error) {
    console.error('Erreur lors de l\'amélioration de la description:', error);
    return `${result.recommendation} est recommandé pour cette situation.`;
  }
};