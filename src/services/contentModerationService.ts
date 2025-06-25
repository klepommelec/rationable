
// Service de modération ultra-strict pour tous les contenus
export class ContentModerationService {
  private static readonly FORBIDDEN_KEYWORDS = [
    // Politique et controverses
    'politique', 'élection', 'gouvernement', 'ministre', 'président', 'député',
    'scandale', 'polémique', 'controverse', 'manifestation', 'grève', 'syndicat',
    'corruption', 'affaire', 'procès', 'tribunal', 'justice', 'condamnation',
    
    // Violence et contenu inapproprié
    'guerre', 'conflit', 'terrorisme', 'violence', 'mort', 'tué', 'meurtre',
    'accident', 'drame', 'tragédie', 'crime', 'criminel', 'agression',
    'attentat', 'explosion', 'blessé', 'victime', 'danger', 'risque',
    
    // Contenu sensible
    'sexe', 'sexy', 'nu', 'nudité', 'érotique', 'pornographie', 'adulte',
    'drogue', 'alcool', 'cigarette', 'cannabis', 'stupéfiant',
    
    // Contenu négatif
    'arnaque', 'escroquerie', 'fake', 'mensonge', 'trompeur', 'faux',
    'boycott', 'interdiction', 'censure', 'problème', 'danger',
    
    // Contenu discriminatoire
    'racisme', 'discrimination', 'homophobie', 'xénophobie', 'haine',
    
    // Mots anglais équivalents
    'politics', 'scandal', 'controversy', 'war', 'violence', 'death', 'murder',
    'crime', 'terrorist', 'drug', 'fake', 'scam', 'hate', 'discrimination'
  ];

  private static readonly TRUSTED_DOMAINS = [
    // Sites officiels et institutions
    'wikipedia.org', 'gouv.fr', 'europa.eu', 'who.int', 'unesco.org',
    
    // E-commerce de confiance
    'amazon.fr', 'amazon.com', 'fnac.com', 'darty.com', 'boulanger.com',
    'cdiscount.com', 'leclerc.com', 'carrefour.fr', 'auchan.fr',
    
    // Restauration et voyage
    'tripadvisor.fr', 'tripadvisor.com', 'booking.com', 'expedia.fr',
    'lafourchette.com', 'opentable.com', 'michelin.com', 'zagat.com',
    'yelp.com', 'zomato.com', 'timeout.com',
    
    // Médias de confiance
    'lemonde.fr', 'figaro.fr', 'liberation.fr', 'ouest-france.fr',
    'bbc.com', 'cnn.com', 'reuters.com', 'apnews.com',
    
    // Tech et guides
    'apple.com', 'microsoft.com', 'google.com', 'adobe.com',
    'allrecipes.com', 'marmiton.org', '750g.com',
    
    // Recherche Google (fallback sécurisé)
    'google.fr', 'google.com'
  ];

  // Modération du texte généré par l'IA
  static moderateText(text: string): { isAppropriate: boolean; reason?: string } {
    if (!text || typeof text !== 'string') {
      return { isAppropriate: false, reason: 'Texte invalide' };
    }

    const lowerText = text.toLowerCase();
    
    // Vérifier les mots interdits
    for (const keyword of this.FORBIDDEN_KEYWORDS) {
      if (lowerText.includes(keyword.toLowerCase())) {
        console.log(`🚫 Contenu bloqué - Mot interdit détecté: "${keyword}" dans: "${text.substring(0, 100)}..."`);
        return { 
          isAppropriate: false, 
          reason: `Contenu inapproprié détecté: ${keyword}` 
        };
      }
    }

    return { isAppropriate: true };
  }

  // Validation stricte des URLs
  static validateUrl(url: string): { isValid: boolean; reason?: string } {
    if (!url || typeof url !== 'string') {
      return { isValid: false, reason: 'URL invalide' };
    }

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = urlObj.hostname.toLowerCase();
      
      // Vérifier si c'est un domaine de confiance
      const isTrustedDomain = this.TRUSTED_DOMAINS.some(trustedDomain => 
        domain === trustedDomain || domain.endsWith(`.${trustedDomain}`)
      );
      
      if (!isTrustedDomain) {
        console.log(`🚫 URL bloquée - Domaine non autorisé: ${domain}`);
        return { 
          isValid: false, 
          reason: `Domaine non autorisé: ${domain}` 
        };
      }

      // Vérifications supplémentaires de l'URL
      const fullUrl = urlObj.toString().toLowerCase();
      for (const keyword of this.FORBIDDEN_KEYWORDS) {
        if (fullUrl.includes(keyword)) {
          console.log(`🚫 URL bloquée - Contenu suspect dans l'URL: ${keyword}`);
          return { 
            isValid: false, 
            reason: `Contenu suspect dans l'URL: ${keyword}` 
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, reason: 'Format d\'URL invalide' };
    }
  }

  // Génération d'URL de recherche sécurisée
  static generateSafeSearchUrl(query: string, isShoppingSearch: boolean = false): string {
    const sanitizedQuery = this.sanitizeSearchQuery(query);
    const encodedQuery = encodeURIComponent(sanitizedQuery);
    
    if (isShoppingSearch) {
      return `https://www.google.fr/search?q=${encodedQuery}&tbm=shop&safe=strict`;
    }
    
    return `https://www.google.fr/search?q=${encodedQuery}&safe=strict`;
  }

  // Nettoyage des requêtes de recherche
  private static sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      return '';
    }

    let sanitized = query.toLowerCase();
    
    // Supprimer les mots interdits
    for (const keyword of this.FORBIDDEN_KEYWORDS) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '');
    }
    
    // Nettoyer et normaliser
    sanitized = sanitized
      .replace(/[^\w\s-]/g, ' ') // Supprimer les caractères spéciaux
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
    
    return sanitized || 'recherche sécurisée';
  }
}
