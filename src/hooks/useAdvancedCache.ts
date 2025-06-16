
import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  accessCount: number;
  lastAccessed: number;
}

interface AdvancedCacheOptions {
  ttl?: number;
  persist?: boolean;
  key?: string;
  maxSize?: number;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  autoCleanup?: boolean;
  cleanupInterval?: number;
}

export function useAdvancedCache<T>(
  defaultData: T,
  options: AdvancedCacheOptions = {}
) {
  const {
    ttl = 5 * 60 * 1000,
    persist = false,
    key = 'advanced_cache',
    maxSize = 100,
    tags = [],
    priority = 'medium',
    autoCleanup = true,
    cleanupInterval = 2 * 60 * 1000 // 2 minutes
  } = options;

  const cacheRef = useRef<Map<string, CacheItem<any>>>(new Map());
  const [persistentCache, setPersistentCache] = useLocalStorage<Record<string, CacheItem<any>>>(
    `app_cache_${key}`,
    {}
  );

  const [data, setData] = useState<T>(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0
  });

  // Cleanup expired entries
  const cleanup = useCallback(() => {
    const now = Date.now();
    let cleaned = 0;

    if (persist) {
      const newCache = { ...persistentCache };
      Object.keys(newCache).forEach(cacheKey => {
        const item = newCache[cacheKey];
        if (item && now > item.expiry) {
          delete newCache[cacheKey];
          cleaned++;
        }
      });
      if (cleaned > 0) {
        setPersistentCache(newCache);
      }
    } else {
      Array.from(cacheRef.current.keys()).forEach(cacheKey => {
        const item = cacheRef.current.get(cacheKey);
        if (item && now > item.expiry) {
          cacheRef.current.delete(cacheKey);
          cleaned++;
        }
      });
    }

    if (cleaned > 0) {
      setStats(prev => ({
        ...prev,
        evictions: prev.evictions + cleaned,
        totalSize: prev.totalSize - cleaned
      }));
    }
  }, [persist, persistentCache, setPersistentCache]);

  // LRU eviction when cache is full
  const evictLRU = useCallback(() => {
    if (!persist) {
      let oldestKey = '';
      let oldestTime = Date.now();

      Array.from(cacheRef.current.entries()).forEach(([cacheKey, item]) => {
        if (item.lastAccessed < oldestTime && item.priority !== 'high') {
          oldestTime = item.lastAccessed;
          oldestKey = cacheKey;
        }
      });

      if (oldestKey) {
        cacheRef.current.delete(oldestKey);
        setStats(prev => ({
          ...prev,
          evictions: prev.evictions + 1,
          totalSize: prev.totalSize - 1
        }));
      }
    }
  }, [persist]);

  // Get data from cache
  const get = useCallback((cacheKey: string): T | null => {
    let item: CacheItem<any> | null = null;

    if (persist) {
      item = persistentCache[cacheKey] || null;
    } else {
      item = cacheRef.current.get(cacheKey) || null;
    }

    if (!item) {
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      remove(cacheKey);
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    // Update access statistics
    const updatedItem = {
      ...item,
      accessCount: item.accessCount + 1,
      lastAccessed: Date.now()
    };

    if (persist) {
      setPersistentCache(prev => ({
        ...prev,
        [cacheKey]: updatedItem
      }));
    } else {
      cacheRef.current.set(cacheKey, updatedItem);
    }

    setStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    return item.data;
  }, [persist, persistentCache, setPersistentCache]);

  // Set data in cache
  const set = useCallback((cacheKey: string, newData: T, customTags: string[] = []) => {
    const now = Date.now();
    const item: CacheItem<T> = {
      data: newData,
      timestamp: now,
      expiry: now + ttl,
      tags: [...tags, ...customTags],
      priority,
      accessCount: 1,
      lastAccessed: now
    };

    if (persist) {
      setPersistentCache(prev => ({
        ...prev,
        [cacheKey]: item
      }));
    } else {
      // Check if cache is full
      if (cacheRef.current.size >= maxSize) {
        evictLRU();
      }
      cacheRef.current.set(cacheKey, item);
    }

    setData(newData);
    setStats(prev => ({
      ...prev,
      totalSize: prev.totalSize + 1
    }));
  }, [ttl, tags, priority, persist, setPersistentCache, maxSize, evictLRU]);

  // Remove from cache
  const remove = useCallback((cacheKey: string) => {
    if (persist) {
      const newCache = { ...persistentCache };
      delete newCache[cacheKey];
      setPersistentCache(newCache);
    } else {
      cacheRef.current.delete(cacheKey);
    }
    setStats(prev => ({
      ...prev,
      totalSize: Math.max(0, prev.totalSize - 1)
    }));
  }, [persist, persistentCache, setPersistentCache]);

  // Invalidate by tags
  const invalidateByTags = useCallback((targetTags: string[]) => {
    let invalidated = 0;

    if (persist) {
      const newCache = { ...persistentCache };
      Object.keys(newCache).forEach(cacheKey => {
        const item = newCache[cacheKey];
        if (item && item.tags.some(tag => targetTags.includes(tag))) {
          delete newCache[cacheKey];
          invalidated++;
        }
      });
      if (invalidated > 0) {
        setPersistentCache(newCache);
      }
    } else {
      Array.from(cacheRef.current.entries()).forEach(([cacheKey, item]) => {
        if (item.tags.some(tag => targetTags.includes(tag))) {
          cacheRef.current.delete(cacheKey);
          invalidated++;
        }
      });
    }

    setStats(prev => ({
      ...prev,
      totalSize: Math.max(0, prev.totalSize - invalidated),
      evictions: prev.evictions + invalidated
    }));
  }, [persist, persistentCache, setPersistentCache]);

  // Fetch with cache
  const fetchWithCache = useCallback(async <K>(
    cacheKey: string,
    fetchFn: () => Promise<K>,
    forceRefresh = false,
    customTags: string[] = []
  ): Promise<K> => {
    if (!forceRefresh) {
      const cachedData = get(cacheKey);
      if (cachedData !== null) {
        setData(cachedData as T);
        return cachedData as K;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedData = await fetchFn();
      set(cacheKey, fetchedData as T, customTags);
      setLoading(false);
      return fetchedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      setLoading(false);
      throw err;
    }
  }, [get, set]);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const hitRate = stats.hits + stats.misses > 0 
      ? (stats.hits / (stats.hits + stats.misses)) * 100 
      : 0;

    return {
      ...stats,
      hitRate: Math.round(hitRate * 100) / 100,
      efficiency: hitRate > 80 ? 'excellent' : hitRate > 60 ? 'good' : 'poor'
    };
  }, [stats]);

  // Auto cleanup
  useEffect(() => {
    if (autoCleanup) {
      const interval = setInterval(cleanup, cleanupInterval);
      return () => clearInterval(interval);
    }
  }, [autoCleanup, cleanup, cleanupInterval]);

  return {
    data,
    loading,
    error,
    get,
    set,
    remove,
    invalidateByTags,
    fetchWithCache,
    cleanup,
    getCacheStats,
    stats: getCacheStats()
  };
}
