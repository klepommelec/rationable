
export type QuestionType = 'factual' | 'comparative';

export const detectQuestionType = (dilemma: string): QuestionType => {
  const lowerDilemma = dilemma.toLowerCase();
  
  // Mots-clés pour questions factuelles
  const factualKeywords = [
    'quel est', 'quelle est', 'qui est', 'combien coûte', 'combien mesure',
    'quand', 'où', 'comment', 'pourquoi', 'définition de', 'qu\'est-ce que',
    'date de', 'prix de', 'taille de', 'poids de', 'dernière version',
    'dernier modèle', 'dernière mise à jour', 'caractéristiques de',
    'spécifications de', 'what is', 'when is', 'how much', 'latest'
  ];
  
  // Mots-clés pour questions comparatives
  const comparativeKeywords = [
    'choisir entre', 'meilleur', 'mieux', 'préférer', 'comparer',
    'différence entre', 'avantages', 'inconvénients', 'ou', 'vs',
    'alternative', 'option', 'choix', 'décision', 'lequel',
    'laquelle', 'que choisir', 'recommandation', 'conseil',
    'better', 'best', 'choose', 'compare', 'versus', 'alternative'
  ];
  
  // Détecter les questions avec "ou" (A ou B)
  const hasOrPattern = /\b(ou|or)\b/.test(lowerDilemma);
  
  // Détecter les listes (A, B, C)
  const hasListPattern = /,.*,/.test(dilemma);
  
  // Compter les correspondances
  const factualMatches = factualKeywords.filter(keyword => 
    lowerDilemma.includes(keyword)
  ).length;
  
  const comparativeMatches = comparativeKeywords.filter(keyword => 
    lowerDilemma.includes(keyword)
  ).length;
  
  // Logique de décision
  if (hasOrPattern || hasListPattern) {
    return 'comparative';
  }
  
  if (factualMatches > comparativeMatches && factualMatches > 0) {
    return 'factual';
  }
  
  if (comparativeMatches > factualMatches && comparativeMatches > 0) {
    return 'comparative';
  }
  
  // Par défaut, traiter comme comparatif pour maintenir le comportement actuel
  return 'comparative';
};
