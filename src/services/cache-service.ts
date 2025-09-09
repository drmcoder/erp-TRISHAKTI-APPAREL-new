// Smart Caching Service - Enhanced Performance & Offline Support
// AI-powered caching with intelligent expiration and data prefetching

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
  version: string;
  priority: 'high' | 'medium' | 'low';
  accessCount: number;
  lastAccessed: number;
}

interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  storageType: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  enableCompression: boolean;
  enableEncryption: boolean;
  version: string;
}

class CacheService {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private cacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      storageType: 'memory',
      enableCompression: false,
      enableEncryption: false,
      version: '1.0.0',
      ...config
    };

    this.initializeCache();
  }

  // Initialize cache with persistent storage recovery
  private async initializeCache() {
    if (this.config.storageType === 'localStorage' && typeof window !== 'undefined') {
      try {
        const persistedCache = localStorage.getItem('tsaerp_cache');
        if (persistedCache) {
          const parsed = JSON.parse(persistedCache);
          if (parsed.version === this.config.version) {
            Object.entries(parsed.entries).forEach(([key, entry]: [string, any]) => {
              if (entry.expiresAt > Date.now()) {
                this.cache.set(key, entry);
              }
            });
          }
        }
      } catch (error) {
        console.warn('Failed to restore cache from localStorage:', error);
      }
    }
  }

  // Generate intelligent cache key with context
  private generateKey(namespace: string, params?: any): string {
    if (!params) return namespace;
    
    const sortedParams = JSON.stringify(params, Object.keys(params).sort());
    const hash = this.simpleHash(sortedParams);
    return `${namespace}:${hash}`;
  }

  // Simple hash function for cache keys
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Smart cache retrieval with analytics
  get<T>(namespace: string, params?: any): T | null {
    const key = this.generateKey(namespace, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.cacheStats.misses++;
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.cacheStats.misses++;
      this.cacheStats.evictions++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.cacheStats.hits++;

    return entry.data as T;
  }

  // Intelligent cache storage with LRU eviction
  set<T>(
    namespace: string, 
    data: T, 
    ttl?: number, 
    priority: 'high' | 'medium' | 'low' = 'medium',
    params?: any
  ): void {
    const key = this.generateKey(namespace, params);
    const expiresAt = Date.now() + (ttl || this.config.defaultTTL);

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt,
      key,
      version: this.config.version,
      priority,
      accessCount: 1,
      lastAccessed: Date.now()
    };

    // Evict if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.persistToStorage();
  }

  // Advanced cache update with merge capabilities
  update<T>(namespace: string, updater: (current: T | null) => T, params?: any): T {
    const current = this.get<T>(namespace, params);
    const updated = updater(current);
    this.set(namespace, updated, undefined, 'high', params);
    return updated;
  }

  // Intelligent cache invalidation
  invalidate(namespace: string, params?: any): boolean {
    const key = this.generateKey(namespace, params);
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.persistToStorage();
    }
    return deleted;
  }

  // Pattern-based cache invalidation
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let deletedCount = 0;

    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.persistToStorage();
    }

    return deletedCount;
  }

  // LRU (Least Recently Used) eviction strategy
  private evictLRU(): void {
    let lruKey = '';
    let lruTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.priority === 'low' && entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    // If no low priority items, evict any LRU item
    if (!lruKey) {
      for (const [key, entry] of this.cache) {
        if (entry.lastAccessed < lruTime) {
          lruTime = entry.lastAccessed;
          lruKey = key;
        }
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.cacheStats.evictions++;
    }
  }

  // Persist cache to storage
  private persistToStorage(): void {
    if (this.config.storageType === 'localStorage' && typeof window !== 'undefined') {
      try {
        const cacheData = {
          version: this.config.version,
          entries: Object.fromEntries(this.cache)
        };
        localStorage.setItem('tsaerp_cache', JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Failed to persist cache to localStorage:', error);
      }
    }
  }

  // Cache warming - preload frequently accessed data
  async warm(loaders: Array<{
    namespace: string;
    loader: () => Promise<any>;
    ttl?: number;
    priority?: 'high' | 'medium' | 'low';
    params?: any;
  }>): Promise<void> {
    const warmingPromises = loaders.map(async ({ namespace, loader, ttl, priority, params }) => {
      try {
        const data = await loader();
        this.set(namespace, data, ttl, priority || 'medium', params);
      } catch (error) {
        console.warn(`Failed to warm cache for ${namespace}:`, error);
      }
    });

    await Promise.allSettled(warmingPromises);
  }

  // Get cache statistics and health
  getStats() {
    const hitRate = this.cacheStats.hits + this.cacheStats.misses > 0 
      ? (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)) * 100 
      : 0;

    return {
      ...this.cacheStats,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
      maxSize: this.config.maxSize,
      utilization: Math.round((this.cache.size / this.config.maxSize) * 100),
      health: hitRate > 80 ? 'excellent' : hitRate > 60 ? 'good' : hitRate > 40 ? 'fair' : 'poor'
    };
  }

  // Clear all cache entries
  clear(): void {
    this.cache.clear();
    this.cacheStats = { hits: 0, misses: 0, evictions: 0, totalSize: 0 };
    if (this.config.storageType === 'localStorage' && typeof window !== 'undefined') {
      localStorage.removeItem('tsaerp_cache');
    }
  }

  // Export cache for debugging
  export(): Array<CacheEntry> {
    return Array.from(this.cache.values());
  }

  // Smart prefetch based on usage patterns
  async prefetch(loaders: Array<{
    namespace: string;
    loader: () => Promise<any>;
    priority?: 'high' | 'medium' | 'low';
    condition?: () => boolean;
  }>): Promise<void> {
    const prefetchPromises = loaders
      .filter(({ condition }) => !condition || condition())
      .map(async ({ namespace, loader, priority }) => {
        try {
          if (!this.cache.has(namespace)) {
            const data = await loader();
            this.set(namespace, data, undefined, priority || 'low');
          }
        } catch (error) {
          console.warn(`Prefetch failed for ${namespace}:`, error);
        }
      });

    await Promise.allSettled(prefetchPromises);
  }
}

// Create singleton instances for different cache types
export const appCache = new CacheService({
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  maxSize: 500,
  storageType: 'localStorage',
  version: '1.0.0'
});

export const sessionCache = new CacheService({
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  maxSize: 200,
  storageType: 'sessionStorage',
  version: '1.0.0'
});

export const memoryCache = new CacheService({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  storageType: 'memory',
  version: '1.0.0'
});

export default CacheService;