
import { supabase } from '@/integrations/supabase/client';

export interface SummaryOptions {
  maxLines?: number;
  maxLength?: number;
  style?: 'concise' | 'detailed' | 'bullet-points';
}

const DEFAULT_OPTIONS: SummaryOptions = {
  maxLines: 5,
  maxLength: 400,
  style: 'concise'
};

export const summarizeDescription = async (
  originalDescription: string,
  recommendation: string,
  options: SummaryOptions = DEFAULT_OPTIONS
): Promise<string> => {
  // Si la description est déjà courte, la retourner telle quelle
  if (originalDescription.length <= (options.maxLength || 400)) {
    return originalDescription;
  }

  console.log('📝 Generating summary for description', {
    originalLength: originalDescription.length,
    maxLines: options.maxLines,
    style: options.style
  });

  try {
    const { data, error } = await supabase.functions.invoke('openai-decision-maker', {
      body: {
        prompt: `Crée une description spécifique de 2-3 lignes maximum pour cette recommandation :

RECOMMANDATION : "${recommendation}"
DESCRIPTION ORIGINALE : "${originalDescription}"

CONSIGNES STRICTES :
- Exactement 2-3 lignes courtes (maximum 200 caractères)
- Commence par "${recommendation}" + ses avantages CONCRETS
- Supprime tout le générique : "Cette décision", "Il est important", etc.
- Focus sur ce qui rend cette option UNIQUE et PRATIQUE
- Style direct et informatif, pas de bla-bla

EXEMPLE : "Chamonix-Mont-Blanc offre un domaine skiable exceptionnel avec un accès facile en train depuis Genève. L'ambiance alpine authentique et les nombreuses activités après-ski en font une destination complète pour les sports d'hiver."

Réponds UNIQUEMENT avec la description spécifique, sans introduction.`,
        model: 'gpt-4o-mini' // Modèle rapide pour les résumés
      }
    });

    if (error) {
      console.error('❌ Error generating summary:', error);
      return truncateIntelligently(originalDescription, options.maxLength || 400);
    }

    const summary = data?.generatedText?.trim();
    
    if (!summary || summary.length < 50) {
      console.warn('⚠️ Generated summary too short, using truncated original');
      return truncateIntelligently(originalDescription, options.maxLength || 400);
    }

    console.log('✅ Summary generated successfully', {
      originalLength: originalDescription.length,
      summaryLength: summary.length,
      compressionRatio: Math.round((1 - summary.length / originalDescription.length) * 100)
    });

    return summary;

  } catch (error) {
    console.error('❌ Failed to generate summary:', error);
    return truncateIntelligently(originalDescription, options.maxLength || 400);
  }
};

// Fonction de troncature intelligente comme fallback
const truncateIntelligently = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  
  // Chercher la dernière phrase complète avant la limite
  const truncated = text.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  // Sinon, chercher le dernier espace pour éviter de couper un mot
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

// Service spécialisé pour les descriptions de décision
export const summarizeDecisionDescription = async (
  originalDescription: string,
  recommendation: string,
  dilemma?: string
): Promise<string> => {
  return summarizeDescription(originalDescription, recommendation, {
    maxLines: 3,
    maxLength: 200,
    style: 'concise'
  });
};
