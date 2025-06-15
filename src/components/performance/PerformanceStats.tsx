
import React, { useState, useEffect } from 'react';
import { Activity, Clock, Network, Gauge } from 'lucide-react';
import { usePerformanceMetrics } from '../../hooks/usePerformanceMetrics';

const PerformanceStats: React.FC = () => {
  const { getStats, clearOldMetrics } = usePerformanceMetrics();
  const [stats, setStats] = useState(getStats());

  const refreshStats = () => {
    setStats(getStats());
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Gauge className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Métriques de Performance</h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={refreshStats}
            className="p-2 text-gray-600 hover:text-green-600 transition-colors"
            title="Actualiser"
          >
            <Activity className="h-4 w-4" />
          </button>
          
          <button
            onClick={clearOldMetrics}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            title="Nettoyer les anciennes métriques"
          >
            <Clock className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Temps moyen</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {formatDuration(stats.performance.averageDuration)}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Opérations</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {stats.performance.totalMeasurements}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Requêtes réseau</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {stats.network.totalRequests}
          </p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Gauge className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Taux d'erreur</span>
          </div>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {stats.network.errorRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Détails des performances */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Détails des performances</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Performance des opérations */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Opérations</h5>
            
            {stats.performance.slowestOperation && (
              <div className="mb-2">
                <span className="text-sm text-gray-600">Plus lente: </span>
                <span className="font-medium text-red-600">
                  {stats.performance.slowestOperation.name} 
                  ({formatDuration(stats.performance.slowestOperation.duration || 0)})
                </span>
              </div>
            )}
            
            {stats.performance.fastestOperation && (
              <div className="mb-2">
                <span className="text-sm text-gray-600">Plus rapide: </span>
                <span className="font-medium text-green-600">
                  {stats.performance.fastestOperation.name} 
                  ({formatDuration(stats.performance.fastestOperation.duration || 0)})
                </span>
              </div>
            )}
          </div>

          {/* Performance réseau */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Réseau</h5>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Temps de réponse moyen: </span>
                <span className="font-medium">
                  {formatDuration(stats.network.averageResponseTime)}
                </span>
              </div>
              
              <div>
                <span className="text-gray-600">Données transférées: </span>
                <span className="font-medium">
                  {formatBytes(stats.network.totalDataTransferred)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance de la pagination */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Pagination</h5>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Composants: </span>
              <span className="font-medium">{stats.pagination.totalComponents}</span>
            </div>
            <div>
              <span className="text-gray-600">Temps de rendu moyen: </span>
              <span className="font-medium">
                {formatDuration(stats.pagination.averageRenderTime)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Éléments traités: </span>
              <span className="font-medium">{stats.pagination.totalItemsProcessed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceStats;
