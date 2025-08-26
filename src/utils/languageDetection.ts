type SupportedLanguage = 'fr' | 'en' | 'es' | 'it' | 'de';

export const detectLanguage = (text: string): SupportedLanguage => {
  if (!text || text.length < 5) return 'fr'; // Default to French

  const lowerText = text.toLowerCase();

  // French indicators
  const frenchWords = ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'est', 'dans', 'pour', 'avec', 'sur', 'une', 'un', 'que', 'qui', 'comment', 'où', 'quand', 'pourquoi', 'quel', 'quelle', 'dois-je', 'devrais-je'];
  
  // English indicators
  const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'how', 'what', 'where', 'when', 'why', 'which', 'should', 'would', 'could'];
  
  // Spanish indicators
  const spanishWords = ['el', 'la', 'los', 'las', 'de', 'del', 'en', 'y', 'es', 'para', 'con', 'por', 'una', 'un', 'que', 'como', 'donde', 'cuando', 'por qué', 'cual', 'debería'];
  
  // Italian indicators
  const italianWords = ['il', 'la', 'lo', 'gli', 'le', 'di', 'del', 'della', 'e', 'è', 'in', 'per', 'con', 'da', 'una', 'un', 'che', 'come', 'dove', 'quando', 'perché', 'quale', 'dovrei'];
  
  // German indicators
  const germanWords = ['der', 'die', 'das', 'den', 'dem', 'des', 'und', 'oder', 'aber', 'in', 'auf', 'zu', 'für', 'von', 'mit', 'bei', 'eine', 'ein', 'wie', 'was', 'wo', 'wann', 'warum', 'welche', 'sollte'];

  // Count matches for each language
  const languageScores = {
    fr: frenchWords.filter(word => lowerText.includes(word)).length,
    en: englishWords.filter(word => lowerText.includes(word)).length,
    es: spanishWords.filter(word => lowerText.includes(word)).length,
    it: italianWords.filter(word => lowerText.includes(word)).length,
    de: germanWords.filter(word => lowerText.includes(word)).length
  };

  // Find language with highest score
  const detectedLanguage = Object.entries(languageScores)
    .reduce((max, [lang, score]) => 
      score > max.score ? { lang: lang as SupportedLanguage, score } : max,
      { lang: 'fr' as SupportedLanguage, score: 0 }
    ).lang;

  console.log('🌐 Language detection:', {
    text: text.substring(0, 50) + '...',
    scores: languageScores,
    detected: detectedLanguage
  });

  return detectedLanguage;
};

export const getLanguagePrompts = (language: SupportedLanguage = 'fr') => {
  const prompts = {
    fr: {
      systemInstruction: "Vous répondez toujours en français.",
      criteriaInstruction: `Analysez ce dilemme et retournez une réponse JSON avec les éléments suivants :
1. "emoji": Un emoji représentant le dilemme
2. "criteria": Une liste de 3-6 critères importants pour évaluer les options
3. "suggestedCategory": L'ID de la catégorie la plus appropriée

Répondez UNIQUEMENT avec un objet JSON valide.`,
      optionsInstruction: `Analysez ce dilemme et générez EXACTEMENT 6 à 8 options différentes et pertinentes avec évaluation détaillée.

IMPORTANT: Vous DEVEZ générer entre 6 et 8 options distinctes et de qualité avec des scores différents. Évitez les options génériques sans valeur.

Retournez un objet JSON avec:
1. "recommendation": La meilleure option recommandée
2. "description": Explication détaillée de pourquoi cette option est recommandée
3. "imageQuery": Description pour générer une image (en anglais)
4. "breakdown": Tableau de 6-8 objets avec "option", "pros", "cons", "score"

Répondez UNIQUEMENT avec un objet JSON valide.`
    },
    en: {
      systemInstruction: "You always respond in English.",
      criteriaInstruction: `Analyze this dilemma and return a JSON response with the following elements:
1. "emoji": An emoji representing the dilemma
2. "criteria": A list of 3-6 important criteria to evaluate the options
3. "suggestedCategory": The most appropriate category ID

Respond ONLY with a valid JSON object.`,
      optionsInstruction: `Analyze this dilemma and generate EXACTLY 6 to 8 different and relevant options with detailed evaluation.

IMPORTANT: You MUST generate between 6 and 8 distinct, quality options with different scores. Avoid generic options without value.

Return a JSON object with:
1. "recommendation": The best recommended option
2. "description": Detailed explanation of why this option is recommended
3. "imageQuery": Description for image generation (in English)
4. "breakdown": Array of 6-8 objects with "option", "pros", "cons", "score"

Respond ONLY with a valid JSON object.`
    },
    es: {
      systemInstruction: "Siempre respondes en español.",
      criteriaInstruction: `Analiza este dilema y devuelve una respuesta JSON con los siguientes elementos:
1. "emoji": Un emoji que represente el dilema
2. "criteria": Una lista de 3-6 criterios importantes para evaluar las opciones
3. "suggestedCategory": El ID de la categoría más apropiada

Responde ÚNICAMENTE con un objeto JSON válido.`,
      optionsInstruction: `Analiza este dilema y genera EXACTAMENTE 3 a 5 opciones diferentes con evaluación detallada.

IMPORTANTE: DEBES generar entre 3 y 5 opciones distintas con puntuaciones diferentes.

Devuelve un objeto JSON con:
1. "recommendation": La mejor opción recomendada
2. "description": Explicación detallada de por qué se recomienda esta opción
3. "imageQuery": Descripción para generar imagen (en inglés)
4. "breakdown": Array de 3-5 objetos con "option", "pros", "cons", "score"

Responde ÚNICAMENTE con un objeto JSON válido.`
    },
    it: {
      systemInstruction: "Rispondi sempre in italiano.",
      criteriaInstruction: `Analizza questo dilemma e restituisci una risposta JSON con i seguenti elementi:
1. "emoji": Un emoji che rappresenti il dilemma
2. "criteria": Una lista di 3-6 criteri importanti per valutare le opzioni
3. "suggestedCategory": L'ID della categoria più appropriata

Rispondi SOLO con un oggetto JSON valido.`,
      optionsInstruction: `Analizza questo dilemma e genera ESATTAMENTE 3-5 opzioni diverse con valutazione dettagliata.

IMPORTANTE: DEVI generare tra 3 e 5 opzioni distinte con punteggi diversi.

Restituisci un oggetto JSON con:
1. "recommendation": L'opzione migliore raccomandata
2. "description": Spiegazione dettagliata del perché questa opzione è raccomandata
3. "imageQuery": Descrizione per generare immagine (in inglese)
4. "breakdown": Array di 3-5 oggetti con "option", "pros", "cons", "score"

Rispondi SOLO con un oggetto JSON valido.`
    },
    de: {
      systemInstruction: "Du antwortest immer auf Deutsch.",
      criteriaInstruction: `Analysiere dieses Dilemma und gib eine JSON-Antwort mit folgenden Elementen zurück:
1. "emoji": Ein Emoji, das das Dilemma repräsentiert
2. "criteria": Eine Liste von 3-6 wichtigen Kriterien zur Bewertung der Optionen
3. "suggestedCategory": Die am besten geeignete Kategorie-ID

Antworte NUR mit einem gültigen JSON-Objekt.`,
      optionsInstruction: `Analysiere dieses Dilemma und generiere GENAU 3-5 verschiedene Optionen mit detaillierter Bewertung.

WICHTIG: Du MUSST zwischen 3 und 5 verschiedene Optionen mit unterschiedlichen Scores generieren.

Gib ein JSON-Objekt zurück mit:
1. "recommendation": Die beste empfohlene Option
2. "description": Detaillierte Erklärung, warum diese Option empfohlen wird
3. "imageQuery": Beschreibung für Bildgenerierung (auf Englisch)
4. "breakdown": Array von 3-5 Objekten mit "option", "pros", "cons", "score"

Antworte NUR mit einem gültigen JSON-Objekt.`
    }
  };

  return prompts[language] || prompts.fr;
};