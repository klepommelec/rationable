/**
 * Utilitaires d'optimisation pour améliorer les performances
 */

/**
 * Debounce une fonction pour éviter les appels trop fréquents
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

/**
 * Throttle une fonction pour limiter la fréquence d'exécution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Mémorisation simple pour éviter les recalculs
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Pool d'objets pour éviter les allocations fréquentes
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn?: (obj: T) => void,
    maxSize = 100
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length >= this.maxSize) {
      return; // Pool plein, abandonner l'objet
    }

    if (this.resetFn) {
      this.resetFn(obj);
    }

    this.pool.push(obj);
  }

  clear(): void {
    this.pool.length = 0;
  }

  get size(): number {
    return this.pool.length;
  }
}

/**
 * Gestionnaire de tâches avec priorité
 */
export class TaskScheduler {
  private tasks: Array<{
    id: string;
    task: () => void;
    priority: number;
    scheduledTime: number;
  }> = [];
  private isRunning = false;
  private currentTaskId: string | null = null;

  schedule(
    id: string,
    task: () => void,
    priority = 0,
    delay = 0
  ): void {
    // Annuler la tâche existante avec le même ID
    this.cancel(id);

    const scheduledTime = Date.now() + delay;
    
    this.tasks.push({
      id,
      task,
      priority,
      scheduledTime
    });

    // Trier par priorité (plus élevé = plus prioritaire)
    this.tasks.sort((a, b) => b.priority - a.priority);

    if (!this.isRunning) {
      this.run();
    }
  }

  cancel(id: string): void {
    this.tasks = this.tasks.filter(task => task.id !== id);
    
    if (this.currentTaskId === id) {
      this.currentTaskId = null;
    }
  }

  private async run(): Promise<void> {
    this.isRunning = true;

    while (this.tasks.length > 0) {
      const now = Date.now();
      const readyTasks = this.tasks.filter(task => task.scheduledTime <= now);

      if (readyTasks.length === 0) {
        // Attendre le prochain moment d'exécution
        const nextTask = this.tasks[0];
        const delay = nextTask.scheduledTime - now;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Exécuter la tâche avec la plus haute priorité
      const task = readyTasks[0];
      this.currentTaskId = task.id;
      
      try {
        await task.task();
      } catch (error) {
        console.error(`Erreur dans la tâche ${task.id}:`, error);
      }

      // Supprimer la tâche exécutée
      this.tasks = this.tasks.filter(t => t.id !== task.id);
      this.currentTaskId = null;

      // Permettre à d'autres tâches de s'exécuter
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    this.isRunning = false;
  }

  getStats() {
    return {
      pendingTasks: this.tasks.length,
      isRunning: this.isRunning,
      currentTask: this.currentTaskId
    };
  }
}

/**
 * Gestionnaire de ressources avec préchargement
 */
export class ResourceManager {
  private loadedResources = new Set<string>();
  private loadingResources = new Map<string, Promise<any>>();
  private preloadQueue: string[] = [];

  async loadScript(src: string): Promise<void> {
    if (this.loadedResources.has(src)) {
      return;
    }

    if (this.loadingResources.has(src)) {
      return this.loadingResources.get(src);
    }

    const promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        this.loadedResources.add(src);
        this.loadingResources.delete(src);
        resolve();
      };
      script.onerror = () => {
        this.loadingResources.delete(src);
        reject(new Error(`Failed to load script: ${src}`));
      };
      document.head.appendChild(script);
    });

    this.loadingResources.set(src, promise);
    return promise;
  }

  async loadStylesheet(href: string): Promise<void> {
    if (this.loadedResources.has(href)) {
      return;
    }

    if (this.loadingResources.has(href)) {
      return this.loadingResources.get(href);
    }

    const promise = new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => {
        this.loadedResources.add(href);
        this.loadingResources.delete(href);
        resolve();
      };
      link.onerror = () => {
        this.loadingResources.delete(href);
        reject(new Error(`Failed to load stylesheet: ${href}`));
      };
      document.head.appendChild(link);
    });

    this.loadingResources.set(href, promise);
    return promise;
  }

  async loadImage(src: string): Promise<HTMLImageElement> {
    if (this.loadedResources.has(src)) {
      return Promise.resolve(new Image());
    }

    if (this.loadingResources.has(src)) {
      return this.loadingResources.get(src);
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedResources.add(src);
        this.loadingResources.delete(src);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingResources.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loadingResources.set(src, promise);
    return promise;
  }

  preload(resources: string[]): void {
    this.preloadQueue.push(...resources);
    this.processPreloadQueue();
  }

  private async processPreloadQueue(): Promise<void> {
    while (this.preloadQueue.length > 0) {
      const resource = this.preloadQueue.shift()!;
      
      try {
        if (resource.endsWith('.js')) {
          await this.loadScript(resource);
        } else if (resource.endsWith('.css')) {
          await this.loadStylesheet(resource);
        } else if (resource.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          await this.loadImage(resource);
        }
      } catch (error) {
        console.warn(`Failed to preload resource: ${resource}`, error);
      }
    }
  }

  getStats() {
    return {
      loadedResources: this.loadedResources.size,
      loadingResources: this.loadingResources.size,
      preloadQueue: this.preloadQueue.length
    };
  }
}

/**
 * Gestionnaire de cache avec TTL et LRU
 */
export class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number; ttl: number }>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

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

    // Déplacer l'item à la fin (plus récemment utilisé)
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  set(key: string, value: T, ttl?: number): void {
    // Si la clé existe déjà, la supprimer d'abord
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Si le cache est plein, supprimer l'item le moins récemment utilisé
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

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

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * Instances globales
 */
export const taskScheduler = new TaskScheduler();
export const resourceManager = new ResourceManager();
export const lruCache = new LRUCache();

/**
 * Hook React pour le debouncing
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook React pour le throttling
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}


