// Service de cache spécialisé pour les liens intelligents avec persistance
export interface CachedActionLinks {
  official?: { url: string; title: string; domain: string };
  merchants: Array<{ url: string; title: string; domain: string }>;
  maps?: { url: string; title: string };
  actionType: 'directions' | 'reserve' | 'buy';
  provider: string;
  timestamp: number;
  expiresAt: number;
}

class ActionLinksCacheService {
  private cache = new Map<string, CachedActionLinks>();
  private readonly TTL = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes
  private readonly STORAGE_KEY = 'rationable_action_links_cache';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        // Ne charger que les entrées non expirées
        for (const [key, value] of Object.entries(data)) {
          const cachedResult = value as CachedActionLinks;
          if (cachedResult.expiresAt > now) {
            this.cache.set(key, cachedResult);
          }
        }
        
        console.log(`📦 Loaded ${this.cache.size} cached action links from localStorage`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load action links cache from localStorage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('⚠️ Failed to save action links cache to localStorage:', error);
    }
  }

  private generateCacheKey(optionName: string, language: string, vertical?: string): string {
    const normalized = optionName.toLowerCase().trim();
    const contextKey = vertical ? `_${vertical.toLowerCase()}_${language}` : `_${language}`;
    return encodeURIComponent(normalized + contextKey).replace(/[.%]/g, '').substring(0, 100);
  }

  get(optionName: string, language: string, vertical?: string): CachedActionLinks | null {
    const key = this.generateCacheKey(optionName, language, vertical);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      this.saveToStorage();
      console.log('🗑️ Action links cache expired for:', optionName.substring(0, 50) + '...');
      return null;
    }

    const ageInHours = Math.round((Date.now() - cached.timestamp) / (1000 * 60 * 60));
    console.log(`✅ Action links cache hit (${ageInHours}h old) for:`, optionName.substring(0, 50) + '...');
    return cached;
  }

  set(optionName: string, language: string, vertical: string | undefined, actionLinks: CachedActionLinks): void {
    const key = this.generateCacheKey(optionName, language, vertical);
    const now = Date.now();
    
    const cachedResult: CachedActionLinks = {
      ...actionLinks,
      timestamp: now,
      expiresAt: now + this.TTL
    };

    this.cache.set(key, cachedResult);
    console.log(`💾 Cached action links for:`, optionName.substring(0, 50) + '...');
    
    // Sauvegarder immédiatement dans localStorage
    this.saveToStorage();
    
    // Nettoyer les entrées expirées
    this.cleanupExpired();
  }

  private cleanupExpired(): void {
    const before = this.cache.size;
    let cleaned = 0;
    const now = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired action links cache entries (${before} -> ${this.cache.size})`);
      this.saveToStorage();
    }

    // Si le cache devient trop volumineux, supprimer les plus anciens
    if (this.cache.size > 200) {
      const entries = Array.from(this.cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = entries.slice(0, 100); // Supprimer les 100 plus anciens
      
      toDelete.forEach(([key]) => this.cache.delete(key));
      console.log(`🧹 Action links cache size limit reached, removed ${toDelete.length} oldest entries`);
      this.saveToStorage();
    }
  }

  clear(): void {
    this.cache.clear();
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('⚠️ Failed to clear action links cache from localStorage:', error);
    }
    console.log('🗑️ Action links cache cleared');
  }

  getStats(): { size: number; oldestEntry?: number; newestEntry?: number } {
    if (this.cache.size === 0) {
      return { size: 0 };
    }

    const timestamps = Array.from(this.cache.values()).map(v => v.timestamp);
    return {
      size: this.cache.size,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps)
    };
  }

  // Méthode pour migrer les anciens caches
  migrateFromOldCache(oldCache: Record<string, any>): void {
    let migrated = 0;
    const now = Date.now();

    for (const [key, value] of Object.entries(oldCache)) {
      if (value && typeof value === 'object' && value.actionType) {
        const cachedResult: CachedActionLinks = {
          ...value,
          timestamp: now,
          expiresAt: now + this.TTL
        };
        this.cache.set(key, cachedResult);
        migrated++;
      }
    }

    if (migrated > 0) {
      console.log(`🔄 Migrated ${migrated} action links from old cache`);
      this.saveToStorage();
    }
  }
}

// Instance singleton
export const actionLinksCacheService = new ActionLinksCacheService();
