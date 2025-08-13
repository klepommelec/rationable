
export interface EmojiCategory {
  keywords: string[];
  emojis: string[];
  priority?: number; // Pour la priorité de matching
}

// Fonction pour extraire les mots-clés les plus importants d'une question
const extractKeywords = (text: string): string[] => {
  const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'mais', 'pour', 'avec', 'dans', 'sur', 'que', 'qui', 'quoi', 'comment', 'pourquoi', 'où', 'quand', 'combien', 'quel', 'quelle', 'est', 'être', 'avoir', 'faire', 'aller', 'the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'in', 'on', 'at', 'to', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .sort((a, b) => b.length - a.length); // Privilégier les mots plus longs
};

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    keywords: ['laptop', 'ordinateur', 'computer', 'pc', 'macbook', 'tech', 'informatique', 'software', 'app', 'site', 'application', 'développement', 'code', 'programming', 'web', 'digital', 'numérique'],
    emojis: ['💻', '🖥️', '⌨️', '🖱️', '💾', '🔌', '📱', '⚡'],
    priority: 1
  },
  {
    keywords: ['voyage', 'travel', 'vacation', 'hotel', 'avion', 'plane', 'destination', 'trip', 'partir', 'vacances', 'tourisme', 'étranger', 'pays', 'vol', 'aéroport'],
    emojis: ['✈️', '🗺️', '🧳', '🌍', '🚢', '🗼', '🏛️', '🎒'],
    priority: 1
  },
  {
    keywords: ['hiver', 'winter', 'ski', 'neige', 'snow', 'montagne', 'alpes', 'station', 'froid', 'décembre', 'janvier', 'février'],
    emojis: ['❄️', '🎿', '🏔️', '⛷️', '🏂', '🧣', '🧤', '🔥'],
    priority: 2
  },
  {
    keywords: ['été', 'summer', 'plage', 'beach', 'mer', 'ocean', 'soleil', 'juin', 'juillet', 'août', 'bronzer', 'baignade'],
    emojis: ['🏖️', '🌊', '☀️', '🏝️', '🩱', '🕶️', '🏄‍♂️', '🌺'],
    priority: 2
  },
  {
    keywords: ['maison', 'house', 'appartement', 'apartment', 'immobilier', 'real estate', 'logement', 'home', 'déménagement', 'loyer', 'achat', 'vente'],
    emojis: ['🏠', '🏡', '🏢', '🔑', '🏗️', '🏘️', '🏬', '🏭'],
    priority: 1
  },
  {
    keywords: ['restaurant', 'food', 'nourriture', 'manger', 'cuisine', 'repas', 'plat', 'eat', 'dîner', 'déjeuner', 'petit-déjeuner', 'cuisinier', 'chef'],
    emojis: ['🍔', '🍕', '🍝', '🍜', '🥘', '🍳', '🥗', '🍲', '🍱', '🥪'],
    priority: 1
  },
  {
    keywords: ['argent', 'money', 'finance', 'budget', 'prix', 'cost', 'économie', 'investment', 'banque', 'crédit', 'prêt', 'épargne', 'salaire'],
    emojis: ['💸', '💰', '💳', '📈', '💲', '🏦', '💎', '🪙', '📊'],
    priority: 1
  },
  {
    keywords: ['santé', 'health', 'médecin', 'doctor', 'hospital', 'medical', 'sport', 'fitness', 'maladie', 'traitement', 'médicament'],
    emojis: ['⚕️', '🏥', '💊', '🏃', '🩺', '💉', '🧬', '🔬', '🏋️‍♂️'],
    priority: 1
  },
  {
    keywords: ['education', 'école', 'school', 'university', 'cours', 'formation', 'learning', 'study', 'université', 'étudiant', 'professeur', 'diplôme'],
    emojis: ['📚', '🎓', '✏️', '📝', '🏫', '👨‍🎓', '👩‍🏫', '📖', '🔍'],
    priority: 1
  },
  {
    keywords: ['voiture', 'car', 'auto', 'transport', 'véhicule', 'driving', 'moto', 'bike', 'permis', 'conduire', 'automobile'],
    emojis: ['🚗', '🚙', '🏍️', '🚲', '🚕', '🚌', '🚊', '⛽', '🛣️'],
    priority: 1
  },
  {
    keywords: ['entertainment', 'movie', 'film', 'game', 'jeu', 'music', 'musique', 'tv', 'cinéma', 'concert', 'spectacle'],
    emojis: ['🎬', '🎮', '🎵', '📺', '🎪', '🎭', '🎤', '🎸', '🎲'],
    priority: 1
  },
  {
    keywords: ['shopping', 'achat', 'buy', 'acheter', 'magasin', 'store', 'boutique', 'commerce', 'vente', 'client'],
    emojis: ['🛍️', '🛒', '🏪', '💳', '🏬', '🛍️', '💰', '🎁'],
    priority: 1
  },
  {
    keywords: ['job', 'travail', 'work', 'career', 'carrière', 'emploi', 'business', 'entreprise', 'bureau', 'collègue', 'patron'],
    emojis: ['💼', '👔', '🏢', '📊', '👨‍💼', '👩‍💼', '📈', '💻', '📋'],
    priority: 1
  },
  {
    keywords: ['sport', 'basketball', 'football', 'tennis', 'natation', 'course', 'fitness', 'gym', 'équipe', 'match', 'compétition'],
    emojis: ['🏀', '⚽', '🎾', '🏊', '🏃', '🏋️', '🥇', '🏆', '🎯'],
    priority: 1
  },
  // Nouvelles catégories pour une meilleure couverture
  {
    keywords: ['amour', 'love', 'relationship', 'couple', 'mariage', 'wedding', 'relation', 'petit ami', 'petite amie', 'fiancé'],
    emojis: ['❤️', '💕', '💖', '💑', '👫', '💒', '💍', '💏', '🌹'],
    priority: 1
  },
  {
    keywords: ['temps', 'weather', 'météo', 'pluie', 'soleil', 'neige', 'orage', 'climat'],
    emojis: ['☀️', '🌧️', '❄️', '⛈️', '🌈', '⛅', '🌪️', '🌡️'],
    priority: 1
  },
  {
    keywords: ['animal', 'animaux', 'pet', 'chien', 'chat', 'dog', 'cat', 'oiseau', 'poisson'],
    emojis: ['🐕', '🐱', '🐦', '🐟', '🐰', '🐷', '🐸', '🦎', '🐞'],
    priority: 1
  },
  {
    keywords: ['famille', 'family', 'parent', 'enfant', 'bébé', 'maman', 'papa', 'frère', 'sœur'],
    emojis: ['👨‍👩‍👧‍👦', '👶', '👨‍👧', '👩‍👦', '👵', '👴', '👪', '🤱'],
    priority: 1
  },
  {
    keywords: ['nature', 'plante', 'jardin', 'fleur', 'arbre', 'forêt', 'montagne', 'mer', 'océan'],
    emojis: ['🌱', '🌸', '🌳', '🌲', '🏔️', '🌊', '🌺', '🍃', '🌿'],
    priority: 1
  },
  {
    keywords: ['art', 'peinture', 'dessin', 'créatif', 'artistique', 'culture', 'musée', 'exposition'],
    emojis: ['🎨', '🖼️', '🖌️', '✏️', '🏛️', '🎭', '📸', '🎪'],
    priority: 1
  },
  {
    keywords: ['science', 'recherche', 'laboratoire', 'expérience', 'chimie', 'physique', 'biologie'],
    emojis: ['🔬', '⚗️', '🧪', '🔭', '🧬', '⚛️', '🌡️', '📡'],
    priority: 1
  }
];

// Fonction améliorée pour analyser le contexte et choisir l'emoji le plus pertinent
export const generateContextualEmoji = (dilemma: string): string => {
  const lowerDilemma = dilemma.toLowerCase();
  const keywords = extractKeywords(dilemma);
  
  console.log(`🎭 Analyzing: "${dilemma}"`);
  console.log(`🔍 Keywords found: ${keywords.join(', ')}`);
  
  // Scoring system pour trouver la meilleure correspondance avec priorisation saisonnière
  let bestMatch = { category: null as EmojiCategory | null, score: 0, matchedKeyword: '' };
  
  for (const category of EMOJI_CATEGORIES) {
    let categoryScore = 0;
    let matchedKeyword = '';
    
    // Vérifier chaque mot-clé extrait contre les catégories
    for (const extractedKeyword of keywords) {
      for (const categoryKeyword of category.keywords) {
        if (extractedKeyword.includes(categoryKeyword) || categoryKeyword.includes(extractedKeyword)) {
          // Score basé sur la longueur du mot et la priorité de la catégorie
          let score = Math.min(extractedKeyword.length, categoryKeyword.length) * (category.priority || 1);
          
          // Bonus pour les correspondances exactes
          if (extractedKeyword === categoryKeyword) {
            score *= 1.5;
          }
          
          if (score > categoryScore) {
            categoryScore = score;
            matchedKeyword = extractedKeyword;
          }
        }
      }
    }
    
    if (categoryScore > bestMatch.score) {
      bestMatch = { category, score: categoryScore, matchedKeyword };
    }
  }
  
  if (bestMatch.category) {
    // Choisir un emoji aléatoire de la meilleure catégorie
    const randomEmoji = bestMatch.category.emojis[Math.floor(Math.random() * bestMatch.category.emojis.length)];
    console.log(`✅ Best match: "${bestMatch.matchedKeyword}" (score: ${bestMatch.score}) -> ${randomEmoji}`);
    return randomEmoji;
  }
  
  // Fallback intelligent selon le type de question
  const questionTypes = [
    { patterns: ['meilleur', 'mieux', 'optimal', 'recommandation', 'conseiller'], emoji: '🎯' },
    { patterns: ['qui', 'what', 'when', 'where', 'how much', 'combien', 'quel'], emoji: '💡' },
    { patterns: ['choisir', 'choice', 'decide', 'décider', 'option'], emoji: '🤔' },
    { patterns: ['problème', 'problem', 'difficulté', 'help', 'aide'], emoji: '🆘' },
    { patterns: ['futur', 'future', 'avenir', 'prédiction'], emoji: '🔮' }
  ];
  
  for (const type of questionTypes) {
    if (type.patterns.some(pattern => lowerDilemma.includes(pattern))) {
      console.log(`🎯 Question type detected -> ${type.emoji}`);
      return type.emoji;
    }
  }
  
  console.log(`🤔 No specific match found -> default emoji`);
  return '🤔';
};
