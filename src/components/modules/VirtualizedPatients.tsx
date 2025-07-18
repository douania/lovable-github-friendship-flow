
import React, { useState, useMemo } from 'react';
import { Search, User } from 'lucide-react';
import { Patient } from '../../types';
import { VirtualScrollList, useVirtualScrollPagination } from '../ui/VirtualScrollList';
import { useOptimizedPagination } from '../../hooks/useOptimizedPagination';
import { useCachedPatients } from '../../hooks/useCachedPatients';

const VirtualizedPatients: React.FC = () => {
  const { patients, loading } = useCachedPatients();
  const [searchTerm, setSearchTerm] = useState('');

  // Utiliser la pagination optimisée avec virtual scrolling
  const {
    performanceStats,
    debouncedSearchTerm
  } = useOptimizedPagination({
    data: patients,
    searchTerm,
    searchFields: ['firstName', 'lastName', 'email'],
    componentName: 'VirtualizedPatients',
    enableAdvancedCache: true,
    enablePreloading: true
  });

  // Filtrer les patients selon la recherche
  const filteredPatients = useMemo(() => {
    if (!debouncedSearchTerm) return patients;
    
    return patients.filter(patient =>
      patient.firstName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [patients, debouncedSearchTerm]);

  // Hook pour la pagination virtuelle
  const {
    loading: loadingMore,
    hasMore,
    loadMore
  } = useVirtualScrollPagination(
    filteredPatients,
    async (page) => {
      // Simulation du chargement de plus de patients
      await new Promise(resolve => setTimeout(resolve, 500));
      return filteredPatients.slice((page - 1) * 50, page * 50);
    },
    50
  );

  // Rendu d'un patient dans la liste virtuelle
  const renderPatient = (patient: Patient) => (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
        {patient.firstName[0]}{patient.lastName[0]}
      </div>
      
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">
          {patient.firstName} {patient.lastName}
        </h3>
        <p className="text-sm text-gray-500">{patient.email}</p>
        <p className="text-xs text-gray-400">
          Âge: {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} ans
        </p>
      </div>
      
      <div className="text-right">
        <p className="text-sm text-gray-500">{patient.phone}</p>
        {patient.lastVisit && (
          <p className="text-xs text-gray-400">
            Dernière visite: {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Patients (Virtual Scroll)</h1>
            <p className="text-gray-600">Liste virtualisée optimisée pour de grandes quantités de données</p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Statistiques de performance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-blue-900">{filteredPatients.length}</div>
            <div className="text-sm text-blue-700">Patients total</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-green-900">
              {performanceStats.isSearching ? 'En cours...' : 'Prêt'}
            </div>
            <div className="text-sm text-green-700">État recherche</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-purple-900">
              {performanceStats.cacheStats?.hitRate.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-purple-700">Cache hit rate</div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-orange-900">
              {performanceStats.preloadedPagesCount}
            </div>
            <div className="text-sm text-orange-700">Pages préchargées</div>
          </div>
        </div>
      </div>

      {/* Liste virtualisée */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Liste des patients ({filteredPatients.length})
          </h2>
        </div>
        
        <VirtualScrollList
          items={filteredPatients}
          itemHeight={80}
          containerHeight={600}
          renderItem={renderPatient}
          overscan={5}
          loading={loading || loadingMore}
          onEndReached={hasMore ? loadMore : undefined}
          endReachedThreshold={0.8}
          loadingComponent={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mr-3"></div>
              <span>Chargement des patients...</span>
            </div>
          }
          emptyComponent={
            <div className="flex flex-col items-center justify-center p-12">
              <User className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun patient trouvé</h3>
              <p className="text-gray-500">Modifiez votre recherche ou ajoutez des patients.</p>
            </div>
          }
          className="rounded-b-lg"
        />
      </div>
    </div>
  );
};

export default VirtualizedPatients;
