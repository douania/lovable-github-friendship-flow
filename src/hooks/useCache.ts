
import { useState, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  persist?: boolean; // Whether to persist in localStorage
  key?: string; // Custom cache key
}

export function useCache<T>(
  defaultData: T,
  options: CacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, persist = false, key = 'cache' } = options;
  
  // In-memory cache
  const cacheRef = useRef<Map<string, CacheItem<any>>>(new Map());
  
  // Persistent cache for specific keys
  const [persistentCache, setPersistentCache] = useLocalStorage<Record<string, CacheItem<any>>>(
    `app_cache_${key}`,
    {}
  );

  const [data, setData] = useState<T>(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get data from cache
  const get = useCallback((cacheKey: string): T | null => {
    let item: CacheItem<any> | null = null;
    
    if (persist) {
      item = persistentCache[cacheKey] || null;
    } else {
      item = cacheRef.current.get(cacheKey) || null;
    }
    
    if (!item) return null;
    
    // Check if expired
    if (Date.now() > item.expiry) {
      if (persist) {
        const newCache = { ...persistentCache };
        delete newCache[cacheKey];
        setPersistentCache(newCache);
      } else {
        cacheRef.current.delete(cacheKey);
      }
      return null;
    }
    
    return item.data;
  }, [persist, persistentCache, setPersistentCache]);

  // Set data in cache
  const set = useCallback((cacheKey: string, newData: T) => {
    const item: CacheItem<T> = {
      data: newData,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };

    if (persist) {
      setPersistentCache(prev => ({
        ...prev,
        [cacheKey]: item
      }));
    } else {
      cacheRef.current.set(cacheKey, item);
    }
    
    setData(newData);
  }, [ttl, persist, setPersistentCache]);

  // Remove from cache
  const remove = useCallback((cacheKey: string) => {
    if (persist) {
      const newCache = { ...persistentCache };
      delete newCache[cacheKey];
      setPersistentCache(newCache);
    } else {
      cacheRef.current.delete(cacheKey);
    }
  }, [persist, persistentCache, setPersistentCache]);

  // Clear all cache
  const clear = useCallback(() => {
    if (persist) {
      setPersistentCache({});
    } else {
      cacheRef.current.clear();
    }
  }, [persist, setPersistentCache]);

  // Fetch data with cache
  const fetchWithCache = useCallback(async <K>(
    cacheKey: string,
    fetchFn: () => Promise<K>,
    forceRefresh = false
  ): Promise<K> => {
    // Check cache first
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
      set(cacheKey, fetchedData as T);
      setLoading(false);
      return fetchedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      setLoading(false);
      throw err;
    }
  }, [get, set]);

  // Invalidate cache entries matching pattern
  const invalidateByPattern = useCallback((pattern: RegExp) => {
    if (persist) {
      const newCache = { ...persistentCache };
      Object.keys(newCache).forEach(key => {
        if (pattern.test(key)) {
          delete newCache[key];
        }
      });
      setPersistentCache(newCache);
    } else {
      Array.from(cacheRef.current.keys()).forEach(key => {
        if (pattern.test(key)) {
          cacheRef.current.delete(key);
        }
      });
    }
  }, [persist, persistentCache, setPersistentCache]);

  // Check if data exists in cache
  const has = useCallback((cacheKey: string): boolean => {
    return get(cacheKey) !== null;
  }, [get]);

  // Get cache statistics
  const getStats = useCallback(() => {
    let cache: Record<string, CacheItem<any>>;
    
    if (persist) {
      cache = persistentCache;
    } else {
      cache = Object.fromEntries(cacheRef.current);
    }
    
    const keys = Object.keys(cache);
    const now = Date.now();
    
    return {
      totalEntries: keys.length,
      expiredEntries: keys.filter(key => {
        const item = cache[key];
        return item && now > item.expiry;
      }).length,
      hitRate: 0, // Could be calculated with additional tracking
      memoryUsage: JSON.stringify(cache).length // Rough estimate
    };
  }, [persist, persistentCache]);

  return {
    data,
    loading,
    error,
    get,
    set,
    remove,
    clear,
    fetchWithCache,
    invalidateByPattern,
    has,
    getStats
  };
}
