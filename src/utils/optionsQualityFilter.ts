import { IBreakdownItem } from '@/types/decision';

/**
 * Filtre de qualité pour les options générées
 * Élimine les options génériques, dupliquées ou sans valeur
 */

export interface QualityMetrics {
  totalOptions: number;
  filteredOptions: number;
  duplicatesRemoved: number;
  genericOptionsRemoved: number;
  lowQualityRemoved: number;
}

// Mots-clés génériques à éviter dans les noms d'options
const GENERIC_KEYWORDS = [
  'option', 'alternative', 'choix', 'solution', 'possibilité',
  'variante', 'version', 'modèle', 'type', 'catégorie',
  'premium', 'basique', 'standard', 'économique', 'milieu de gamme',
  'première', 'deuxième', 'troisième', 'quatrième', 'cinquième'
];

// Mots-clés génériques dans les pros/cons
const GENERIC_PROS_CONS = [
  'bon rapport qualité-prix', 'facile à utiliser', 'populaire',
  'bien noté', 'recommandé', 'apprécié', 'reconnu',
  'disponible', 'accessible', 'pratique', 'convenablement'
];

/**
 * Vérifie si une option est générique ou sans valeur
 */
const isGenericOption = (option: IBreakdownItem): boolean => {
  const optionName = option.option.toLowerCase();
  
  // Vérifier si le nom contient des mots-clés génériques
  const hasGenericKeywords = GENERIC_KEYWORDS.some(keyword => 
    optionName.includes(keyword.toLowerCase())
  );
  
  // Vérifier si le nom est trop court ou peu descriptif
  const isTooBrief = option.option.length < 5 || option.option.split(' ').length < 2;
  
  // Vérifier si les pros/cons sont génériques
  const hasGenericPros = option.pros.some(pro => 
    GENERIC_PROS_CONS.some(generic => 
      pro.toLowerCase().includes(generic.toLowerCase())
    )
  );
  
  // Vérifier si les pros sont trop peu nombreux ou vides
  const hasInsufficientPros = option.pros.length < 2 || 
    option.pros.some(pro => pro.length < 10);
  
  return hasGenericKeywords || isTooBrief || (hasGenericPros && hasInsufficientPros);
};

/**
 * Calcule un score de similarité entre deux chaînes de caractères
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const words1 = str1.toLowerCase().split(' ');
  const words2 = str2.toLowerCase().split(' ');
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
};

/**
 * Détecte les doublons en se basant sur la similarité des noms
 */
const findDuplicates = (options: IBreakdownItem[]): number[] => {
  const duplicateIndices: number[] = [];
  
  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length; j++) {
      const similarity = calculateSimilarity(options[i].option, options[j].option);
      
      // Si similarité > 70%, considérer comme doublon
      if (similarity > 0.7) {
        // Garder l'option avec le meilleur score
        const indexToRemove = options[i].score >= options[j].score ? j : i;
        if (!duplicateIndices.includes(indexToRemove)) {
          duplicateIndices.push(indexToRemove);
        }
      }
    }
  }
  
  return duplicateIndices;
};

/**
 * Vérifie la qualité d'une option selon le contexte du dilemme
 */
const isContextuallyRelevant = (option: IBreakdownItem, dilemma: string): boolean => {
  const dilemmaLower = dilemma.toLowerCase();
  const optionLower = option.option.toLowerCase();
  
  // Extraire les mots-clés importants du dilemme
  const dilemmaKeywords = dilemmaLower
    .split(' ')
    .filter(word => word.length > 3)
    .filter(word => !['pour', 'dans', 'avec', 'quelle', 'quel', 'comment', 'choisir'].includes(word));
  
  // Vérifier si l'option contient au moins un mot-clé du dilemme
  const hasRelevantKeyword = dilemmaKeywords.some(keyword => 
    optionLower.includes(keyword) || 
    option.pros.some(pro => pro.toLowerCase().includes(keyword))
  );
  
  return hasRelevantKeyword;
};

/**
 * Filtre principal pour assurer la qualité des options
 */
export const filterQualityOptions = (
  options: IBreakdownItem[], 
  dilemma: string,
  maxOptions: number = 8
): { filteredOptions: IBreakdownItem[]; metrics: QualityMetrics } => {
  console.log(`🔍 Starting quality filter with ${options.length} options`);
  
  const metrics: QualityMetrics = {
    totalOptions: options.length,
    filteredOptions: 0,
    duplicatesRemoved: 0,
    genericOptionsRemoved: 0,
    lowQualityRemoved: 0
  };
  
  // 1. Supprimer les doublons
  const duplicateIndices = findDuplicates(options);
  metrics.duplicatesRemoved = duplicateIndices.length;
  
  let filtered = options.filter((_, index) => !duplicateIndices.includes(index));
  console.log(`📊 After duplicate removal: ${filtered.length} options`);
  
  // 2. Supprimer les options génériques
  const beforeGenericRemoval = filtered.length;
  filtered = filtered.filter(option => !isGenericOption(option));
  metrics.genericOptionsRemoved = beforeGenericRemoval - filtered.length;
  console.log(`📊 After generic removal: ${filtered.length} options`);
  
  // 3. Vérifier la pertinence contextuelle
  const beforeRelevanceCheck = filtered.length;
  filtered = filtered.filter(option => isContextuallyRelevant(option, dilemma));
  metrics.lowQualityRemoved = beforeRelevanceCheck - filtered.length;
  console.log(`📊 After relevance check: ${filtered.length} options`);
  
  // 4. Trier par score et garder les meilleures options
  filtered = filtered
    .sort((a, b) => b.score - a.score)
    .slice(0, maxOptions);
  
  // 5. Si on n'a pas assez d'options après filtrage, garder quelques options moins strictes
  if (filtered.length < 3) {
    console.log(`⚠️ Not enough quality options (${filtered.length}), relaxing criteria`);
    
    // Reprendre depuis les options non génériques mais autoriser certaines moins pertinentes
    const relaxedFiltered = options
      .filter(option => !isGenericOption(option))
      .filter((_, index) => !duplicateIndices.includes(index))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(5, maxOptions));
      
    filtered = relaxedFiltered;
    metrics.lowQualityRemoved = 0; // Reset car on a assoupli les critères
  }
  
  // 6. Recalculer les scores pour maintenir une distribution cohérente
  filtered = filtered.map((option, index) => ({
    ...option,
    score: Math.max(95 - (index * 8), 50) // Distribution de 95 à 50 par pas de 8
  }));
  
  metrics.filteredOptions = filtered.length;
  
  console.log(`✅ Quality filtering complete:`, {
    original: metrics.totalOptions,
    final: metrics.filteredOptions,
    duplicatesRemoved: metrics.duplicatesRemoved,
    genericRemoved: metrics.genericOptionsRemoved,
    lowQualityRemoved: metrics.lowQualityRemoved
  });
  
  return { filteredOptions: filtered, metrics };
};

/**
 * Valide qu'une liste d'options a suffisamment de diversité
 */
export const validateOptionsDiversity = (options: IBreakdownItem[]): boolean => {
  if (options.length < 3) return false;
  
  // Vérifier la diversité des scores
  const scores = options.map(o => o.score);
  const scoreRange = Math.max(...scores) - Math.min(...scores);
  
  // Vérifier la diversité des noms
  const uniqueFirstWords = new Set(
    options.map(o => o.option.split(' ')[0].toLowerCase())
  );
  
  return scoreRange >= 15 && uniqueFirstWords.size >= Math.min(3, options.length);
};