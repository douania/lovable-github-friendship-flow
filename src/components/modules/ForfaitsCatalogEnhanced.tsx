import { useState, useEffect } from 'react';
import { Plus, Search, Grid, List, Package } from 'lucide-react';
import { Forfait, ForfaitCategorie, ForfaitBadge } from '../../types';
import { ForfaitCard } from '../forfaits/ForfaitCard';
import { ForfaitFilters } from '../forfaits/ForfaitFilters';
import ForfaitForm from '../forms/ForfaitForm';
import { soinService } from '../../services/soinService';
import { useToast } from '../../hooks/use-toast';

interface ForfaitsCatalogProps {
  onForfaitSelect: (forfait: Forfait) => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'price' | 'popularity' | 'created';

export default function ForfaitsCatalog({ onForfaitSelect }: ForfaitsCatalogProps) {
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [isForfaitFormOpen, setIsForfaitFormOpen] = useState(false);
  const [selectedForfait, setSelectedForfait] = useState<Forfait | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedCategorie, setSelectedCategorie] = useState<ForfaitCategorie | 'all'>('all');
  const [selectedBadges, setSelectedBadges] = useState<ForfaitBadge[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  
  // View options
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');

  const { toast } = useToast();

  useEffect(() => {
    loadForfaits();
  }, []);

  const loadForfaits = async () => {
    try {
      setIsLoading(true);
      const data = await soinService.getAllForfaits();
      setForfaits(data);
    } catch (error: any) {
      console.error('Error loading forfaits:', error);
      toast({
        title: "Erreur !",
        description: "Impossible de charger les forfaits.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredAndSortedForfaits = () => {
    let filtered = forfaits.filter(forfait => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        forfait.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forfait.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategorie = selectedCategorie === 'all' || forfait.categorie === selectedCategorie;
      
      // Badges filter
      const matchesBadges = selectedBadges.length === 0 || 
        (forfait.badges && selectedBadges.some(badge => forfait.badges?.includes(badge)));
      
      // Price filter
      const matchesPrice = forfait.prixReduit >= priceRange[0] && forfait.prixReduit <= priceRange[1];
      
      // Active only
      const isActive = forfait.isActive;
      
      return matchesSearch && matchesCategorie && matchesBadges && matchesPrice && isActive;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.prixReduit - b.prixReduit;
        case 'popularity':
          // Sort by badges priority (bestseller > promo > nouveau > limite)
          const priorityA = a.badges?.includes('bestseller') ? 4 : 
                           a.badges?.includes('promo') ? 3 : 
                           a.badges?.includes('nouveau') ? 2 : 
                           a.badges?.includes('limite') ? 1 : 0;
          const priorityB = b.badges?.includes('bestseller') ? 4 : 
                           b.badges?.includes('promo') ? 3 : 
                           b.badges?.includes('nouveau') ? 2 : 
                           b.badges?.includes('limite') ? 1 : 0;
          return priorityB - priorityA;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return a.nom.localeCompare(b.nom);
      }
    });

    return filtered;
  };

  const handleSaveForfait = async (forfaitData: Omit<Forfait, 'id' | 'createdAt'>) => {
    try {
      if (selectedForfait) {
        await soinService.updateForfait(selectedForfait.id, forfaitData);
        toast({
          title: "Forfait mis à jour !",
          description: "Le forfait a été mis à jour avec succès.",
        });
      } else {
        await soinService.createForfait(forfaitData);
        toast({
          title: "Forfait créé !",
          description: "Le forfait a été créé avec succès.",
        });
      }
      loadForfaits();
      closeForfaitForm();
    } catch (error: any) {
      toast({
        title: "Erreur !",
        description: "Une erreur est survenue lors de l'enregistrement du forfait.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteForfait = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce forfait ?')) {
      try {
        await soinService.deleteForfait(id);
        loadForfaits();
        toast({
          title: "Forfait supprimé !",
          description: "Le forfait a été supprimé avec succès.",
        });
      } catch (error: any) {
        toast({
          title: "Erreur !",
          description: "Une erreur est survenue lors de la suppression du forfait.",
          variant: "destructive",
        });
      }
    }
  };

  const openForfaitForm = () => {
    setSelectedForfait(null);
    setIsForfaitFormOpen(true);
  };

  const closeForfaitForm = () => {
    setIsForfaitFormOpen(false);
    setSelectedForfait(null);
  };

  const handleEditForfait = (forfait: Forfait) => {
    setSelectedForfait(forfait);
    setIsForfaitFormOpen(true);
  };

  const resetFilters = () => {
    setSelectedCategorie('all');
    setSelectedBadges([]);
    setPriceRange([0, 1000000]);
    setSearchTerm('');
  };

  const filteredForfaits = getFilteredAndSortedForfaits();

  // Group by category for display
  const getCategorieLabel = (cat: ForfaitCategorie) => {
    switch (cat) {
      case 'decouverte': return 'Packages Découverte';
      case 'premium': return 'Packages Premium';
      case 'zone': return 'Packages par Zone';
      case 'saisonnier': return 'Packages Saisonniers';
      default: return 'Autres Packages';
    }
  };

  const groupedByCategorie = selectedCategorie === 'all' 
    ? (['decouverte', 'premium', 'zone', 'saisonnier', 'autre'] as ForfaitCategorie[])
        .map(cat => ({
          categorie: cat,
          label: getCategorieLabel(cat),
          forfaits: filteredForfaits.filter(f => (f.categorie || 'autre') === cat)
        }))
        .filter(group => group.forfaits.length > 0)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des forfaits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative group flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher un forfait..."
              className="input-elegant pl-10 pr-4 w-full transition-all duration-300 group-hover:shadow-elegant-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary" size={18} />
          </div>
        </div>

        <button
          onClick={openForfaitForm}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Nouveau Forfait</span>
        </button>
      </div>

      {/* Filters and View Options */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <ForfaitFilters
          selectedCategorie={selectedCategorie}
          selectedBadges={selectedBadges}
          priceRange={priceRange}
          onCategorieChange={setSelectedCategorie}
          onBadgesChange={setSelectedBadges}
          onPriceRangeChange={setPriceRange}
          onReset={resetFilters}
        />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-card shadow-elegant-sm">
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
            <option value="popularity">Plus populaires</option>
            <option value="created">Plus récents</option>
          </select>
        </div>
      </div>

      {/* Results summary */}
      <div className="text-sm text-muted-foreground">
        <span className="text-primary font-semibold">{filteredForfaits.length}</span> forfait(s) trouvé(s)
      </div>

      {/* Forfaits Display */}
      {groupedByCategorie ? (
        // Grouped by category
        <div className="space-y-8">
          {groupedByCategorie.map(group => (
            <div key={group.categorie}>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                {group.label}
                <span className="text-sm font-normal text-muted-foreground">
                  ({group.forfaits.length})
                </span>
              </h2>
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {group.forfaits.map(forfait => (
                  <ForfaitCard
                    key={forfait.id}
                    forfait={forfait}
                    onSelect={onForfaitSelect}
                    onEdit={handleEditForfait}
                    onDelete={handleDeleteForfait}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Simple list
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredForfaits.map(forfait => (
            <ForfaitCard
              key={forfait.id}
              forfait={forfait}
              onSelect={onForfaitSelect}
              onEdit={handleEditForfait}
              onDelete={handleDeleteForfait}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredForfaits.length === 0 && !isLoading && (
        <div className="text-center py-16 card-elegant animate-fade-in">
          <div className="mb-6 flex justify-center">
            <div className="p-6 bg-primary-light rounded-full">
              <Search size={48} className="text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Aucun forfait trouvé</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {forfaits.length === 0 ? 
              "Aucun forfait n'est disponible. Créez votre premier forfait pour commencer." :
              "Aucun forfait ne correspond aux critères de filtrage. Essayez de modifier vos filtres."
            }
          </p>
          {forfaits.length === 0 && (
            <button onClick={openForfaitForm} className="btn-primary">
              Créer le premier forfait
            </button>
          )}
        </div>
      )}

      {isForfaitFormOpen && (
        <ForfaitForm
          forfait={selectedForfait || undefined}
          onSave={handleSaveForfait}
          onCancel={closeForfaitForm}
        />
      )}
    </div>
  );
}
