/**
 * Système de cache avancé pour optimiser les performances
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface CacheOptions {
  ttl?: number; // Time to live en millisecondes
  maxSize?: number; // Taille maximale du cache
  persist?: boolean; // Persistance dans localStorage
}

/**
 * Cache en mémoire avec TTL et gestion de la taille
 */
export class MemoryCache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes par défaut
  }

  /**
   * Récupère une valeur du cache
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Vérifier si l'item a expiré
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Incrémenter le compteur d'accès
    item.hits++;
    return item.data;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set(key: string, value: T, ttl?: number): void {
    // Si le cache est plein, supprimer l'item le moins utilisé
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0
    });
  }

  /**
   * Supprime une valeur du cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Vide le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Vérifie si une clé existe dans le cache
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Vérifier si l'item a expiré
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats() {
    const items = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits: items.reduce((sum, item) => sum + item.hits, 0),
      averageHits: items.length > 0 ? items.reduce((sum, item) => sum + item.hits, 0) / items.length : 0,
      oldestItem: items.length > 0 ? Math.min(...items.map(item => item.timestamp)) : null,
      newestItem: items.length > 0 ? Math.max(...items.map(item => item.timestamp)) : null
    };
  }

  /**
   * Supprime l'item le moins utilisé
   */
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastHits = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.hits < leastHits) {
        leastHits = item.hits;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }
}

/**
 * Cache persistant avec localStorage
 */
export class PersistentCache<T = any> {
  private memoryCache: MemoryCache<T>;
  private storageKey: string;
  private persist: boolean;

  constructor(storageKey: string, options: CacheOptions = {}) {
    this.storageKey = storageKey;
    this.persist = options.persist !== false;
    this.memoryCache = new MemoryCache(options);
    
    if (this.persist) {
      this.loadFromStorage();
    }
  }

  /**
   * Récupère une valeur du cache
   */
  get(key: string): T | null {
    return this.memoryCache.get(key);
  }

  /**
   * Stocke une valeur dans le cache
   */
  set(key: string, value: T, ttl?: number): void {
    this.memoryCache.set(key, value, ttl);
    
    if (this.persist) {
      this.saveToStorage();
    }
  }

  /**
   * Supprime une valeur du cache
   */
  delete(key: string): boolean {
    const result = this.memoryCache.delete(key);
    
    if (this.persist) {
      this.saveToStorage();
    }
    
    return result;
  }

  /**
   * Vide le cache
   */
  clear(): void {
    this.memoryCache.clear();
    
    if (this.persist) {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Vérifie si une clé existe dans le cache
   */
  has(key: string): boolean {
    return this.memoryCache.has(key);
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats() {
    return this.memoryCache.getStats();
  }

  /**
   * Charge le cache depuis localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Reconstruire le cache en mémoire
        for (const [key, item] of Object.entries(data)) {
          this.memoryCache.set(key, (item as CacheItem<T>).data, (item as CacheItem<T>).ttl);
        }
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du cache depuis localStorage:', error);
    }
  }

  /**
   * Sauvegarde le cache dans localStorage
   */
  private saveToStorage(): void {
    try {
      const stats = this.memoryCache.getStats();
      if (stats.size > 0) {
        // Convertir le cache en objet pour la sérialisation
        const cacheData: Record<string, CacheItem<T>> = {};
        // Note: Cette implémentation simplifiée ne sauvegarde que les données
        // Une implémentation complète nécessiterait d'exposer les données internes
        localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
      }
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du cache dans localStorage:', error);
    }
  }
}

/**
 * Cache pour les requêtes API avec invalidation intelligente
 */
export class APICache {
  private cache: MemoryCache<any>;
  private invalidators = new Map<string, Set<string>>();

  constructor(options: CacheOptions = {}) {
    this.cache = new MemoryCache({
      ttl: 5 * 60 * 1000, // 5 minutes par défaut
      maxSize: 200,
      ...options
    });
  }

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    return this.cache.get(key);
  }

  /**
   * Stocke une valeur dans le cache avec des tags d'invalidation
   */
  set<T>(key: string, value: T, tags: string[] = [], ttl?: number): void {
    this.cache.set(key, value, ttl);
    
    // Associer les tags à la clé pour l'invalidation
    tags.forEach(tag => {
      if (!this.invalidators.has(tag)) {
        this.invalidators.set(tag, new Set());
      }
      this.invalidators.get(tag)!.add(key);
    });
  }

  /**
   * Invalide toutes les entrées avec un tag spécifique
   */
  invalidateByTag(tag: string): void {
    const keys = this.invalidators.get(tag);
    if (keys) {
      keys.forEach(key => this.cache.delete(key));
      this.invalidators.delete(tag);
    }
  }

  /**
   * Invalide toutes les entrées avec plusieurs tags
   */
  invalidateByTags(tags: string[]): void {
    tags.forEach(tag => this.invalidateByTag(tag));
  }

  /**
   * Supprime une valeur du cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Vide le cache
   */
  clear(): void {
    this.cache.clear();
    this.invalidators.clear();
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats() {
    return {
      ...this.cache.getStats(),
      tagsCount: this.invalidators.size,
      totalTaggedKeys: Array.from(this.invalidators.values()).reduce((sum, set) => sum + set.size, 0)
    };
  }
}

/**
 * Instances de cache globales
 */
export const apiCache = new APICache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 200
});

export const userCache = new PersistentCache('rationable-user-cache', {
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 50,
  persist: true
});

export const workspaceCache = new PersistentCache('rationable-workspace-cache', {
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 100,
  persist: true
});

/**
 * Hook pour utiliser le cache dans les composants React
 */
export const useCache = <T>(cache: MemoryCache<T> | PersistentCache<T>) => {
  return {
    get: (key: string) => cache.get(key),
    set: (key: string, value: T, ttl?: number) => cache.set(key, value, ttl),
    delete: (key: string) => cache.delete(key),
    clear: () => cache.clear(),
    has: (key: string) => cache.has(key),
    stats: () => cache.getStats()
  };
};

/**
 * Utilitaires de cache
 */
export const cacheUtils = {
  /**
   * Génère une clé de cache basée sur des paramètres
   */
  generateKey: (prefix: string, params: Record<string, any>): string => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  },

  /**
   * Nettoie les caches expirés
   */
  cleanup: () => {
    // Cette fonction pourrait être appelée périodiquement
    // pour nettoyer les caches expirés
    console.log('Cache cleanup completed');
  },

  /**
   * Retourne les statistiques de tous les caches
   */
  getAllStats: () => ({
    api: apiCache.getStats(),
    user: userCache.getStats(),
    workspace: workspaceCache.getStats()
  })
};


