
export type QuestionType = 'factual' | 'comparative' | 'simple-choice';

export const detectQuestionType = (dilemma: string): QuestionType => {
  const lowerDilemma = dilemma.toLowerCase();
  
  // Mots-clés pour les questions factuelles
  const factualKeywords = [
    'qui est', 'qu\'est-ce que', 'comment', 'pourquoi', 'quand', 'où',
    'qui a', 'combien', 'quelle est', 'quel est', 'définition',
    'expliquer', 'décrire', 'qu\'est-ce qui', 'qui sont',
    'what is', 'who is', 'how', 'why', 'when', 'where', 'what are'
  ];
  
  // Mots-clés pour les questions comparatives
  const comparativeKeywords = [
    'choisir', 'meilleur', 'mieux', 'préférer', 'comparer', 'versus',
    'ou', 'alternative', 'option', 'choix', 'sélectionner',
    'recommander', 'conseiller', 'quel', 'quelle', 'lequel',
    'entre', 'différence', 'avantage', 'inconvénient',
    'choose', 'better', 'best', 'prefer', 'compare', 'vs',
    'or', 'alternative', 'option', 'choice', 'select',
    'recommend', 'which', 'between', 'difference'
  ];
  
  // Patterns spécifiques pour les questions factuelles
  const factualPatterns = [
    /qui\s+(est|a|sont)/,
    /qu'est-ce\s+(que|qui)/,
    /comment\s+/,
    /pourquoi\s+/,
    /quelle?\s+est/,
    /combien\s+/,
    /définition\s+de/,
    /expliquer\s+/,
    /what\s+is/,
    /who\s+is/,
    /how\s+/,
    /why\s+/
  ];
  
  // Patterns spécifiques pour les questions comparatives
  const comparativePatterns = [
    /choisir\s+entre/,
    /meilleur\s+/,
    /mieux\s+que/,
    /ou\s+/,
    /versus|vs/,
    /quel\s+.*\s+choisir/,
    /recommandez?\s+/,
    /conseill[ez]?\s+/,
    /préfér[ez]?\s+/,
    /comparer\s+/,
    /choose\s+between/,
    /better\s+than/,
    /which\s+.*\s+choose/,
    /recommend\s+/,
    /prefer\s+/,
    /compare\s+/
  ];
  
  // Vérifier d'abord les patterns spécifiques
  if (factualPatterns.some(pattern => pattern.test(lowerDilemma))) {
    console.log('🔍 Question detected as FACTUAL by pattern');
    return 'factual';
  }
  
  if (comparativePatterns.some(pattern => pattern.test(lowerDilemma))) {
    console.log('🔍 Question detected as COMPARATIVE by pattern');
    return 'comparative';
  }
  
  // Compter les mots-clés
  const factualCount = factualKeywords.filter(keyword => 
    lowerDilemma.includes(keyword)
  ).length;
  
  const comparativeCount = comparativeKeywords.filter(keyword => 
    lowerDilemma.includes(keyword)
  ).length;
  
  console.log(`📊 Keyword analysis: Factual=${factualCount}, Comparative=${comparativeCount}`);
  
  // Décision basée sur le comptage
  if (factualCount > comparativeCount) {
    console.log('🔍 Question detected as FACTUAL by keyword count');
    return 'factual';
  } else if (comparativeCount > factualCount) {
    console.log('🔍 Question detected as COMPARATIVE by keyword count');
    return 'comparative';
  }
  
  // Si égalité, vérifier la structure de la phrase
  if (lowerDilemma.includes('?')) {
    // Questions avec point d'interrogation sont souvent factuelles
    console.log('🔍 Question detected as FACTUAL (contains question mark)');
    return 'factual';
  }
  
  // Par défaut, considérer comme comparative pour avoir plusieurs options
  console.log('🔍 Question detected as COMPARATIVE by default');
  return 'comparative';
};
