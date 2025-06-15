
import { useState, useCallback, useRef, useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface NetworkMetric {
  url: string;
  method: string;
  duration: number;
  status: number;
  size?: number;
  timestamp: number;
}

interface PaginationMetric {
  component: string;
  totalItems: number;
  pageSize: number;
  currentPage: number;
  searchTerm?: string;
  renderTime: number;
  timestamp: number;
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetric[]>([]);
  const [paginationMetrics, setPaginationMetrics] = useState<PaginationMetric[]>([]);
  const activeMetrics = useRef<Map<string, PerformanceMetric>>(new Map());

  // Démarrer une mesure de performance
  const startMetric = useCallback((name: string, metadata?: Record<string, any>) => {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    };
    
    activeMetrics.current.set(name, metric);
    return metric;
  }, []);

  // Terminer une mesure de performance
  const endMetric = useCallback((name: string) => {
    const activeMetric = activeMetrics.current.get(name);
    if (activeMetric) {
      const endTime = performance.now();
      const completedMetric: PerformanceMetric = {
        ...activeMetric,
        endTime,
        duration: endTime - activeMetric.startTime
      };

      setMetrics(prev => [...prev.slice(-49), completedMetric]); // Garder les 50 dernières métriques
      activeMetrics.current.delete(name);
      
      return completedMetric;
    }
    return null;
  }, []);

  // Mesurer une fonction async
  const measureAsync = useCallback(async <T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    startMetric(name, metadata);
    try {
      const result = await fn();
      endMetric(name);
      return result;
    } catch (error) {
      endMetric(name);
      throw error;
    }
  }, [startMetric, endMetric]);

  // Enregistrer une métrique réseau
  const recordNetworkMetric = useCallback((metric: Omit<NetworkMetric, 'timestamp'>) => {
    const networkMetric = {
      ...metric,
      timestamp: Date.now()
    };
    
    setNetworkMetrics(prev => [...prev.slice(-99), networkMetric]); // Garder les 100 dernières
  }, []);

  // Enregistrer une métrique de pagination
  const recordPaginationMetric = useCallback((metric: Omit<PaginationMetric, 'timestamp'>) => {
    const paginationMetric = {
      ...metric,
      timestamp: Date.now()
    };
    
    setPaginationMetrics(prev => [...prev.slice(-49), paginationMetric]); // Garder les 50 dernières
  }, []);

  // Calculer les statistiques
  const getStats = useCallback(() => {
    const recentMetrics = metrics.filter(m => m.duration !== undefined);
    const recentNetwork = networkMetrics.filter(m => Date.now() - m.timestamp < 5 * 60 * 1000); // 5 minutes
    
    return {
      performance: {
        totalMeasurements: recentMetrics.length,
        averageDuration: recentMetrics.length > 0 
          ? recentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / recentMetrics.length 
          : 0,
        slowestOperation: recentMetrics.reduce((slowest, current) => 
          (current.duration || 0) > (slowest?.duration || 0) ? current : slowest
        , recentMetrics[0]),
        fastestOperation: recentMetrics.reduce((fastest, current) => 
          (current.duration || 0) < (fastest?.duration || 0) ? current : fastest
        , recentMetrics[0])
      },
      network: {
        totalRequests: recentNetwork.length,
        averageResponseTime: recentNetwork.length > 0
          ? recentNetwork.reduce((sum, m) => sum + m.duration, 0) / recentNetwork.length
          : 0,
        errorRate: recentNetwork.length > 0
          ? (recentNetwork.filter(m => m.status >= 400).length / recentNetwork.length) * 100
          : 0,
        totalDataTransferred: recentNetwork.reduce((sum, m) => sum + (m.size || 0), 0)
      },
      pagination: {
        totalComponents: new Set(paginationMetrics.map(m => m.component)).size,
        averageRenderTime: paginationMetrics.length > 0
          ? paginationMetrics.reduce((sum, m) => sum + m.renderTime, 0) / paginationMetrics.length
          : 0,
        totalItemsProcessed: paginationMetrics.reduce((sum, m) => sum + m.totalItems, 0)
      }
    };
  }, [metrics, networkMetrics, paginationMetrics]);

  // Nettoyer les anciennes métriques
  const clearOldMetrics = useCallback(() => {
    const cutoff = Date.now() - 10 * 60 * 1000; // 10 minutes
    
    setNetworkMetrics(prev => prev.filter(m => m.timestamp > cutoff));
    setPaginationMetrics(prev => prev.filter(m => m.timestamp > cutoff));
    setMetrics(prev => prev.slice(-25)); // Garder seulement les 25 dernières
  }, []);

  // Nettoyer automatiquement toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(clearOldMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clearOldMetrics]);

  return {
    startMetric,
    endMetric,
    measureAsync,
    recordNetworkMetric,
    recordPaginationMetric,
    getStats,
    clearOldMetrics,
    metrics,
    networkMetrics,
    paginationMetrics
  };
}
