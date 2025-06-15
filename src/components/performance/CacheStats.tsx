
import React, { useState, useEffect } from 'react';
import { Database, Trash2, RefreshCw, BarChart3 } from 'lucide-react';
import { useCache } from '../../hooks/useCache';

const CacheStats: React.FC = () => {
  const [stats, setStats] = useState({
    patients: { totalEntries: 0, expiredEntries: 0, memoryUsage: 0 },
    appointments: { totalEntries: 0, expiredEntries: 0, memoryUsage: 0 },
    inventory: { totalEntries: 0, expiredEntries: 0, memoryUsage: 0 }
  });

  const patientsCache = useCache([], { persist: true, key: 'patients' });
  const appointmentsCache = useCache([], { persist: false, key: 'appointments' });
  const inventoryCache = useCache([], { persist: true, key: 'inventory' });

  const refreshStats = () => {
    setStats({
      patients: patientsCache.getStats(),
      appointments: appointmentsCache.getStats(),
      inventory: inventoryCache.getStats()
    });
  };

  const clearAllCaches = () => {
    patientsCache.clear();
    appointmentsCache.clear();
    inventoryCache.clear();
    refreshStats();
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalMemoryUsage = Object.values(stats).reduce((sum, stat) => sum + stat.memoryUsage, 0);
  const totalEntries = Object.values(stats).reduce((sum, stat) => sum + stat.totalEntries, 0);
  const totalExpired = Object.values(stats).reduce((sum, stat) => sum + stat.expiredEntries, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Statistiques du Cache</h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={refreshStats}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button
            onClick={clearAllCaches}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            title="Vider le cache"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Entrées totales</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{totalEntries}</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Expirées</span>
          </div>
          <p className="text-2xl font-bold text-orange-900 mt-1">{totalExpired}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Mémoire utilisée</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">{formatBytes(totalMemoryUsage)}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Efficacité</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {totalEntries > 0 ? Math.round(((totalEntries - totalExpired) / totalEntries) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Détails par cache */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Détails par module</h4>
        
        {Object.entries(stats).map(([key, stat]) => (
          <div key={key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900 capitalize">{key}</h5>
              <span className="text-sm text-gray-500">{formatBytes(stat.memoryUsage)}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Entrées: </span>
                <span className="font-medium">{stat.totalEntries}</span>
              </div>
              <div>
                <span className="text-gray-600">Expirées: </span>
                <span className="font-medium text-orange-600">{stat.expiredEntries}</span>
              </div>
              <div>
                <span className="text-gray-600">Valides: </span>
                <span className="font-medium text-green-600">
                  {stat.totalEntries - stat.expiredEntries}
                </span>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: stat.totalEntries > 0 
                      ? `${((stat.totalEntries - stat.expiredEntries) / stat.totalEntries) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CacheStats;
