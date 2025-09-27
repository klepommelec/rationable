/**
 * Configuration des optimisations de performance
 */

export const PERFORMANCE_CONFIG = {
  // Configuration du cache
  CACHE: {
    // TTL par défaut pour les caches (en millisecondes)
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    USER_CACHE_TTL: 30 * 60 * 1000, // 30 minutes
    WORKSPACE_CACHE_TTL: 15 * 60 * 1000, // 15 minutes
    API_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
    
    // Tailles maximales des caches
    MAX_CACHE_SIZE: 100,
    MAX_API_CACHE_SIZE: 200,
    MAX_USER_CACHE_SIZE: 50,
    MAX_WORKSPACE_CACHE_SIZE: 100,
  },

  // Configuration du lazy loading
  LAZY_LOADING: {
    // Délai avant de charger les composants lazy (en ms)
    LOAD_DELAY: 100,
    
    // Composants à précharger
    PRELOAD_COMPONENTS: [
      '/components/decision-maker/DilemmaSetup',
      '/components/workspace/WorkspaceSelector',
      '/components/settings/ProfileSettings'
    ],
    
    // Images à précharger
    PRELOAD_IMAGES: [
      '/images/logo.svg',
      '/images/placeholder.png'
    ]
  },

  // Configuration des requêtes
  QUERIES: {
    // Délai de debounce pour les recherches (en ms)
    SEARCH_DEBOUNCE: 300,
    
    // Délai de debounce pour les filtres (en ms)
    FILTER_DEBOUNCE: 200,
    
    // Nombre de retries par défaut
    DEFAULT_RETRIES: 3,
    
    // Délai entre les retries (en ms)
    RETRY_DELAY: 1000,
    
    // Taille de page par défaut
    DEFAULT_PAGE_SIZE: 10,
    
    // Taille maximale de page
    MAX_PAGE_SIZE: 100
  },

  // Configuration des images
  IMAGES: {
    // Qualité par défaut des images optimisées
    DEFAULT_QUALITY: 75,
    
    // Formats supportés
    SUPPORTED_FORMATS: ['webp', 'avif', 'jpg', 'jpeg', 'png'],
    
    // Tailles de breakpoints pour les images responsives
    BREAKPOINTS: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    },
    
    // Tailles d'images pour les srcsets
    SRC_SET_SIZES: [320, 640, 768, 1024, 1280, 1536],
    
    // Placeholder blur
    BLUR_PLACEHOLDER_SIZE: 10
  },

  // Configuration du monitoring
  MONITORING: {
    // Activer le monitoring en développement
    ENABLE_IN_DEV: false,
    
    // Activer le monitoring en production
    ENABLE_IN_PROD: true,
    
    // Seuils de performance (en ms)
    THRESHOLDS: {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 },
      FCP: { good: 1800, poor: 3000 }
    },
    
    // Intervalle de rapport (en ms)
    REPORT_INTERVAL: 30 * 1000, // 30 secondes
    
    // URL de l'endpoint de rapport
    REPORT_ENDPOINT: '/api/analytics/performance'
  },

  // Configuration des ressources
  RESOURCES: {
    // Précharger les ressources critiques
    PRELOAD_CRITICAL: [
      '/fonts/inter.woff2',
      '/css/critical.css'
    ],
    
    // Délai avant de précharger les ressources non-critiques
    PRELOAD_DELAY: 2000,
    
    // Ressources à charger en arrière-plan
    BACKGROUND_LOAD: [
      '/js/analytics.js',
      '/js/chat-widget.js'
    ]
  },

  // Configuration du code splitting
  CODE_SPLITTING: {
    // Taille minimale des chunks (en KB)
    MIN_CHUNK_SIZE: 20,
    
    // Taille maximale des chunks (en KB)
    MAX_CHUNK_SIZE: 500,
    
    // Composants à séparer en chunks individuels
    SEPARATE_CHUNKS: [
      'Settings',
      'DecisionMaker',
      'WorkspaceManager'
    ],
    
    // Bibliothèques à mettre dans des chunks séparés
    VENDOR_CHUNKS: {
      'vendor-react': ['react', 'react-dom', 'react-router-dom'],
      'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
      'vendor-utils': ['@tanstack/react-query', 'date-fns', 'zod'],
      'vendor-supabase': ['@supabase/supabase-js']
    }
  },

  // Configuration de la compression
  COMPRESSION: {
    // Activer la compression gzip
    ENABLE_GZIP: true,
    
    // Activer la compression brotli
    ENABLE_BROTLI: true,
    
    // Niveau de compression (1-9)
    COMPRESSION_LEVEL: 6,
    
    // Types de fichiers à compresser
    COMPRESS_TYPES: [
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'image/svg+xml'
    ]
  },

  // Configuration du service worker
  SERVICE_WORKER: {
    // Activer le service worker
    ENABLED: true,
    
    // Stratégie de cache
    CACHE_STRATEGY: 'stale-while-revalidate',
    
    // Ressources à mettre en cache
    CACHE_RESOURCES: [
      '/',
      '/manifest.json',
      '/images/logo.svg'
    ],
    
    // TTL du cache (en secondes)
    CACHE_TTL: 24 * 60 * 60, // 24 heures
  }
};

/**
 * Configuration des optimisations par environnement
 */
export const getPerformanceConfig = () => {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;

  return {
    ...PERFORMANCE_CONFIG,
    
    // Ajustements pour le développement
    ...(isDev && {
      MONITORING: {
        ...PERFORMANCE_CONFIG.MONITORING,
        ENABLE_IN_DEV: true
      },
      CACHE: {
        ...PERFORMANCE_CONFIG.CACHE,
        DEFAULT_TTL: 1 * 60 * 1000 // 1 minute en dev
      }
    }),
    
    // Ajustements pour la production
    ...(isProd && {
      MONITORING: {
        ...PERFORMANCE_CONFIG.MONITORING,
        ENABLE_IN_PROD: true
      },
      COMPRESSION: {
        ...PERFORMANCE_CONFIG.COMPRESSION,
        ENABLE_GZIP: true,
        ENABLE_BROTLI: true
      }
    })
  };
};

/**
 * Utilitaires de configuration
 */
export const configUtils = {
  /**
   * Vérifie si une fonctionnalité est activée
   */
  isFeatureEnabled: (feature: keyof typeof PERFORMANCE_CONFIG): boolean => {
    const config = getPerformanceConfig();
    return config[feature]?.ENABLED !== false;
  },

  /**
   * Obtient la configuration d'une fonctionnalité
   */
  getFeatureConfig: <K extends keyof typeof PERFORMANCE_CONFIG>(
    feature: K
  ): typeof PERFORMANCE_CONFIG[K] => {
    const config = getPerformanceConfig();
    return config[feature];
  },

  /**
   * Met à jour la configuration en temps réel
   */
  updateConfig: (updates: Partial<typeof PERFORMANCE_CONFIG>) => {
    Object.assign(PERFORMANCE_CONFIG, updates);
  },

  /**
   * Réinitialise la configuration
   */
  resetConfig: () => {
    // Recharger la configuration par défaut
    window.location.reload();
  }
};


