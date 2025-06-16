
import React, { useState } from 'react';
import { Activity, Database, Image, List, RefreshCw } from 'lucide-react';
import PerformanceStats from './PerformanceStats';
import CacheStats from './CacheStats';
import { useAdvancedCache } from '../../hooks/useAdvancedCache';

const PerformanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'performance' | 'cache' | 'virtual' | 'images'>('performance');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const globalCache = useAdvancedCache([], {
    persist: true,
    key: 'global_performance',
    tags: ['performance'],
    autoCleanup: true
  });

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    globalCache.cleanup();
  };

  const tabs = [
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'cache', label: 'Cache', icon: Database },
    { id: 'virtual', label: 'Virtual Scroll', icon: List },
    { id: 'images', label: 'Images', icon: Image }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Performance</h1>
          <p className="text-gray-600">Monitoring et optimisation de l'application</p>
        </div>
        
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-6">
        {activeTab === 'performance' && (
          <div key={refreshTrigger}>
            <PerformanceStats />
          </div>
        )}
        
        {activeTab === 'cache' && (
          <div key={refreshTrigger}>
            <CacheStats />
            
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques du Cache Global</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {globalCache.stats.hits}
                  </div>
                  <div className="text-sm text-blue-700">Cache Hits</div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-900">
                    {globalCache.stats.misses}
                  </div>
                  <div className="text-sm text-red-700">Cache Misses</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {globalCache.stats.hitRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-700">Taux de réussite</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {globalCache.stats.efficiency}
                  </div>
                  <div className="text-sm text-purple-700">Efficacité</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'virtual' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Virtual Scrolling</h3>
            <div className="text-gray-600">
              <p className="mb-4">
                Le virtual scrolling est activé pour optimiser l'affichage des grandes listes.
                Il permet de n'afficher que les éléments visibles, réduisant ainsi l'utilisation de la mémoire.
              </p>
              
              <div className="grid gri-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-900">1000+</div>
                  <div className="text-sm text-green-700">Éléments supportés</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-900">~10</div>
                  <div className="text-sm text-blue-700">Éléments rendus</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-900">95%</div>
                  <div className="text-sm text-purple-700">Réduction mémoire</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'images' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimisation des Images</h3>
            <div className="text-gray-600">
              <p className="mb-4">
                Les images sont automatiquement optimisées avec lazy loading, compression et mise en cache.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-green-900">Lazy Loading</div>
                  <div className="text-sm text-green-700">Activé</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-900">Compression</div>
                  <div className="text-sm text-blue-700">80% qualité</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-900">Cache TTL</div>
                  <div className="text-sm text-purple-700">30 minutes</div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-orange-900">Préchargement</div>
                  <div className="text-sm text-orange-700">Automatique</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
