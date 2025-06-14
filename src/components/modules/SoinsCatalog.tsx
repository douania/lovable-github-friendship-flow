import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Grid, List, Clock, Euro } from 'lucide-react';
import { Soin } from '../../types';
import SoinForm from '../forms/SoinForm';
import { soinService } from '../../services/soinService';
import { useToast } from '../../hooks/use-toast';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'price' | 'duration' | 'created';

export default function SoinsCatalog() {
  const [soins, setSoins] = useState<Soin[]>([]);
  const [filteredSoins, setFilteredSoins] = useState<Soin[]>([]);
  const [isSoinFormOpen, setIsSoinFormOpen] = useState(false);
  const [selectedSoin, setSelectedSoin] = useState<Soin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSoins();
  }, []);

  useEffect(() => {
    filterAndSortSoins();
  }, [soins, searchTerm, sortBy, priceRange]);

  const loadSoins = async () => {
    try {
      setIsLoading(true);
      console.log('Loading soins...');
      const data = await soinService.getAllSoins();
      console.log('Loaded soins:', data);
      setSoins(data);
    } catch (error: any) {
      console.error('Error loading soins:', error);
      toast({
        title: "Erreur !",
        description: "Impossible de charger les soins.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortSoins = () => {
    let filtered = soins.filter((soin) => {
      const matchesSearch = soin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           soin.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = soin.prix >= priceRange[0] && soin.prix <= priceRange[1];
      return matchesSearch && matchesPrice;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.prix - b.prix;
        case 'duration':
          return a.duree - b.duree;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return a.nom.localeCompare(b.nom);
      }
    });

    setFilteredSoins(filtered);
  };

  const handleSaveSoin = async (soinData: Omit<Soin, 'id'>) => {
    try {
      if (selectedSoin) {
        await soinService.updateSoin(selectedSoin.id, soinData);
        toast({
          title: "Soin mis à jour !",
          description: "Le soin a été mis à jour avec succès.",
        });
      } else {
        await soinService.createSoin(soinData);
        toast({
          title: "Soin créé !",
          description: "Le soin a été créé avec succès.",
        });
      }
      loadSoins();
      closeSoinForm();
    } catch (error: any) {
      toast({
        title: "Erreur !",
        description: "Une erreur est survenue lors de l'enregistrement du soin.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSoin = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce soin ?')) {
      try {
        await soinService.deleteSoin(id);
        loadSoins();
        toast({
          title: "Soin supprimé !",
          description: "Le soin a été supprimé avec succès.",
        });
      } catch (error: any) {
        toast({
          title: "Erreur !",
          description: "Une erreur est survenue lors de la suppression du soin.",
          variant: "destructive",
        });
      }
    }
  };

  const openSoinForm = () => {
    setSelectedSoin(null);
    setIsSoinFormOpen(true);
  };

  const closeSoinForm = () => {
    setIsSoinFormOpen(false);
    setSelectedSoin(null);
  };

  const handleEditSoin = (soin: Soin) => {
    setSelectedSoin(soin);
    setIsSoinFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des soins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <p><strong>Debug:</strong> {soins.length} soins chargés, {filteredSoins.length} après filtrage</p>
        </div>
      )}

      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un soin..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-pink-50 border-pink-300 text-pink-700' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            <span>Filtres</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List size={18} />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          >
            <option value="name">Trier par nom</option>
            <option value="price">Trier par prix</option>
            <option value="duration">Trier par durée</option>
            <option value="created">Plus récents</option>
          </select>

          <button
            onClick={openSoinForm}
            className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={18} />
            <span>Nouveau Soin</span>
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white p-4 border border-gray-200 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-800">Filtres avancés</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fourchette de prix (€)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="w-24 px-3 py-1 border border-gray-300 rounded"
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                  className="w-24 px-3 py-1 border border-gray-300 rounded"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{filteredSoins.length} soin(s) trouvé(s)</span>
      </div>

      {/* Soins grid/list */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        {filteredSoins.map((soin) => (
          <div
            key={soin.id}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${
              viewMode === 'list' ? 'flex items-center p-4' : 'overflow-hidden'
            }`}
          >
            {viewMode === 'grid' ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{soin.nom}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{soin.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{soin.duree} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Euro size={14} />
                    <span className="text-pink-600 font-semibold">{soin.prix} €</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSoin(soin)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteSoin(soin.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    soin.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {soin.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{soin.nom}</h3>
                  <p className="text-gray-600 text-sm mt-1">{soin.description}</p>
                </div>
                <div className="flex items-center space-x-6 ml-4">
                  <div className="text-sm text-gray-500">
                    <Clock size={14} className="inline mr-1" />
                    {soin.duree} min
                  </div>
                  <div className="text-pink-600 font-semibold">
                    {soin.prix} €
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSoin(soin)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteSoin(soin.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {filteredSoins.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun soin trouvé</h3>
          <p className="text-gray-500">
            {soins.length === 0 ? 
              "Aucun soin n'est disponible dans la base de données" :
              "Essayez de modifier vos critères de recherche"
            }
          </p>
          {soins.length === 0 && (
            <button
              onClick={openSoinForm}
              className="mt-4 bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg"
            >
              Créer le premier soin
            </button>
          )}
        </div>
      )}

      {isSoinFormOpen && (
        <SoinForm
          soin={selectedSoin || undefined}
          onSave={handleSaveSoin}
          onCancel={closeSoinForm}
        />
      )}
    </div>
  );
}
