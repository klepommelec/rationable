/**
 * Configuration des fonctionnalités avancées
 */

export const ADVANCED_FEATURES_CONFIG = {
  // Configuration du lazy loading avancé
  LAZY_LOADING: {
    // Activer le lazy loading intelligent
    ENABLED: true,
    
    // Délai de préchargement (en ms)
    PRELOAD_DELAY: 2000,
    
    // Nombre de tentatives en cas d'échec
    RETRY_COUNT: 3,
    
    // Délai entre les tentatives (en ms)
    RETRY_DELAY: 1000,
    
    // Composants à précharger par route
    PRELOAD_BY_ROUTE: {
      '/': [
        '/components/decision-maker/DilemmaSetup',
        '/components/workspace/WorkspaceSelector'
      ],
      '/settings': [
        '/components/settings/ProfileSettings',
        '/components/settings/AppearanceSettings'
      ],
      '/workspace': [
        '/components/workspace/WorkspaceManager',
        '/components/decision-maker/DecisionMaker'
      ],
      '/decision': [
        '/components/decision-maker/AnalysisResult',
        '/components/decision-maker/CommentSection'
      ]
    },
    
    // Configuration de l'intersection observer
    INTERSECTION_OBSERVER: {
      ROOT_MARGIN: '50px',
      THRESHOLD: 0.1
    }
  },

  // Configuration des animations
  ANIMATIONS: {
    // Activer les animations
    ENABLED: true,
    
    // Réduire les animations pour les utilisateurs qui le préfèrent
    RESPECT_MOTION_PREFERENCES: true,
    
    // Durée des transitions (en ms)
    TRANSITION_DURATION: 400,
    
    // Type d'easing
    EASING: 'anticipate',
    
    // Configuration des animations par type
    TYPES: {
      PAGE_TRANSITION: {
        DURATION: 400,
        EASING: 'anticipate'
      },
      FADE_TRANSITION: {
        DURATION: 500,
        EASING: 'easeOut'
      },
      SCALE_TRANSITION: {
        DURATION: 300,
        EASING: 'spring',
        STIFFNESS: 300,
        DAMPING: 20
      },
      STAGGER_TRANSITION: {
        STAGGER_CHILDREN: 0.1,
        DELAY_CHILDREN: 0.1
      }
    }
  },

  // Configuration de l'accessibilité
  ACCESSIBILITY: {
    // Activer l'audit d'accessibilité
    AUDIT_ENABLED: true,
    
    // Activer axe-core en développement
    AXE_DEV_MODE: true,
    
    // Configuration de l'audit
    AUDIT_CONFIG: {
      // Inclure les violations, passes et tests incomplets
      INCLUDE: ['violations', 'passes', 'incomplete'],
      
      // Règles spécifiques à vérifier
      RULES: [
        'color-contrast',
        'keyboard-navigation',
        'aria-labels',
        'semantic-html',
        'focus-management'
      ],
      
      // Tags à exclure
      EXCLUDE: ['experimental']
    },
    
    // Configuration des tests automatiques
    AUTO_TEST: {
      ENABLED: false,
      INTERVAL: 30000, // 30 secondes
      PAGES: ['/', '/settings', '/workspace']
    }
  },

  // Configuration de Sentry
  SENTRY: {
    // Activer Sentry
    ENABLED: true,
    
    // Configuration de l'environnement
    ENVIRONMENT: import.meta.env.MODE,
    
    // Taux d'échantillonnage des traces
    TRACES_SAMPLE_RATE: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    
    // Taux d'échantillonnage des sessions replay
    REPLAYS_SESSION_SAMPLE_RATE: import.meta.env.MODE === 'production' ? 0.01 : 0.1,
    REPLAYS_ON_ERROR_SAMPLE_RATE: 1.0,
    
    // Configuration des filtres
    FILTERS: {
      // Filtrer les erreurs de développement
      FILTER_DEV_ERRORS: true,
      
      // Filtrer les erreurs de réseau
      FILTER_NETWORK_ERRORS: true,
      
      // Filtrer les erreurs CORS
      FILTER_CORS_ERRORS: true,
      
      // Filtrer les breadcrumbs de navigation
      FILTER_NAVIGATION_BREADCRUMBS: true,
      
      // Filtrer les breadcrumbs de console en production
      FILTER_CONSOLE_BREADCRUMBS: import.meta.env.MODE === 'production'
    },
    
    // Configuration des performances
    PERFORMANCE: {
      // Activer le monitoring des performances
      ENABLED: true,
      
      // Seuils de performance
      THRESHOLDS: {
        SLOW_TRANSACTION: 2000, // 2 secondes
        VERY_SLOW_TRANSACTION: 5000 // 5 secondes
      },
      
      // Transactions à surveiller
      MONITORED_TRANSACTIONS: [
        'page-load',
        'api-request',
        'user-interaction',
        'component-render'
      ]
    }
  },

  // Configuration des fonctionnalités expérimentales
  EXPERIMENTAL: {
    // Activer les fonctionnalités expérimentales
    ENABLED: import.meta.env.DEV,
    
    // Service Worker
    SERVICE_WORKER: {
      ENABLED: false,
      CACHE_STRATEGY: 'stale-while-revalidate'
    },
    
    // Web Workers
    WEB_WORKERS: {
      ENABLED: false,
      WORKERS: ['calculation-worker', 'image-processing-worker']
    },
    
    // WebAssembly
    WEBASSEMBLY: {
      ENABLED: false,
      MODULES: ['crypto-module', 'compression-module']
    }
  }
};

/**
 * Configuration par environnement
 */
export const getAdvancedFeaturesConfig = () => {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;

  return {
    ...ADVANCED_FEATURES_CONFIG,
    
    // Ajustements pour le développement
    ...(isDev && {
      SENTRY: {
        ...ADVANCED_FEATURES_CONFIG.SENTRY,
        TRACES_SAMPLE_RATE: 1.0,
        REPLAYS_SESSION_SAMPLE_RATE: 0.1
      },
      ACCESSIBILITY: {
        ...ADVANCED_FEATURES_CONFIG.ACCESSIBILITY,
        AXE_DEV_MODE: true,
        AUTO_TEST: {
          ...ADVANCED_FEATURES_CONFIG.ACCESSIBILITY.AUTO_TEST,
          ENABLED: true
        }
      }
    }),
    
    // Ajustements pour la production
    ...(isProd && {
      SENTRY: {
        ...ADVANCED_FEATURES_CONFIG.SENTRY,
        TRACES_SAMPLE_RATE: 0.1,
        REPLAYS_SESSION_SAMPLE_RATE: 0.01
      },
      ACCESSIBILITY: {
        ...ADVANCED_FEATURES_CONFIG.ACCESSIBILITY,
        AXE_DEV_MODE: false,
        AUTO_TEST: {
          ...ADVANCED_FEATURES_CONFIG.ACCESSIBILITY.AUTO_TEST,
          ENABLED: false
        }
      }
    })
  };
};

/**
 * Utilitaires de configuration
 */
export const advancedFeaturesUtils = {
  /**
   * Vérifie si une fonctionnalité est activée
   */
  isFeatureEnabled: (feature: keyof typeof ADVANCED_FEATURES_CONFIG): boolean => {
    const config = getAdvancedFeaturesConfig();
    return config[feature]?.ENABLED !== false;
  },

  /**
   * Obtient la configuration d'une fonctionnalité
   */
  getFeatureConfig: <K extends keyof typeof ADVANCED_FEATURES_CONFIG>(
    feature: K
  ): typeof ADVANCED_FEATURES_CONFIG[K] => {
    const config = getAdvancedFeaturesConfig();
    return config[feature];
  },

  /**
   * Met à jour la configuration en temps réel
   */
  updateConfig: (updates: Partial<typeof ADVANCED_FEATURES_CONFIG>) => {
    Object.assign(ADVANCED_FEATURES_CONFIG, updates);
  },

  /**
   * Réinitialise la configuration
   */
  resetConfig: () => {
    // Recharger la configuration par défaut
    window.location.reload();
  },

  /**
   * Exporte la configuration actuelle
   */
  exportConfig: () => {
    const config = getAdvancedFeaturesConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'advanced-features-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};


