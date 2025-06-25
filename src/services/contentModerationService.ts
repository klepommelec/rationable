
// Service de modération ultra-strict pour tous les contenus - Phase 2: Validation stricte des liens
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

  // PHASE 2: Liste blanche ultra-stricte avec vérification par catégories
  private static readonly TRUSTED_DOMAINS_BY_CATEGORY = {
    // Institutions officielles UNIQUEMENT
    official: [
      'gov.fr', 'gouv.fr', 'service-public.fr', 'legifrance.gouv.fr',
      'europa.eu', 'who.int', 'unesco.org', 'un.org'
    ],
    
    // Encyclopédies et références vérifiées
    reference: [
      'wikipedia.org', 'britannica.com', 'larousse.fr'
    ],
    
    // E-commerce de très grande confiance UNIQUEMENT
    ecommerce: [
      'amazon.fr', 'amazon.com', 'fnac.com', 'darty.com', 'boulanger.com',
      'leclerc.com', 'carrefour.fr', 'cdiscount.com'
    ],
    
    // Restauration et voyage - sites majeurs uniquement
    travel_food: [
      'tripadvisor.fr', 'tripadvisor.com', 'booking.com', 'michelin.com',
      'lafourchette.com', 'opentable.com'
    ],
    
    // Médias de référence uniquement
    media: [
      'lemonde.fr', 'figaro.fr', 'liberation.fr', 'ouest-france.fr',
      'bbc.com', 'reuters.com', 'apnews.com'
    ],
    
    // Grandes marques tech uniquement
    tech: [
      'apple.com', 'microsoft.com', 'google.com', 'adobe.com'
    ],
    
    // Recettes - sites majeurs uniquement
    recipes: [
      'marmiton.org', '750g.com', 'cuisineaz.com'
    ],
    
    // Recherche sécurisée
    search: [
      'google.fr', 'google.com'
    ]
  };

  // Domaines absolument interdits (liste noire)
  private static readonly BLACKLISTED_DOMAINS = [
    // Réseaux sociaux non contrôlés
    'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'tiktok.com',
    'snapchat.com', 'reddit.com', 'discord.com', 'telegram.org',
    
    // Sites de contenu généré par utilisateurs
    'medium.com', 'blogger.com', 'wordpress.com', 'tumblr.com',
    
    // Sites de partage de fichiers
    'dropbox.com', 'mediafire.com', 'rapidshare.com',
    
    // Sites de streaming non officiels
    'dailymotion.com', 'vimeo.com',
    
    // Forums et sites communautaires
    '4chan.org', '8chan.org', 'voat.co'
  ];

  // PHASE 2: Validation ultra-stricte avec vérification en temps réel
  static async validateUrlStrict(url: string, context?: string): Promise<{ 
    isValid: boolean; 
    reason?: string; 
    category?: string;
    riskLevel: 'low' | 'medium' | 'high' | 'blocked';
  }> {
    if (!url || typeof url !== 'string') {
      return { isValid: false, reason: 'URL invalide', riskLevel: 'blocked' };
    }

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = urlObj.hostname.toLowerCase().replace(/^www\./, '');
      const fullUrl = urlObj.toString().toLowerCase();
      
      console.log(`🔍 Validation stricte de l'URL: ${domain}`);

      // 1. Vérification liste noire - BLOCAGE IMMÉDIAT
      if (this.BLACKLISTED_DOMAINS.some(blocked => 
        domain === blocked || domain.endsWith(`.${blocked}`)
      )) {
        console.log(`🚫 DOMAINE BLOQUÉ - Liste noire: ${domain}`);
        return { 
          isValid: false, 
          reason: `Domaine interdit: ${domain}`, 
          riskLevel: 'blocked' 
        };
      }

      // 2. Vérification mots interdits dans l'URL complète
      for (const keyword of this.FORBIDDEN_KEYWORDS) {
        if (fullUrl.includes(keyword.toLowerCase())) {
          console.log(`🚫 URL BLOQUÉE - Contenu suspect: ${keyword} dans ${url}`);
          return { 
            isValid: false, 
            reason: `Contenu suspect dans l'URL: ${keyword}`, 
            riskLevel: 'blocked' 
          };
        }
      }

      // 3. Vérification liste blanche par catégorie
      let foundCategory = null;
      let isWhitelisted = false;

      for (const [category, domains] of Object.entries(this.TRUSTED_DOMAINS_BY_CATEGORY)) {
        if (domains.some(trusted => domain === trusted || domain.endsWith(`.${trusted}`))) {
          foundCategory = category;
          isWhitelisted = true;
          break;
        }
      }

      if (!isWhitelisted) {
        console.log(`🚫 DOMAINE NON AUTORISÉ: ${domain} - Pas dans la liste blanche`);
        return { 
          isValid: false, 
          reason: `Domaine non autorisé: ${domain}`, 
          riskLevel: 'blocked' 
        };
      }

      // 4. Vérifications supplémentaires selon le contexte
      if (context && this.isContextMismatch(domain, context, foundCategory!)) {
        console.log(`⚠️ CONTEXTE INADÉQUAT: ${domain} pour ${context}`);
        return { 
          isValid: false, 
          reason: `Domaine inadéquat pour le contexte: ${context}`, 
          riskLevel: 'high' 
        };
      }

      // 5. Vérification de la structure de l'URL
      if (this.hasSuspiciousUrlStructure(urlObj)) {
        console.log(`⚠️ STRUCTURE SUSPECTE: ${url}`);
        return { 
          isValid: false, 
          reason: 'Structure URL suspecte', 
          riskLevel: 'high' 
        };
      }

      console.log(`✅ URL VALIDÉE: ${domain} (catégorie: ${foundCategory})`);
      return { 
        isValid: true, 
        category: foundCategory!, 
        riskLevel: 'low' 
      };

    } catch (error) {
      console.error(`❌ Erreur validation URL: ${url}`, error);
      return { 
        isValid: false, 
        reason: 'Format URL invalide', 
        riskLevel: 'blocked' 
      };
    }
  }

  // Vérification de correspondance contexte/domaine
  private static isContextMismatch(domain: string, context: string, category: string): boolean {
    const contextLower = context.toLowerCase();
    
    // Correspondances strictes contexte/catégorie
    const contextMappings = {
      'restaurant': ['travel_food', 'recipes', 'reference'],
      'voyage': ['travel_food', 'reference'],
      'achat': ['ecommerce', 'reference'],
      'technologie': ['tech', 'ecommerce', 'reference'],
      'cuisine': ['recipes', 'reference'],
      'santé': ['official', 'reference', 'media']
    };

    for (const [ctx, allowedCategories] of Object.entries(contextMappings)) {
      if (contextLower.includes(ctx)) {
        return !allowedCategories.includes(category);
      }
    }

    return false;
  }

  // Détection de structures URL suspectes
  private static hasSuspiciousUrlStructure(urlObj: URL): boolean {
    const suspiciousPatterns = [
      // URLs avec beaucoup de paramètres suspects
      /[&?](redirect|goto|url|link|href)=/i,
      // Sous-domaines suspects
      /^(ad|ads|affiliate|promo|deal|click|track)/i,
      // Chemins suspects
      /\/(ad|ads|affiliate|promo|deal|click|track|redirect)/i,
      // Trop de sous-domaines
      /^[^.]+\.[^.]+\.[^.]+\.[^.]+\./
    ];

    const fullUrl = urlObj.toString();
    const hostname = urlObj.hostname;
    
    return suspiciousPatterns.some(pattern => 
      pattern.test(fullUrl) || pattern.test(hostname)
    );
  }

  // Mise à jour de la méthode de validation classique pour utiliser la nouvelle validation
  static validateUrl(url: string): { isValid: boolean; reason?: string } {
    // Utiliser la validation synchrone basique pour la compatibilité
    if (!url || typeof url !== 'string') {
      return { isValid: false, reason: 'URL invalide' };
    }

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = urlObj.hostname.toLowerCase().replace(/^www\./, '');
      
      // Vérification liste noire
      if (this.BLACKLISTED_DOMAINS.some(blocked => 
        domain === blocked || domain.endsWith(`.${blocked}`)
      )) {
        return { isValid: false, reason: `Domaine interdit: ${domain}` };
      }

      // Vérification liste blanche
      const allTrustedDomains = Object.values(this.TRUSTED_DOMAINS_BY_CATEGORY).flat();
      const isTrusted = allTrustedDomains.some(trusted => 
        domain === trusted || domain.endsWith(`.${trusted}`)
      );
      
      if (!isTrusted) {
        return { isValid: false, reason: `Domaine non autorisé: ${domain}` };
      }

      // Vérification contenu URL
      const fullUrl = urlObj.toString().toLowerCase();
      for (const keyword of this.FORBIDDEN_KEYWORDS) {
        if (fullUrl.includes(keyword)) {
          return { isValid: false, reason: `Contenu suspect dans l'URL: ${keyword}` };
        }
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, reason: 'Format d\'URL invalide' };
    }
  }

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

  // Génération d'URL de recherche sécurisée avec filtrage renforcé
  static generateSafeSearchUrl(query: string, isShoppingSearch: boolean = false): string {
    const sanitizedQuery = this.sanitizeSearchQuery(query);
    const encodedQuery = encodeURIComponent(sanitizedQuery);
    
    // Ajout de filtres de sécurité supplémentaires
    const safetyParams = '&safe=strict&filter=1&family=on';
    
    if (isShoppingSearch) {
      return `https://www.google.fr/search?q=${encodedQuery}&tbm=shop${safetyParams}`;
    }
    
    return `https://www.google.fr/search?q=${encodedQuery}${safetyParams}`;
  }

  // Nettoyage renforcé des requêtes de recherche
  private static sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      return 'recherche sécurisée';
    }

    let sanitized = query.toLowerCase();
    
    // Supprimer les mots interdits
    for (const keyword of this.FORBIDDEN_KEYWORDS) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '');
    }
    
    // Nettoyer et normaliser
    sanitized = sanitized
      .replace(/[^\w\s\-àâäçéèêëïîôöùûüÿ]/g, ' ') // Garder les accents français
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
    
    // Si la requête est vide après nettoyage, utiliser un terme générique
    if (!sanitized) {
      return 'recherche sécurisée';
    }
    
    return sanitized;
  }

  // NOUVELLE MÉTHODE: Validation en lot des liens avec rapport détaillé
  static validateLinksStrict(links: Array<{title: string, url: string}>, context?: string): {
    validLinks: Array<{title: string, url: string, category?: string}>;
    blockedLinks: Array<{title: string, url: string, reason: string}>;
    totalBlocked: number;
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const validLinks: Array<{title: string, url: string, category?: string}> = [];
    const blockedLinks: Array<{title: string, url: string, reason: string}> = [];
    let highRiskCount = 0;

    for (const link of links) {
      // Vérifier d'abord le titre
      const titleModeration = this.moderateText(link.title);
      if (!titleModeration.isAppropriate) {
        blockedLinks.push({
          title: link.title,
          url: link.url,
          reason: `Titre inapproprié: ${titleModeration.reason}`
        });
        continue;
      }

      // Vérifier l'URL
      const urlValidation = this.validateUrl(link.url);
      if (!urlValidation.isValid) {
        blockedLinks.push({
          title: link.title,
          url: link.url,
          reason: urlValidation.reason || 'URL invalide'
        });
        highRiskCount++;
        continue;
      }

      validLinks.push({
        title: link.title,
        url: link.url
      });
    }

    const totalBlocked = blockedLinks.length;
    const blockingRate = totalBlocked / links.length;
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (blockingRate > 0.5 || highRiskCount > 2) {
      riskLevel = 'high';
    } else if (blockingRate > 0.3 || highRiskCount > 0) {
      riskLevel = 'medium';
    }

    console.log(`📊 Validation des liens - Validés: ${validLinks.length}, Bloqués: ${totalBlocked}, Niveau de risque: ${riskLevel}`);

    return {
      validLinks,
      blockedLinks,
      totalBlocked,
      riskLevel
    };
  }
}
