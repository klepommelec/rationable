
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default 1 hour
}

class CacheService {
  private static readonly DEFAULT_TTL = 60 * 60 * 1000; // 1 hour
  private static readonly MAX_CACHE_SIZE = 50; // Limit cache entries

  static generateCacheKey(dilemma: string, criteria?: any[]): string {
    const criteriaString = criteria ? JSON.stringify(criteria.map(c => c.name).sort()) : '';
    return `decision_${btoa(dilemma + criteriaString).slice(0, 32)}`;
  }

  static set(key: string, data: any, options: CacheOptions = {}): void {
    try {
      const ttl = options.ttl || this.DEFAULT_TTL;
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl
      };

      // Clean old entries before adding new one
      this.cleanExpired();
      this.enforceMaxSize();

      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      console.log(`💾 [CACHE] Stored entry for key: ${key.slice(0, 16)}...`);
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  static get(key: string): any | null {
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (!stored) return null;

      const entry: CacheEntry = JSON.parse(stored);
      const now = Date.now();

      if (now - entry.timestamp > entry.ttl) {
        localStorage.removeItem(`cache_${key}`);
        console.log(`⏰ [CACHE] Expired entry removed: ${key.slice(0, 16)}...`);
        return null;
      }

      console.log(`✅ [CACHE] Hit for key: ${key.slice(0, 16)}...`);
      return entry.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  static invalidate(key: string): void {
    localStorage.removeItem(`cache_${key}`);
    console.log(`🗑️ [CACHE] Invalidated key: ${key.slice(0, 16)}...`);
  }

  static clear(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 [CACHE] Cleared ${keys.length} entries`);
  }

  private static cleanExpired(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
    const now = Date.now();
    let cleaned = 0;

    keys.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const entry: CacheEntry = JSON.parse(stored);
          if (now - entry.timestamp > entry.ttl) {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      } catch (error) {
        localStorage.removeItem(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`🧹 [CACHE] Cleaned ${cleaned} expired entries`);
    }
  }

  private static enforceMaxSize(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
    if (keys.length >= this.MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entries = keys.map(key => {
        try {
          const stored = localStorage.getItem(key);
          const entry: CacheEntry = stored ? JSON.parse(stored) : null;
          return { key, timestamp: entry?.timestamp || 0 };
        } catch {
          return { key, timestamp: 0 };
        }
      }).sort((a, b) => a.timestamp - b.timestamp);

      const toRemove = entries.slice(0, keys.length - this.MAX_CACHE_SIZE + 5);
      toRemove.forEach(({ key }) => localStorage.removeItem(key));
      
      if (toRemove.length > 0) {
        console.log(`🧹 [CACHE] Removed ${toRemove.length} old entries to enforce size limit`);
      }
    }
  }
}

export default CacheService;
