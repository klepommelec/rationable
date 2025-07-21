
export interface EmojiCategory {
  keywords: string[];
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    keywords: ['laptop', 'ordinateur', 'computer', 'pc', 'macbook', 'tech', 'informatique', 'software', 'app', 'site'],
    emojis: ['💻', '🖥️', '⌨️', '🖱️']
  },
  {
    keywords: ['voyage', 'travel', 'vacation', 'hotel', 'avion', 'plane', 'destination', 'trip', 'partir'],
    emojis: ['✈️', '🏖️', '🗺️', '🧳']
  },
  {
    keywords: ['maison', 'house', 'appartement', 'apartment', 'immobilier', 'real estate', 'logement', 'home'],
    emojis: ['🏠', '🏡', '🏢', '🔑']
  },
  {
    keywords: ['restaurant', 'food', 'nourriture', 'manger', 'cuisine', 'repas', 'plat', 'eat'],
    emojis: ['🍔', '🍕', '🍝', '🍜']
  },
  {
    keywords: ['argent', 'money', 'finance', 'budget', 'prix', 'cost', 'économie', 'investment'],
    emojis: ['💸', '💰', '💳', '📈']
  },
  {
    keywords: ['santé', 'health', 'médecin', 'doctor', 'hospital', 'medical', 'sport', 'fitness'],
    emojis: ['⚕️', '🏥', '💊', '🏃']
  },
  {
    keywords: ['education', 'école', 'school', 'university', 'cours', 'formation', 'learning', 'study'],
    emojis: ['📚', '🎓', '✏️', '📝']
  },
  {
    keywords: ['voiture', 'car', 'auto', 'transport', 'véhicule', 'driving', 'moto', 'bike'],
    emojis: ['🚗', '🚙', '🏍️', '🚲']
  },
  {
    keywords: ['entertainment', 'movie', 'film', 'game', 'jeu', 'music', 'musique', 'tv'],
    emojis: ['🎬', '🎮', '🎵', '📺']
  },
  {
    keywords: ['shopping', 'achat', 'buy', 'acheter', 'magasin', 'store', 'boutique'],
    emojis: ['🛍️', '🛒', '🏪', '💳']
  },
  {
    keywords: ['job', 'travail', 'work', 'career', 'carrière', 'emploi', 'business'],
    emojis: ['💼', '👔', '🏢', '📊']
  },
  {
    keywords: ['nba', 'basketball', 'sport', 'draft', 'team', 'équipe', 'match'],
    emojis: ['🏀', '🏆', '⚽', '🎯']
  }
];

export const generateContextualEmoji = (dilemma: string): string => {
  const lowerDilemma = dilemma.toLowerCase();
  
  console.log(`🎭 Generating contextual emoji for: "${dilemma}"`);
  
  // Chercher la catégorie qui correspond le mieux
  for (const category of EMOJI_CATEGORIES) {
    const matchedKeyword = category.keywords.find(keyword => 
      lowerDilemma.includes(keyword.toLowerCase())
    );
    
    if (matchedKeyword) {
      // Choisir un emoji aléatoire de la catégorie
      const randomEmoji = category.emojis[Math.floor(Math.random() * category.emojis.length)];
      console.log(`✅ Found match for "${matchedKeyword}" -> ${randomEmoji}`);
      return randomEmoji;
    }
  }
  
  // Emoji par défaut selon le type de question
  const factualKeywords = ['qui', 'what', 'when', 'where', 'how much', 'combien'];
  const isFactualLike = factualKeywords.some(keyword => lowerDilemma.includes(keyword));
  
  if (isFactualLike) {
    console.log(`🎯 Factual question detected -> 💡`);
    return '💡';
  }
  
  console.log(`🤔 No specific match found -> default emoji`);
  return '🤔';
};
