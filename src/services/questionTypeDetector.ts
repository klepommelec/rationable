
export type QuestionType = 'factual' | 'comparative';

export const detectQuestionType = (dilemma: string): QuestionType => {
  const lowerDilemma = dilemma.toLowerCase();
  
  // Mots-clés pour questions factuelles spécifiques
  const factualKeywords = [
    'quel est le dernier', 'quelle est la dernière', 'quel est le nouveau',
    'quel est le plus récent', 'quelle est la plus récente',
    'quel est le meilleur', 'quelle est la meilleure', // Ces questions ont une réponse objective
    'qui est le', 'qui est la', 'combien coûte', 'combien mesure',
    'quand sort', 'quand sortira', 'date de sortie', 'prix de',
    'définition de', 'qu\'est-ce que', 'c\'est quoi',
    'dernière version', 'dernier modèle', 'dernière mise à jour',
    'what is the latest', 'what is the best', 'when is', 'how much'
  ];
  
  // Mots-clés pour questions comparatives (choix entre options)
  const comparativeKeywords = [
    'choisir entre', 'ou', 'vs', 'versus', 'comparer',
    'différence entre', 'alternative', 'option', 'choix',
    'lequel', 'laquelle', 'que choisir', 'recommandation',
    'conseil', 'plutôt', 'better', 'choose between', 'compare'
  ];
  
  // Patterns spécifiques pour détecter les comparaisons
  const hasOrPattern = /\b(ou|or)\b/.test(lowerDilemma);
  const hasVsPattern = /\b(vs|versus)\b/.test(lowerDilemma);
  const hasListPattern = /,.*,/.test(dilemma);
  const hasChoiceWords = /\b(choisir|choose|pick)\b/.test(lowerDilemma);
  
  // Si c'est clairement une comparaison
  if (hasOrPattern || hasVsPattern || hasListPattern || hasChoiceWords) {
    return 'comparative';
  }
  
  // Compter les correspondances
  const factualMatches = factualKeywords.filter(keyword => 
    lowerDilemma.includes(keyword)
  ).length;
  
  const comparativeMatches = comparativeKeywords.filter(keyword => 
    lowerDilemma.includes(keyword)
  ).length;
  
  // Logique de décision améliorée
  if (factualMatches > 0 && factualMatches >= comparativeMatches) {
    return 'factual';
  }
  
  if (comparativeMatches > 0) {
    return 'comparative';
  }
  
  // Questions ouvertes sans comparaisons explicites = factuelles
  // Ex: "Où partir en vacances ?" -> factuel (recommandation unique)
  const openQuestions = [
    'où', 'quand', 'comment', 'pourquoi', 'que faire', 'où aller',
    'where', 'when', 'how', 'why', 'what to do'
  ];
  
  const hasOpenQuestion = openQuestions.some(word => lowerDilemma.includes(word));
  if (hasOpenQuestion && !hasChoiceWords) {
    return 'factual';
  }
  
  // Par défaut, traiter comme comparatif
  return 'comparative';
};
