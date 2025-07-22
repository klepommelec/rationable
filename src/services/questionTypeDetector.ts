
export type QuestionType = 'factual' | 'comparative' | 'simple-choice';

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
    
    // Questions "qui est" améliorées pour les champions et records
    /\b(qui est)\b.*\b(champion|championne|vainqueur|gagnant|détenteur|détentrice)\b/i,
    /\b(qui est)\b.*\b(record|titre|médaille|prix|trophée)\b/i,
    /\b(qui détient|qui possède|qui a)\b.*\b(record|titre|championnat)\b/i,
    /\b(who is|who holds|who has)\b.*\b(champion|record|title|medal)\b/i,
    
    // Questions sportives spécifiques
    /\b(qui est champion|qui est championne)\b.*\b(olympique|du monde|mondial|mondiale)\b/i,
    /\b(champion olympique|championne olympique|médaille d'or|record du monde|record olympique)\b/i,
    /\b(olympic champion|world champion|gold medal|world record|olympic record)\b/i,
    /\b(qui a gagné|qui a remporté|vainqueur de|gagnant de)\b.*\b(championnat|compétition|tournoi|jeux)\b/i,
    /\b(who won|winner of|champion of)\b.*\b(championship|competition|tournament|games)\b/i,
    
    // Questions spécifiques à réponse unique
    /\b(qui a été.*choix|who was.*pick|who was.*selected)\b/i,
    /\b(quel.*premier choix|what.*first pick|which.*first choice)\b/i,
    /\b(1er choix|premier choix|first pick|first choice)\b/i,
    
    // Questions avec réponse unique évidente
    /\b(prix de|price of|cost of)\b/i,
    
    // Questions de classement et palmarès
    /\b(classement|ranking|palmarès|meilleur temps|best time)\b/i,
    /\b(numéro un|number one|premier au monde|world number one)\b/i
  ];
  
  // Patterns pour questions de choix simple (une recommandation forte)
  const simpleChoicePatterns = [
    // Questions "quel est le meilleur" sans comparaison explicite
    /\b(quel est le meilleur|quelle est la meilleure|what is the best|which is the best)\b/i,
    /\b(quel.*recommand|quelle.*recommand|what.*recommend|which.*recommend)\b/i,
    /\b(que me conseillez|que me conseilles|what do you recommend)\b/i,
    /\b(le top|le meilleur choix|best choice|top choice)\b/i,
    
    // Questions d'achat/choix sans comparaison explicite
    /\b(quel .* (acheter|choisir|prendre) pour|quelle .* (acheter|choisir|prendre) pour)\b/i,
    /\b(what .* (buy|choose|get) for)\b/i,
    
    // Questions avec contexte spécifique mais pas de comparaison
    /\b(pour .* quel|pour .* quelle|for .* what|for .* which)\b/i,
    
    // Questions de destination et voyage
    /\b(où (partir|aller|voyager)|where to (go|travel|visit))\b/i,
    /\b(que faire|what to do)\b/i
  ];
  
  // Patterns pour questions comparatives (vraie comparaison)
  const comparativePatterns = [
    // Questions de choix/comparaison explicite
    /\b(choisir entre|ou|vs|versus|comparer|compare)\b/i,
    /\b(différence entre|alternative|lequel|laquelle|which one|better)\b/i,
    /\b(plutôt|rather|instead)\b/i,
    
    // Listes d'options (virgules, "ou")
    /\b(ou|or)\b/,
    /,.*,/,
    
    // Questions avec critères multiples (budget, besoins, etc.)
    /\b(selon.*et|en fonction.*et|based on.*and|considering.*and)\b/i,
    /\b(budget.*besoins|besoins.*budget|needs.*budget|budget.*needs)\b/i,
    /\b(critères|criteria|requirements|specifications)\b/i,
    
    // Questions d'achat avec contexte comparatif
    /\b(quel.*acheter.*selon|quelle.*acheter.*selon|what.*buy.*based)\b/i,
    /\b(choisir.*pour.*et|choose.*for.*and)\b/i
  ];
  
  // Vérifier d'abord les patterns factuels (priorité haute)
  const isFactual = factualPatterns.some(pattern => pattern.test(dilemma));
  if (isFactual) {
    console.log(`✅ Detected as FACTUAL: factual pattern matched`);
    return 'factual';
  }
  
  // Vérifier les patterns comparatifs explicites
  const isComparative = comparativePatterns.some(pattern => pattern.test(dilemma));
  if (isComparative) {
    console.log(`✅ Detected as COMPARATIVE: comparative pattern matched`);
    return 'comparative';
  }
  
  // Vérifier les patterns de choix simple
  const isSimpleChoice = simpleChoicePatterns.some(pattern => pattern.test(dilemma));
  if (isSimpleChoice) {
    console.log(`✅ Detected as SIMPLE-CHOICE: simple choice pattern matched`);
    return 'simple-choice';
  }
  
  // Logique spéciale pour les questions d'achat/choix
  const purchaseWords = ['acheter', 'buy', 'purchase', 'get'];
  const choiceWords = ['choisir', 'choose', 'pick', 'select'];
  const recommendWords = ['conseiller', 'recommend', 'suggest', 'advice'];
  
  const hasPurchaseIntent = [...purchaseWords, ...choiceWords, ...recommendWords]
    .some(word => lowerDilemma.includes(word));
  
  if (hasPurchaseIntent) {
    // Si pas de spécificité factuelle et pas de comparaison explicite -> simple choice
    const hasFactualSpecificity = /\b(dernier|dernière|nouveau|nouvelle|récent|récente|latest|newest|new|champion|record)\b/i.test(dilemma);
    
    if (!hasFactualSpecificity) {
      console.log(`✅ Detected as SIMPLE-CHOICE: purchase intent without factual specificity`);
      return 'simple-choice';
    }
  }
  
  // Par défaut pour les questions ouvertes -> simple choice (éviter les comparaisons artificielles)
  console.log(`🎯 Default to SIMPLE-CHOICE for open-ended question`);
  return 'simple-choice';
};
