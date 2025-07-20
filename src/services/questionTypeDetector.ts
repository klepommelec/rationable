
export type QuestionType = 'factual' | 'comparative';

export const detectQuestionType = (dilemma: string): QuestionType => {
  const lowerDilemma = dilemma.toLowerCase();
  
  console.log(`🔍 Analyzing question: "${dilemma}"`);
  
  // Patterns pour questions factuelles spécifiques (réponse unique et objective)
  const factualPatterns = [
    // Questions sur "le dernier", "le plus récent", "le nouveau" 
    /\b(quel est le dernier|quelle est la dernière|quel est le plus récent|quelle est la plus récente)\b/i,
    /\b(quel est le nouveau|quelle est la nouvelle|dernière version|dernier modèle)\b/i,
    /\b(what is the latest|what is the newest|latest version|newest model)\b/i,
    
    // Questions factuelles directes
    /\b(qu'est-ce que|c'est quoi|définition de|what is|define)\b/i,
    /\b(combien coûte|combien mesure|how much|how tall|how long)\b/i,
    /\b(quand sort|quand sortira|date de sortie|when will|release date)\b/i,
    /\b(qui est le|qui est la|who is)\b/i,
    
    // Questions avec réponse unique évidente
    /\b(prix de|price of|cost of)\b/i
  ];
  
  // Patterns pour questions comparatives/de choix
  const comparativePatterns = [
    // Questions de choix/achat sans spécifier "dernier" ou "nouveau"
    /\b(quel .* (acheter|choisir|prendre|conseiller))\b/i,
    /\b(quelle .* (acheter|choisir|prendre|conseiller))\b/i,
    /\b(what .* (buy|choose|get|recommend))\b/i,
    
    // Mots-clés comparatifs explicites
    /\b(choisir entre|ou|vs|versus|comparer|compare)\b/i,
    /\b(différence entre|alternative|option|choix|choice)\b/i,
    /\b(lequel|laquelle|que choisir|which one|better)\b/i,
    /\b(recommandation|conseil|recommend|suggest)\b/i,
    /\b(plutôt|rather|instead)\b/i,
    
    // Questions ouvertes de conseil
    /\b(où (partir|aller|voyager)|where to (go|travel|visit))\b/i,
    /\b(que faire|what to do|how to)\b/i
  ];
  
  // Vérifier d'abord les patterns factuels
  const isFactual = factualPatterns.some(pattern => pattern.test(dilemma));
  if (isFactual) {
    console.log(`✅ Detected as FACTUAL: factual pattern matched`);
    return 'factual';
  }
  
  // Vérifier les patterns comparatifs
  const isComparative = comparativePatterns.some(pattern => pattern.test(dilemma));
  if (isComparative) {
    console.log(`✅ Detected as COMPARATIVE: comparative pattern matched`);
    return 'comparative';
  }
  
  // Logique spéciale pour les questions d'achat/choix
  const purchaseWords = ['acheter', 'buy', 'purchase', 'get'];
  const choiceWords = ['choisir', 'choose', 'pick', 'select'];
  const recommendWords = ['conseiller', 'recommend', 'suggest', 'advice'];
  
  const hasPurchaseIntent = [...purchaseWords, ...choiceWords, ...recommendWords]
    .some(word => lowerDilemma.includes(word));
  
  // Si c'est une question d'achat/choix ET qu'il n'y a pas de spécificité factuelle
  if (hasPurchaseIntent) {
    // Vérifier s'il n'y a pas de spécificité factuelle comme "dernier", "nouveau"
    const hasFactualSpecificity = /\b(dernier|dernière|nouveau|nouvelle|récent|récente|latest|newest|new)\b/i.test(dilemma);
    
    if (!hasFactualSpecificity) {
      console.log(`✅ Detected as COMPARATIVE: purchase/choice intent without factual specificity`);
      return 'comparative';
    }
  }
  
  // Détecter les listes d'options (virgules, "ou")
  const hasOrPattern = /\b(ou|or)\b/.test(lowerDilemma);
  const hasVsPattern = /\b(vs|versus)\b/.test(lowerDilemma);
  const hasListPattern = /,.*,/.test(dilemma);
  
  if (hasOrPattern || hasVsPattern || hasListPattern) {
    console.log(`✅ Detected as COMPARATIVE: explicit choice patterns`);
    return 'comparative';
  }
  
  // Par défaut pour les questions ouvertes sans spécificité -> comparatif
  console.log(`🎯 Default to COMPARATIVE for open-ended question`);
  return 'comparative';
};
