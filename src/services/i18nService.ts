export type SupportedLanguage = 'fr' | 'en' | 'es' | 'it' | 'de';

export interface LocaleConfig {
  code: SupportedLanguage;
  name: string;
  dateFormat: Intl.DateTimeFormatOptions;
  temporalKeywords: TemporalKeywords;
  systemPrompts: SystemPrompts;
  fallbackMessages: FallbackMessages;
  shopping: ShoppingConfig;
}

export interface TemporalKeywords {
  current: string[];
  recentPast: string[];
  historical: string[];
  future: string[];
  realTime: string[];
}

export interface SystemPrompts {
  future: string;
  current: string;
  recentPast: string;
  historical: string;
  default: string;
  responseRules: string;
}

export interface FallbackMessages {
  noAnswerGenerated: string;
  quickAnswerError: string;
  perplexityError: string;
  claudeError: string;
}

export interface ShoppingConfig {
  buyVerb: string;
  googleTLD: string;
  uiLanguage: string;
  countryCode: string;
  synonyms: string[];
}

const LOCALE_CONFIGS: Record<SupportedLanguage, LocaleConfig> = {
  fr: {
    code: 'fr',
    name: 'Français',
    dateFormat: { month: 'long', year: 'numeric' },
    temporalKeywords: {
      current: [
        'du moment', 'actuellement', 'en cours', 'maintenant', 'aujourd\'hui',
        'cette semaine', 'ce mois', 'disponible', 'ouvert', 'accessible'
      ],
      recentPast: [
        'dernières', 'récentes', 'terminées', 'passées', 'précédentes',
        'qui viennent de', 'il y a peu', 'récemment fermé'
      ],
      historical: [
        'histoire de', 'ancien', 'ancienne', 'avant', 'historique', 'passé', 'auparavant'
      ],
      future: [
        'à venir', 'prochaine', 'prochain', 'futur', 'bientôt', 'prévu', 'programmé'
      ],
      realTime: [
        'draft', 'élection', 'prochain', 'futur', 'prochaine',
        'récent', 'dernière', 'nouveau', 'nouvelle', 'tendance', 'actualité',
        'maintenant', 'aujourd\'hui', 'cette année', 'ce mois', 'cette semaine',
        'qui a été', 'qui est', 'résultats', 'gagnant', 'vainqueur'
      ]
    },
    systemPrompts: {
      future: 'Recherchez des événements futurs, annonces officielles, calendriers prévus et informations à venir. Cherchez les dernières prévisions disponibles, qualifications et calendriers officiels.',
      current: 'Recherchez UNIQUEMENT les événements en cours actuellement, expositions ouvertes actuellement et informations disponibles maintenant.',
      recentPast: 'Recherchez des événements récemment terminés, derniers résultats et informations des derniers mois.',
      historical: 'Recherchez dans les archives historiques et informations passées selon la période mentionnée.',
      default: 'Recherchez sur les sites officiels, actualités récentes et sources fiables pour trouver des informations actuelles.',
      responseRules: 'RÈGLES DE RÉPONSE : 1) Pour les listes, fournissez TOUS les éléments disponibles avec détails complets. 2) Pour les questions simples, soyez concis mais précis. 3) Utilisez des noms réels et spécifiques - jamais de termes génériques. 4) Supprimez les numéros de citation. 5) Répondez dans la même langue que la question.'
    },
    fallbackMessages: {
      noAnswerGenerated: "Désolé, je n'ai pas pu générer une réponse pour cette question.",
      quickAnswerError: "Impossible de générer une réponse rapide",
      perplexityError: "Erreur de recherche Perplexity",
      claudeError: "Erreur Claude"
    },
    shopping: {
      buyVerb: 'acheter',
      googleTLD: 'fr',
      uiLanguage: 'fr',
      countryCode: 'FR',
      synonyms: ['achat', 'acheter', 'prix', 'comparer', 'magasin', 'boutique']
    }
  },
  en: {
    code: 'en',
    name: 'English',
    dateFormat: { month: 'long', year: 'numeric' },
    temporalKeywords: {
      current: [
        'currently', 'right now', 'at the moment', 'today', 'this week', 
        'this month', 'available', 'open', 'accessible', 'happening now'
      ],
      recentPast: [
        'recent', 'latest', 'finished', 'past', 'previous', 'just ended',
        'recently closed', 'last', 'concluded'
      ],
      historical: [
        'history of', 'ancient', 'old', 'before', 'historical', 'past', 'previously',
        'formerly', 'in the past'
      ],
      future: [
        'upcoming', 'next', 'future', 'soon', 'scheduled', 'planned', 'coming',
        'will be', 'going to'
      ],
      realTime: [
        'draft', 'election', 'next', 'future', 'upcoming', 'recent', 'latest',
        'new', 'trend', 'news', 'now', 'today', 'this year', 'this month',
        'this week', 'who won', 'who is', 'results', 'winner', 'champion'
      ]
    },
    systemPrompts: {
      future: 'Search for future events, official announcements, planned schedules, and upcoming information. Look for the latest available forecasts, qualifications, and official calendars.',
      current: 'Search ONLY for events currently happening, exhibitions currently open, and information available right now.',
      recentPast: 'Search for recently concluded events, latest results, and information from recent months.',
      historical: 'Search historical archives and past information according to the mentioned timeframe.',
      default: 'Search official websites, recent news, and reliable sources to find current information.',
      responseRules: 'RESPONSE RULES: 1) For lists, provide ALL available items with complete details. 2) For single questions, be concise but precise. 3) Use real, specific names - never generic terms. 4) Remove citation numbers. 5) Answer in the same language as the question.'
    },
    fallbackMessages: {
      noAnswerGenerated: "Sorry, I couldn't generate an answer for this question.",
      quickAnswerError: "Unable to generate a quick response",
      perplexityError: "Perplexity search error",
      claudeError: "Claude error"
    },
    shopping: {
      buyVerb: 'buy',
      googleTLD: 'com',
      uiLanguage: 'en',
      countryCode: 'US',
      synonyms: ['buy', 'purchase', 'price', 'compare', 'store', 'shop']
    }
  },
  es: {
    code: 'es',
    name: 'Español',
    dateFormat: { month: 'long', year: 'numeric' },
    temporalKeywords: {
      current: [
        'actualmente', 'ahora mismo', 'en este momento', 'hoy', 'esta semana',
        'este mes', 'disponible', 'abierto', 'accesible', 'sucediendo ahora'
      ],
      recentPast: [
        'recientes', 'últimas', 'terminadas', 'pasadas', 'anteriores',
        'que acaban de', 'recientemente cerrado', 'último', 'concluidas'
      ],
      historical: [
        'historia de', 'antiguo', 'antigua', 'antes', 'histórico', 'pasado',
        'anteriormente', 'en el pasado'
      ],
      future: [
        'próximos', 'siguiente', 'futuro', 'pronto', 'programado', 'planeado',
        'venidero', 'será', 'va a'
      ],
      realTime: [
        'draft', 'elección', 'próximo', 'futuro', 'próximos', 'reciente',
        'último', 'nuevo', 'tendencia', 'noticias', 'ahora', 'hoy', 'este año',
        'este mes', 'esta semana', 'quién ganó', 'quién es', 'resultados',
        'ganador', 'campeón'
      ]
    },
    systemPrompts: {
      future: 'Busca eventos futuros, anuncios oficiales, calendarios planificados e información próxima. Busca las últimas previsiones disponibles, clasificaciones y calendarios oficiales.',
      current: 'Busca SOLO eventos que estén sucediendo actualmente, exposiciones abiertas actualmente e información disponible ahora mismo.',
      recentPast: 'Busca eventos recientemente concluidos, últimos resultados e información de los últimos meses.',
      historical: 'Busca archivos históricos e información pasada según el marco temporal mencionado.',
      default: 'Busca sitios web oficiales, noticias recientes y fuentes confiables para encontrar información actual.',
      responseRules: 'REGLAS DE RESPUESTA: 1) Para listas, proporciona TODOS los elementos disponibles con detalles completos. 2) Para preguntas simples, sé conciso pero preciso. 3) Usa nombres reales y específicos - nunca términos genéricos. 4) Elimina números de cita. 5) Responde en el mismo idioma que la pregunta.'
    },
    fallbackMessages: {
      noAnswerGenerated: "Lo siento, no pude generar una respuesta para esta pregunta.",
      quickAnswerError: "No se pudo generar una respuesta rápida",
      perplexityError: "Error de búsqueda Perplexity",
      claudeError: "Error Claude"
    },
    shopping: {
      buyVerb: 'comprar',
      googleTLD: 'es',
      uiLanguage: 'es',
      countryCode: 'ES',
      synonyms: ['comprar', 'compra', 'precio', 'comparar', 'tienda', 'comercio']
    }
  },
  it: {
    code: 'it',
    name: 'Italiano',
    dateFormat: { month: 'long', year: 'numeric' },
    temporalKeywords: {
      current: [
        'attualmente', 'proprio ora', 'in questo momento', 'oggi', 'questa settimana',
        'questo mese', 'disponibile', 'aperto', 'accessibile', 'succedendo ora'
      ],
      recentPast: [
        'recenti', 'ultime', 'terminate', 'passate', 'precedenti',
        'appena finite', 'recentemente chiuso', 'ultimo', 'concluse'
      ],
      historical: [
        'storia di', 'antico', 'antica', 'prima', 'storico', 'passato',
        'precedentemente', 'nel passato'
      ],
      future: [
        'prossimi', 'successivo', 'futuro', 'presto', 'programmato', 'pianificato',
        'in arrivo', 'sarà', 'andrà'
      ],
      realTime: [
        'draft', 'elezione', 'prossimo', 'futuro', 'prossimi', 'recente',
        'ultimo', 'nuovo', 'tendenza', 'notizie', 'ora', 'oggi', 'quest\'anno',
        'questo mese', 'questa settimana', 'chi ha vinto', 'chi è', 'risultati',
        'vincitore', 'campione'
      ]
    },
    systemPrompts: {
      future: 'Cerca eventi futuri, annunci ufficiali, calendari pianificati e informazioni in arrivo. Cerca le ultime previsioni disponibili, qualificazioni e calendari ufficiali.',
      current: 'Cerca SOLO eventi che stanno succedendo attualmente, mostre attualmente aperte e informazioni disponibili proprio ora.',
      recentPast: 'Cerca eventi recentemente conclusi, ultimi risultati e informazioni degli ultimi mesi.',
      historical: 'Cerca archivi storici e informazioni passate secondo il periodo di tempo menzionato.',
      default: 'Cerca siti web ufficiali, notizie recenti e fonti affidabili per trovare informazioni attuali.',
      responseRules: 'REGOLE DI RISPOSTA: 1) Per le liste, fornisci TUTTI gli elementi disponibili con dettagli completi. 2) Per domande singole, sii conciso ma preciso. 3) Usa nomi reali e specifici - mai termini generici. 4) Rimuovi i numeri di citazione. 5) Rispondi nella stessa lingua della domanda.'
    },
    fallbackMessages: {
      noAnswerGenerated: "Mi dispiace, non sono riuscito a generare una risposta per questa domanda.",
      quickAnswerError: "Impossibile generare una risposta rapida",
      perplexityError: "Errore di ricerca Perplexity",
      claudeError: "Errore Claude"
    },
    shopping: {
      buyVerb: 'comprare',
      googleTLD: 'it',
      uiLanguage: 'it',
      countryCode: 'IT',
      synonyms: ['comprare', 'acquisto', 'prezzo', 'confrontare', 'negozio', 'shop']
    }
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    dateFormat: { month: 'long', year: 'numeric' },
    temporalKeywords: {
      current: [
        'derzeit', 'gerade jetzt', 'im moment', 'heute', 'diese woche',
        'diesen monat', 'verfügbar', 'geöffnet', 'zugänglich', 'passiert jetzt'
      ],
      recentPast: [
        'neueste', 'letzte', 'beendete', 'vergangene', 'vorherige',
        'gerade beendet', 'kürzlich geschlossen', 'letzter', 'abgeschlossene'
      ],
      historical: [
        'geschichte von', 'alt', 'alte', 'vor', 'historisch', 'vergangenheit',
        'früher', 'in der vergangenheit'
      ],
      future: [
        'kommende', 'nächste', 'zukunft', 'bald', 'geplant', 'vorgesehen',
        'bevorstehend', 'wird sein', 'wird'
      ],
      realTime: [
        'draft', 'wahl', 'nächste', 'zukunft', 'kommende', 'neueste',
        'letzte', 'neu', 'trend', 'nachrichten', 'jetzt', 'heute', 'dieses jahr',
        'diesen monat', 'diese woche', 'wer gewonnen', 'wer ist', 'ergebnisse',
        'gewinner', 'champion'
      ]
    },
    systemPrompts: {
      future: 'Suche nach zukünftigen Ereignissen, offiziellen Ankündigungen, geplanten Terminen und bevorstehenden Informationen. Suche nach den neuesten verfügbaren Prognosen, Qualifikationen und offiziellen Kalendern.',
      current: 'Suche NUR nach Ereignissen, die derzeit stattfinden, Ausstellungen, die derzeit geöffnet sind, und Informationen, die gerade jetzt verfügbar sind.',
      recentPast: 'Suche nach kürzlich abgeschlossenen Ereignissen, neuesten Ergebnissen und Informationen aus den letzten Monaten.',
      historical: 'Suche historische Archive und vergangene Informationen entsprechend dem erwähnten Zeitraum.',
      default: 'Suche offizielle Websites, aktuelle Nachrichten und zuverlässige Quellen, um aktuelle Informationen zu finden.',
      responseRules: 'ANTWORTREGELN: 1) Für Listen, gib ALLE verfügbaren Elemente mit vollständigen Details an. 2) Für einzelne Fragen, sei prägnant aber präzise. 3) Verwende echte, spezifische Namen - niemals generische Begriffe. 4) Entferne Zitationsnummern. 5) Antworte in derselben Sprache wie die Frage.'
    },
    fallbackMessages: {
      noAnswerGenerated: "Entschuldigung, ich konnte keine Antwort auf diese Frage generieren.",
      quickAnswerError: "Konnte keine schnelle Antwort generieren",
      perplexityError: "Perplexity-Suchfehler",
      claudeError: "Claude-Fehler"
    },
    shopping: {
      buyVerb: 'kaufen',
      googleTLD: 'de',
      uiLanguage: 'de',
      countryCode: 'DE',
      synonyms: ['kaufen', 'kauf', 'preis', 'vergleichen', 'geschäft', 'shop']
    }
  }
};

export class I18nService {
  private static defaultLanguage: SupportedLanguage = 'en';
  private static currentLanguage: SupportedLanguage = 'en';
  private static readonly STORAGE_KEY = 'rationable_language';

  static detectLanguage(text: string): SupportedLanguage {
    const lowerText = text.toLowerCase();
    
    // Simple language detection based on common words
    const languagePatterns = {
      en: ['the', 'and', 'or', 'is', 'are', 'was', 'were', 'have', 'has', 'will', 'would', 'should', 'could'],
      fr: ['le', 'la', 'les', 'et', 'ou', 'est', 'sont', 'était', 'étaient', 'avoir', 'sera', 'serait', 'devrait', 'pourrait'],
      es: ['el', 'la', 'los', 'las', 'y', 'o', 'es', 'son', 'era', 'eran', 'tener', 'será', 'sería', 'debería', 'podría'],
      it: ['il', 'la', 'gli', 'le', 'e', 'o', 'è', 'sono', 'era', 'erano', 'avere', 'sarà', 'sarebbe', 'dovrebbe', 'potrebbe'],
      de: ['der', 'die', 'das', 'und', 'oder', 'ist', 'sind', 'war', 'waren', 'haben', 'wird', 'würde', 'sollte', 'könnte']
    };

    let maxScore = 0;
    let detectedLang: SupportedLanguage = this.defaultLanguage;

    for (const [lang, patterns] of Object.entries(languagePatterns)) {
      const score = patterns.reduce((acc, pattern) => {
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        const matches = (lowerText.match(regex) || []).length;
        return acc + matches;
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        detectedLang = lang as SupportedLanguage;
      }
    }

    return maxScore > 0 ? detectedLang : this.defaultLanguage;
  }

  static getLocaleConfig(language?: SupportedLanguage): LocaleConfig {
    const lang = language || this.currentLanguage;
    return LOCALE_CONFIGS[lang] || LOCALE_CONFIGS[this.defaultLanguage];
  }

  static setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
    localStorage.setItem(this.STORAGE_KEY, language);
  }

  static getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  static initializeLanguage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored && this.isValidLanguage(stored)) {
      this.currentLanguage = stored as SupportedLanguage;
    }
  }

  /**
   * Initialise la langue : préférence stockée ou anglais par défaut
   */
  static async initializeLanguageWithGeoLocation(): Promise<void> {
    // Vérifier d'abord si l'utilisateur a déjà choisi une langue
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored && this.isValidLanguage(stored)) {
      this.currentLanguage = stored as SupportedLanguage;
      console.log('🌐 Using stored language preference:', this.currentLanguage);
      return;
    }

    // Pas de préférence stockée : garder l'anglais comme langue par défaut
    this.currentLanguage = 'en';
    console.log('🌐 Using default interface language: English');
  }

  private static isValidLanguage(lang: string): boolean {
    return ['fr', 'en', 'es', 'it', 'de'].includes(lang);
  }

  static formatDate(date: Date, language?: SupportedLanguage): string {
    const config = this.getLocaleConfig(language);
    return date.toLocaleDateString(config.code === 'en' ? 'en-US' : `${config.code}-${config.code.toUpperCase()}`, config.dateFormat);
  }

  static getTemporalKeywords(language?: SupportedLanguage): TemporalKeywords {
    return this.getLocaleConfig(language).temporalKeywords;
  }

  static getSystemPrompts(language?: SupportedLanguage): SystemPrompts {
    return this.getLocaleConfig(language).systemPrompts;
  }

  static getFallbackMessages(language?: SupportedLanguage): FallbackMessages {
    return this.getLocaleConfig(language).fallbackMessages;
  }

  static getSupportedLanguages(): { code: SupportedLanguage; name: string }[] {
    return Object.values(LOCALE_CONFIGS).map(config => ({
      code: config.code,
      name: config.name
    }));
  }

  // Helper method to get current year dynamically
  static getCurrentYear(): number {
    return new Date().getFullYear();
  }

  // Helper method to detect years mentioned in text
  static detectYearsInText(text: string): number[] {
    const yearMatches = text.match(/\b(19|20)\d{2}\b/g);
    return yearMatches ? yearMatches.map(y => parseInt(y)) : [];
  }

  // Shopping helper methods
  static getShoppingConfig(language?: SupportedLanguage): ShoppingConfig {
    return this.getLocaleConfig(language).shopping;
  }

  static buildShoppingQuery(item: string, language?: SupportedLanguage): string {
    const config = this.getShoppingConfig(language);
    return `${config.buyVerb} ${item}`;
  }

  static buildGoogleShoppingUrl(query: string, language?: SupportedLanguage): string {
    const config = this.getShoppingConfig(language);
    const encodedQuery = encodeURIComponent(query);
    return `https://www.google.${config.googleTLD}/search?q=${encodedQuery}&tbm=shop&hl=${config.uiLanguage}&gl=${config.countryCode}`;
  }

  static isShoppingRelated(text: string, language?: SupportedLanguage): boolean {
    const config = this.getShoppingConfig(language);
    const lowerText = text.toLowerCase();
    return config.synonyms.some(synonym => lowerText.includes(synonym.toLowerCase()));
  }

  static buildGoogleWebUrl(query: string, language?: SupportedLanguage): string {
    const config = this.getShoppingConfig(language);
    const encodedQuery = encodeURIComponent(query);
    return `https://www.google.${config.googleTLD}/search?q=${encodedQuery}&hl=${config.uiLanguage}&gl=${config.countryCode}`;
  }

  static getOfficialSiteLabel(language?: SupportedLanguage): string {
    const lang = language || this.getCurrentLanguage();
    const labels = {
      'fr': 'Site officiel',
      'en': 'Official site',
      'es': 'Sitio oficial',
      'it': 'Sito ufficiale',
      'de': 'Offizielle Seite'
    };
    return labels[lang] || labels.fr;
  }
  
  static getDirectionsLabel(language?: SupportedLanguage): string {
    const lang = language || this.getCurrentLanguage();
    const labels = {
      'fr': 'Itinéraire',
      'en': 'Directions',
      'es': 'Direcciones',
      'it': 'Indicazioni',
      'de': 'Wegbeschreibung'
    };
    return labels[lang] || labels.fr;
  }
  
  static getReserveLabel(language?: SupportedLanguage): string {
    const lang = language || this.getCurrentLanguage();
    const labels = {
      'fr': 'Réserver',
      'en': 'Book',
      'es': 'Reservar',
      'it': 'Prenota',
      'de': 'Buchen'
    };
    return labels[lang] || labels.fr;
  }

  static getSearchLabel(language?: SupportedLanguage): string {
    const lang = language || this.getCurrentLanguage();
    const labels = {
      'fr': 'Rechercher',
      'en': 'Search',
      'es': 'Buscar',
      'it': 'Cercare',
      'de': 'Suchen'
    };
    return labels[lang] || labels.fr;
  }

  static getCompareLabel(language?: SupportedLanguage): string {
    const lang = language || this.getCurrentLanguage();
    const labels = {
      'fr': 'Comparer',
      'en': 'Compare',
      'es': 'Comparar',
      'it': 'Confrontare',
      'de': 'Vergleichen'
    };
    return labels[lang] || labels.fr;
  }

  static getNoLinkLabel(language?: SupportedLanguage): string {
    const lang = language || this.getCurrentLanguage();
    const labels = {
      'fr': 'Aucun lien',
      'en': 'No links',
      'es': 'Sin enlaces',
      'it': 'Nessun collegamento',
      'de': 'Keine Links'
    };
    return labels[lang] || labels.fr;
  }

  static getSearchingLabel(language?: SupportedLanguage): string {
    const lang = language || this.getCurrentLanguage();
    const labels = {
      'fr': 'Recherche...',
      'en': 'Searching...',
      'es': 'Buscando...',
      'it': 'Ricerca...',
      'de': 'Suche...'
    };
    return labels[lang] || labels.fr;
  }

  // Vertical detection methods
  static getVerticalKeywords(): Record<SupportedLanguage, Record<string, string[]>> {
    return {
      fr: {
        automotive: ['voiture', 'auto', 'véhicule', 'automobile', 'concessionnaire', 'garage', 'occasion', 'neuf', 'hybride', 'électrique', 'diesel', 'essence', 'vélo', 'bicyclette', 'vélos', 'bicycle', 'bike', 'bikes', 'cyclisme', 'cyclable', 'électrique', 'cargo', 'longtail'],
        accommodation: ['hôtel', 'hébergement', 'chambre', 'suite', 'resort', 'bed', 'breakfast', 'airbnb', 'gîte', 'camping'],
        travel: ['voyage', 'vacances', 'vol', 'avion', 'train', 'transport', 'billet', 'séjour', 'destination', 'tourisme'],
        dining: ['restaurant', 'réserver', 'réservation', 'table', 'dîner', 'déjeuner', 'cuisine', 'gastronomie', 'bistrot', 'brasserie', 'menu'],
        software: ['logiciel', 'application', 'app', 'programme', 'télécharger', 'installer', 'licence', 'abonnement']
      },
      en: {
        automotive: ['car', 'auto', 'vehicle', 'automobile', 'dealer', 'garage', 'used', 'new', 'hybrid', 'electric', 'diesel', 'gasoline', 'bike', 'bicycle', 'bikes', 'cycling', 'electric', 'cargo', 'longtail', 'ebike'],
        accommodation: ['hotel', 'accommodation', 'room', 'suite', 'resort', 'bed', 'breakfast', 'airbnb', 'lodge', 'camping'],
        travel: ['travel', 'vacation', 'flight', 'plane', 'train', 'transport', 'ticket', 'stay', 'destination', 'tourism'],
        dining: ['restaurant', 'book', 'reservation', 'table', 'dinner', 'lunch', 'cuisine', 'gastronomy', 'bistro', 'brasserie', 'menu'],
        software: ['software', 'application', 'app', 'program', 'download', 'install', 'license', 'subscription']
      },
      es: {
        automotive: ['coche', 'auto', 'vehículo', 'automóvil', 'concesionario', 'garaje', 'usado', 'nuevo', 'híbrido', 'eléctrico', 'diesel', 'gasolina'],
        accommodation: ['hotel', 'alojamiento', 'habitación', 'suite', 'resort', 'bed', 'breakfast', 'airbnb', 'posada', 'camping'],
        travel: ['viaje', 'vacaciones', 'vuelo', 'avión', 'tren', 'transporte', 'billete', 'estancia', 'destino', 'turismo'],
        dining: ['restaurante', 'reservar', 'reserva', 'mesa', 'cena', 'almuerzo', 'cocina', 'gastronomía', 'bistró', 'brasería', 'menú'],
        software: ['software', 'aplicación', 'app', 'programa', 'descargar', 'instalar', 'licencia', 'suscripción']
      },
      it: {
        automotive: ['auto', 'automobile', 'veicolo', 'concessionario', 'garage', 'usato', 'nuovo', 'ibrido', 'elettrico', 'diesel', 'benzina'],
        accommodation: ['hotel', 'alloggio', 'camera', 'suite', 'resort', 'bed', 'breakfast', 'airbnb', 'locanda', 'camping'],
        travel: ['viaggio', 'vacanza', 'volo', 'aereo', 'treno', 'trasporto', 'biglietto', 'soggiorno', 'destinazione', 'turismo'],
        dining: ['ristorante', 'prenotare', 'prenotazione', 'tavolo', 'cena', 'pranzo', 'cucina', 'gastronomia', 'bistrot', 'brasseria', 'menu'],
        software: ['software', 'applicazione', 'app', 'programma', 'scaricare', 'installare', 'licenza', 'abbonamento']
      },
      de: {
        automotive: ['auto', 'wagen', 'fahrzeug', 'automobil', 'händler', 'garage', 'gebraucht', 'neu', 'hybrid', 'elektrisch', 'diesel', 'benzin'],
        accommodation: ['hotel', 'unterkunft', 'zimmer', 'suite', 'resort', 'bed', 'breakfast', 'airbnb', 'pension', 'camping'],
        travel: ['reise', 'urlaub', 'flug', 'flugzeug', 'zug', 'transport', 'ticket', 'aufenthalt', 'reiseziel', 'tourismus'],
        dining: ['restaurant', 'reservieren', 'reservierung', 'tisch', 'abendessen', 'mittagessen', 'küche', 'gastronomie', 'bistro', 'brasserie', 'speisekarte'],
        software: ['software', 'anwendung', 'app', 'programm', 'herunterladen', 'installieren', 'lizenz', 'abonnement']
      }
    };
  }

  static detectVertical(text: string, language?: SupportedLanguage): string | null {
    const lang = language || this.currentLanguage;
    const verticalKeywords = this.getVerticalKeywords()[lang];
    const lowerText = text.toLowerCase();
    
    // Scoring system for better accuracy
    const scores: Record<string, number> = {};
    
    for (const [vertical, keywords] of Object.entries(verticalKeywords)) {
      scores[vertical] = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          scores[vertical] += matches.length;
        }
      }
    }
    
    // Return the vertical with the highest score, or null if no matches
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return null;
    
    return Object.keys(scores).find(vertical => scores[vertical] === maxScore) || null;
  }

  static buildVerticalQuery(text: string, vertical: string | null, language?: SupportedLanguage): string {
    const lang = language || this.currentLanguage;
    
    if (!vertical) return text;
    
    const verticalPrefixes = {
      fr: {
        dining: 'restaurant',
        accommodation: 'hôtel',
        travel: 'voyage',
        automotive: 'voiture',
        software: 'logiciel'
      },
      en: {
        dining: 'restaurant',
        accommodation: 'hotel',
        travel: 'travel',
        automotive: 'car',
        software: 'software'
      },
      es: {
        dining: 'restaurante',
        accommodation: 'hotel',
        travel: 'viaje',
        automotive: 'coche',
        software: 'software'
      },
      it: {
        dining: 'ristorante',
        accommodation: 'hotel',
        travel: 'viaggio',
        automotive: 'auto',
        software: 'software'
      },
      de: {
        dining: 'restaurant',
        accommodation: 'hotel',
        travel: 'reise',
        automotive: 'auto',
        software: 'software'
      }
    };
    
    const prefix = verticalPrefixes[lang]?.[vertical as keyof typeof verticalPrefixes['fr']];
    return prefix ? `${prefix} ${text}` : text;
  }

  static buildGoogleMapsSearchUrl(query: string, language?: SupportedLanguage): string {
    const config = this.getShoppingConfig(language);
    const encodedQuery = encodeURIComponent(query);
    return `https://www.google.${config.googleTLD}/maps/search/${encodedQuery}/@0,0,15z?hl=${config.uiLanguage}&gl=${config.countryCode}`;
  }

  static sanitizeProductQuery(query: string): string {
    return query
      .replace(/["']/g, '') // Remove quotes
      .replace(/\b(le|la|les|un|une|des|the|a|an|el|il|der|die|das)\b/gi, '') // Remove articles
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  static normalizeProductTermsToEN(text: string, language?: SupportedLanguage): string {
    const lang = language || this.currentLanguage;
    
    const translations: Record<SupportedLanguage, Record<string, string>> = {
      fr: {
        'téléphone': 'phone', 'ordinateur': 'computer', 'voiture': 'car',
        'chaussures': 'shoes', 'vêtements': 'clothing', 'livre': 'book',
        'sport': 'sports', 'équipement': 'equipment'
      },
      es: {
        'teléfono': 'phone', 'ordenador': 'computer', 'coche': 'car',
        'zapatos': 'shoes', 'ropa': 'clothing', 'libro': 'book',
        'deporte': 'sports', 'equipo': 'equipment'
      },
      it: {
        'telefono': 'phone', 'computer': 'computer', 'macchina': 'car',
        'scarpe': 'shoes', 'vestiti': 'clothing', 'libro': 'book',
        'sport': 'sports', 'attrezzatura': 'equipment'
      },
      de: {
        'telefon': 'phone', 'computer': 'computer', 'auto': 'car',
        'schuhe': 'shoes', 'kleidung': 'clothing', 'buch': 'book',
        'sport': 'sports', 'ausrüstung': 'equipment'
      },
      en: {} // No translation needed
    };

    let normalizedText = text.toLowerCase();
    const langTranslations = translations[lang] || {};
    
    Object.entries(langTranslations).forEach(([original, english]) => {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      normalizedText = normalizedText.replace(regex, english);
    });
    
    return normalizedText;
  }

  static detectSportsMerch(text: string, language?: SupportedLanguage): boolean {
    const lang = language || this.currentLanguage;
    const sportsKeywords = {
      fr: ['sport', 'équipement', 'fitness', 'course', 'tennis', 'football', 'basket', 'vélo', 'natation'],
      en: ['sports', 'equipment', 'fitness', 'running', 'tennis', 'football', 'basketball', 'cycling', 'swimming'],
      es: ['deporte', 'equipo', 'fitness', 'correr', 'tenis', 'fútbol', 'baloncesto', 'ciclismo', 'natación'],
      it: ['sport', 'attrezzatura', 'fitness', 'corsa', 'tennis', 'calcio', 'pallacanestro', 'ciclismo', 'nuoto'],
      de: ['sport', 'ausrüstung', 'fitness', 'laufen', 'tennis', 'fußball', 'basketball', 'radfahren', 'schwimmen']
    };
    
    const keywords = sportsKeywords[lang] || sportsKeywords.en;
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
  }

  static buildMerchantSearchUrl(merchantDomain: string, query: string, language?: SupportedLanguage): string {
    const config = this.getShoppingConfig(language);
    const sanitizedQuery = this.sanitizeProductQuery(query);
    const normalizedQuery = this.normalizeProductTermsToEN(sanitizedQuery, language);
    
    // Special handling for specific merchants
    if (merchantDomain.includes('fnac.')) {
      const searchQuery = `site:${merchantDomain} ${normalizedQuery}`;
      const encodedQuery = encodeURIComponent(searchQuery);
      return `https://www.google.${config.googleTLD}/search?q=${encodedQuery}&hl=${config.uiLanguage}&gl=${config.countryCode}`;
    }
    
    // For sports merchandise, use more specific terms
    if (this.detectSportsMerch(query, language)) {
      const sportsQuery = `site:${merchantDomain} ${normalizedQuery} equipment gear`;
      const encodedQuery = encodeURIComponent(sportsQuery);
      return `https://www.google.${config.googleTLD}/search?q=${encodedQuery}&hl=${config.uiLanguage}&gl=${config.countryCode}`;
    }
    
    // Default merchant search
    const searchQuery = `site:${merchantDomain} ${normalizedQuery}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    return `https://www.google.${config.googleTLD}/search?q=${encodedQuery}&hl=${config.uiLanguage}&gl=${config.countryCode}`;
  }

  static isAutomotiveRelated(text: string, language?: SupportedLanguage): boolean {
    return this.detectVertical(text, language) === 'automotive';
  }

  static isTravelRelated(text: string, language?: SupportedLanguage): boolean {
    return this.detectVertical(text, language) === 'travel';
  }

  static isAccommodationRelated(text: string, language?: SupportedLanguage): boolean {
    return this.detectVertical(text, language) === 'accommodation';
  }

  static isDiningRelated(text: string, language?: SupportedLanguage): boolean {
    return this.detectVertical(text, language) === 'dining';
  }

  static isSoftwareRelated(text: string, language?: SupportedLanguage): boolean {
    return this.detectVertical(text, language) === 'software';
  }
}

// Initialize the service
I18nService.initializeLanguage();