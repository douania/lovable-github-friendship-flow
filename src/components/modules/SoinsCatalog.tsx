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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des soins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-warning-light border border-warning/20 rounded-lg p-4 text-sm">
          <p><strong>Debug:</strong> {soins.length} soins chargés, {filteredSoins.length} après filtrage</p>
        </div>
      )}

      {/* Header with actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <input
              type="text"
              placeholder="Rechercher un soin..."
              className="input-elegant pl-10 pr-4 w-80 transition-all duration-300 group-hover:shadow-elegant-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary" size={18} />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2.5 border rounded-lg transition-all duration-300 ${
              showFilters 
                ? 'bg-primary-light border-primary text-primary shadow-elegant-sm' 
                : 'border-border hover:bg-muted hover:border-primary/30'
            }`}
          >
            <Filter size={18} />
            <span className="font-medium">Filtres</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 border border-border rounded-lg p-1 bg-card shadow-elegant-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <List size={18} />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="input-elegant px-4 py-2.5 font-medium cursor-pointer hover:shadow-elegant-sm"
          >
            <option value="name">Trier par nom</option>
            <option value="price">Trier par prix</option>
            <option value="duration">Trier par durée</option>
            <option value="created">Plus récents</option>
          </select>

          <button
            onClick={openSoinForm}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Nouveau Soin</span>
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card-elegant p-6 space-y-4 animate-scale-in border-l-4 border-l-primary">
          <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
            <Filter size={20} className="text-primary" />
            Filtres avancés
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fourchette de prix (€)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="input-elegant w-28 text-center"
                  placeholder="Min"
                />
                <span className="text-muted-foreground font-medium">—</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                  className="input-elegant w-28 text-center"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          <span className="text-primary font-semibold">{filteredSoins.length}</span> soin(s) trouvé(s)
        </span>
      </div>

      {/* Soins grid/list */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        {filteredSoins.map((soin) => (
          <div
            key={soin.id}
            className={`group card-elegant hover:shadow-elegant-md hover:border-primary/20 ${
              viewMode === 'list' ? 'flex items-center p-5' : 'overflow-hidden'
            }`}
          >
            {viewMode === 'grid' ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {soin.nom}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                      {soin.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-5 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="p-1.5 bg-primary-light rounded-md">
                      <Clock size={14} className="text-primary" />
                    </div>
                    <span className="font-medium">{soin.duree} min</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-primary-light rounded-md">
                      <Euro size={14} className="text-primary" />
                    </div>
                    <span className="text-primary font-bold text-lg">{soin.prix} €</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSoin(soin)}
                      className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-all duration-200 hover:scale-110"
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteSoin(soin.id)}
                      className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <span className={`badge-elegant ${
                    soin.isActive 
                      ? 'bg-success-light text-success border border-success/20' 
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {soin.isActive ? '✓ Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {soin.nom}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
                    {soin.description}
                  </p>
                </div>
                <div className="flex items-center space-x-6 ml-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="p-1.5 bg-primary-light rounded-md">
                      <Clock size={14} className="text-primary" />
                    </div>
                    <span className="font-medium">{soin.duree} min</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-primary-light rounded-md">
                      <Euro size={14} className="text-primary" />
                    </div>
                    <span className="text-primary font-bold text-lg">{soin.prix} €</span>
                  </div>
                  <span className={`badge-elegant ${
                    soin.isActive 
                      ? 'bg-success-light text-success border border-success/20' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {soin.isActive ? '✓ Actif' : 'Inactif'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSoin(soin)}
                      className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-all duration-200"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteSoin(soin.id)}
                      className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
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
        <div className="text-center py-16 card-elegant animate-fade-in">
          <div className="mb-6 flex justify-center">
            <div className="p-6 bg-primary-light rounded-full">
              <Search size={48} className="text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Aucun soin trouvé</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {soins.length === 0 ? 
              "Aucun soin n'est disponible dans la base de données. Créez votre premier soin pour commencer." :
              "Essayez de modifier vos critères de recherche pour afficher plus de résultats."
            }
          </p>
          {soins.length === 0 && (
            <button
              onClick={openSoinForm}
              className="btn-primary"
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
