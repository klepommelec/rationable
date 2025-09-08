import { searchWithPerplexity } from './perplexityService';
import { SupportedLanguage } from './i18nService';

export interface TrendingPromptsResult {
  prompts: string[];
  country: string;
  countryName: string;
}

const getCountryInfo = (language: SupportedLanguage): { code: string, name: string } => {
  // Detect country from navigator.language or fallback to locale config
  const fullLocale = navigator.language || 'fr-FR';
  const [lang, region] = fullLocale.split('-');
  
  try {
    // Use Intl.DisplayNames to get readable country name
    const regionNames = new Intl.DisplayNames([language], { type: 'region' });
    const countryCode = region || (language === 'en' ? 'US' : language === 'fr' ? 'FR' : 'US');
    const countryName = regionNames.of(countryCode) || countryCode;
    
    return { code: countryCode, name: countryName };
  } catch (error) {
    // Fallback
    const fallbackCountries = {
      fr: { code: 'FR', name: 'France' },
      en: { code: 'US', name: 'United States' },
      es: { code: 'ES', name: 'España' },
      it: { code: 'IT', name: 'Italia' },
      de: { code: 'DE', name: 'Deutschland' }
    };
    
    return fallbackCountries[language] || fallbackCountries.en;
  }
};

const parsePromptsFromResponse = (content: string): string[] => {
  if (!content) return [];
  
  // Extract numbered list items (handles various formats)
  const lines = content.split('\n');
  const prompts: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Match patterns like "1. ", "1) ", "- ", etc.
    const match = trimmed.match(/^(?:\d+[\.\)]\s*|[-•]\s*|[*]\s*)(.+)$/);
    if (match && match[1]) {
      const prompt = match[1].trim();
      // Skip empty or very short prompts
      if (prompt.length > 10) {
        prompts.push(prompt);
      }
    }
  }
  
  // If no numbered list found, try to split by periods or line breaks
  if (prompts.length === 0) {
    const sentences = content.split(/[.!?]\s+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => s.trim());
  }
  
  return prompts.slice(0, 5); // Return max 5 prompts
};

export const getTrendingPrompts = async (
  language: SupportedLanguage,
  context: 'personal' | 'professional'
): Promise<TrendingPromptsResult | null> => {
  try {
    const { code: countryCode, name: countryName } = getCountryInfo(language);
    
    // Build context-specific query
    const contextQueries = {
      professional: {
        fr: `En français, liste 5 questions de décision business tendances que les professionnels en ${countryName} se posent cette semaine. Retourne uniquement une liste numérotée de prompts courts.`,
        en: `In English, list 5 trending business decision questions professionals in ${countryName} are asking this week. Return only a numbered list of short prompts.`,
        es: `En español, lista 5 preguntas de decisión empresarial que están de moda y que los profesionales en ${countryName} se hacen esta semana. Devuelve solo una lista numerada de prompts cortos.`,
        it: `In italiano, elenca 5 domande di decisione aziendale di tendenza che i professionisti in ${countryName} si stanno ponendo questa settimana. Restituisci solo un elenco numerato di prompt brevi.`,
        de: `Auf Deutsch, liste 5 trendige geschäftliche Entscheidungsfragen auf, die sich Fachleute in ${countryName} diese Woche stellen. Gib nur eine nummerierte Liste kurzer Prompts zurück.`
      },
      personal: {
        fr: `En français, liste 5 questions de décision personnelles tendances que les gens en ${countryName} se posent cette semaine. Retourne uniquement une liste numérotée de prompts courts.`,
        en: `In English, list 5 trending personal decision questions people in ${countryName} are asking this week. Return only a numbered list of short prompts.`,
        es: `En español, lista 5 preguntas de decisión personal que están de moda y que la gente en ${countryName} se hace esta semana. Devuelve solo una lista numerada de prompts cortos.`,
        it: `In italiano, elenca 5 domande di decisione personale di tendenza che le persone in ${countryName} si stanno ponendo questa settimana. Restituisci solo un elenco numerato di prompt brevi.`,
        de: `Auf Deutsch, liste 5 trendige persönliche Entscheidungsfragen auf, die sich Menschen in ${countryName} diese Woche stellen. Gib nur eine nummerierte Liste kurzer Prompts zurück.`
      }
    };
    
    // Fallback prompts to ensure we always have 3 minimum
    const fallbackPrompts = {
      professional: {
        fr: [
          "Dois-je changer de carrière professionnelle ?",
          "Faut-il investir dans de nouveaux outils pour mon équipe ?",
          "Dois-je accepter cette proposition de partenariat ?"
        ],
        en: [
          "Should I change my professional career?",
          "Should I invest in new tools for my team?",
          "Should I accept this partnership proposal?"
        ],
        es: [
          "¿Debería cambiar mi carrera profesional?",
          "¿Debería invertir en nuevas herramientas para mi equipo?",
          "¿Debería aceptar esta propuesta de asociación?"
        ],
        it: [
          "Dovrei cambiare la mia carriera professionale?",
          "Dovrei investire in nuovi strumenti per il mio team?",
          "Dovrei accettare questa proposta di partnership?"
        ],
        de: [
          "Sollte ich meine berufliche Laufbahn ändern?",
          "Sollte ich in neue Tools für mein Team investieren?",
          "Sollte ich diesen Partnerschaftsvorschlag annehmen?"
        ]
      },
      personal: {
        fr: [
          "Dois-je déménager dans une nouvelle ville ?",
          "Faut-il que j'adopte un animal de compagnie ?",
          "Dois-je reprendre mes études ?"
        ],
        en: [
          "Should I move to a new city?",
          "Should I adopt a pet?",
          "Should I go back to school?"
        ],
        es: [
          "¿Debería mudarme a una nueva ciudad?",
          "¿Debería adoptar una mascota?",
          "¿Debería volver a estudiar?"
        ],
        it: [
          "Dovrei trasferirmi in una nuova città?",
          "Dovrei adottare un animale domestico?",
          "Dovrei tornare a studiare?"
        ],
        de: [
          "Sollte ich in eine neue Stadt ziehen?",
          "Sollte ich ein Haustier adoptieren?",
          "Sollte ich wieder studieren?"
        ]
      }
    };
    
    const query = contextQueries[context][language];
    let prompts: string[] = [];
    
    try {
      const result = await searchWithPerplexity(query, undefined, language);
      
      if (result && result.content) {
        prompts = parsePromptsFromResponse(result.content);
      }
    } catch (error) {
      console.warn('Error fetching from Perplexity:', error);
    }
    
    // Ensure we have at least 3 prompts by using fallbacks
    const finalPrompts = [...prompts];
    const fallbacks = fallbackPrompts[context][language];
    
    while (finalPrompts.length < 3 && fallbacks.length > 0) {
      const fallbackIndex = (finalPrompts.length) % fallbacks.length;
      if (!finalPrompts.includes(fallbacks[fallbackIndex])) {
        finalPrompts.push(fallbacks[fallbackIndex]);
      } else {
        // If all fallbacks are already included, break to avoid infinite loop
        break;
      }
    }
    
    return {
      prompts: finalPrompts.slice(0, 3), // Always return exactly 3 prompts
      country: countryCode,
      countryName
    };
    
  } catch (error) {
    console.error('Error fetching trending prompts:', error);
    // Return fallback prompts even on error
    const { code: countryCode, name: countryName } = getCountryInfo(language);
    const fallbackPrompts = {
      professional: {
        fr: [
          "Dois-je changer de carrière professionnelle ?",
          "Faut-il investir dans de nouveaux outils pour mon équipe ?",
          "Dois-je accepter cette proposition de partenariat ?"
        ],
        en: [
          "Should I change my professional career?",
          "Should I invest in new tools for my team?",
          "Should I accept this partnership proposal?"
        ]
      },
      personal: {
        fr: [
          "Dois-je déménager dans une nouvelle ville ?",
          "Faut-il que j'adopte un animal de compagnie ?",
          "Dois-je reprendre mes études ?"
        ],
        en: [
          "Should I move to a new city?",
          "Should I adopt a pet?",
          "Should I go back to school?"
        ]
      }
    };
    
    const contextPrompts = fallbackPrompts[context][language] || fallbackPrompts[context]['fr'];
    
    return {
      prompts: contextPrompts,
      country: countryCode,
      countryName
    };
  }
};