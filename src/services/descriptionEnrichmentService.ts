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
  const validation = validateDescriptionQuality(description, dilemma);
  
  if (validation.isValid) {
    return description;
  }

  console.log('🔧 Description générique détectée, amélioration en cours...', validation.issues);

  const context = detectDilemmaContext(dilemma);
  const recommendation = result.recommendation;

  const prompt = `Améliore cette description générique pour la rendre spécifique et pertinente.

DILEMME: "${dilemma}"
DESCRIPTION ACTUELLE: "${description}"
RECOMMANDATION: "${recommendation}"
DOMAINE: ${context.domain}
PROBLÈMES DÉTECTÉS: ${validation.issues.join(', ')}

INSTRUCTIONS:
1. Rends la description SPÉCIFIQUE au dilemme posé
2. Explique POURQUOI cette recommandation est la meilleure
3. Utilise des éléments concrets du dilemme
4. Évite toute phrase générique
5. Sois ${context.tone === 'professional' ? 'professionnel' : context.tone === 'technical' ? 'technique' : 'accessible'}
6. Maximum 150 mots

Réponds uniquement avec la description améliorée.`;

  try {
    const response = await callOpenAiApi(prompt);
    const improvedDescription = response.generatedText || description;
    
    // Validation de la description améliorée
    const newValidation = validateDescriptionQuality(improvedDescription, dilemma);
    if (newValidation.isValid) {
      console.log('✅ Description améliorée avec succès');
      return improvedDescription;
    } else {
      console.log('⚠️ Description toujours générique après amélioration');
      return description; // Retourner l'originale si l'amélioration a échoué
    }
  } catch (error) {
    console.error('Erreur lors de l\'amélioration de la description:', error);
    return description;
  }
};