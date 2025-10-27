import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, Layers } from 'lucide-react';
import { Appareil, Zone, Soin, NavigationState } from '../../types';
import { AppareilCard } from '../soins/AppareilCard';
import { ZoneCard } from '../soins/ZoneCard';
import { SoinCard } from '../soins/SoinCard';
import { SoinsBreadcrumb } from '../soins/SoinsBreadcrumb';
import SoinForm from '../forms/SoinForm';
import { soinService } from '../../services/soinService';
import { appareilService } from '../../services/appareilService';
import { useToast } from '../../hooks/use-toast';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'price' | 'duration' | 'created';

export default function SoinsCatalogHierarchical() {
  // Data states
  const [appareils, setAppareils] = useState<Appareil[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [soins, setSoins] = useState<Soin[]>([]);
  
  // Navigation state
  const [navigation, setNavigation] = useState<NavigationState>({
    level: 'appareils'
  });

  // UI states
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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [appareilsData, zonesData, soinsData] = await Promise.all([
        appareilService.getActive(),
        soinService.getZones(),
        soinService.getAllSoins()
      ]);
      
      setAppareils(appareilsData);
      setZones(zonesData);
      setSoins(soinsData);
      // Ajuster automatiquement la fourchette de prix pour couvrir toutes les valeurs
      const prices = (soinsData || []).map(s => s.prix);
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;
      setPriceRange([minPrice, maxPrice]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Erreur !",
        description: "Impossible de charger les données.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (level: NavigationState['level'], appareilId?: string, zoneId?: string) => {
    const selectedAppareil = appareilId ? appareils.find(a => a.id === appareilId) : undefined;
    const selectedZone = zoneId ? zones.find(z => z.id === zoneId) : undefined;

    setNavigation({
      level,
      selectedAppareilId: appareilId,
      selectedZoneId: zoneId,
      selectedAppareilName: selectedAppareil?.nom,
      selectedZoneName: selectedZone?.nom
    });
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
      loadData();
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
        loadData();
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

  // Get filtered and sorted data based on current navigation level
  const getDisplayData = () => {
    let filteredSoins = soins;

    // Apply search filter first - search is global across all soins
    if (searchTerm) {
      filteredSoins = filteredSoins.filter(soin =>
        soin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        soin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (soin.appareil?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (soin.zone?.nom || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      // Only apply navigation filters when there's no search term
      if (navigation.selectedAppareilId) {
        filteredSoins = filteredSoins.filter(s => s.appareilId === navigation.selectedAppareilId);
      }
      if (navigation.selectedZoneId) {
        filteredSoins = filteredSoins.filter(s => s.zoneId === navigation.selectedZoneId);
      }
    }

    // Apply price filter
    filteredSoins = filteredSoins.filter(soin =>
      soin.prix >= priceRange[0] && soin.prix <= priceRange[1]
    );

    // Apply sorting
    filteredSoins.sort((a, b) => {
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

    return filteredSoins;
  };

  // Statistics helpers
  const getSoinsCountByAppareil = (appareilId: string) => {
    return soins.filter(s => s.appareilId === appareilId).length;
  };

  const getZonesCountByAppareil = (appareilId: string) => {
    const soinsByAppareil = soins.filter(s => s.appareilId === appareilId);
    const uniqueZones = new Set(soinsByAppareil.map(s => s.zoneId));
    return uniqueZones.size;
  };

  const getSoinsCountByZone = (zoneId: string, appareilId?: string) => {
    return soins.filter(s => 
      s.zoneId === zoneId && 
      (!appareilId || s.appareilId === appareilId)
    ).length;
  };

  const getPriceRangeByZone = (zoneId: string, appareilId?: string) => {
    const zoneSoins = soins.filter(s => 
      s.zoneId === zoneId && 
      (!appareilId || s.appareilId === appareilId)
    );
    
    if (zoneSoins.length === 0) return undefined;
    
    const prices = zoneSoins.map(s => s.prix);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const displayData = getDisplayData();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Guide d'aide contextuel */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Comment utiliser le catalogue de soins ?</h3>
            <p className="text-sm text-blue-800">
              {navigation.level === 'appareils' && '1️⃣ Cliquez sur un appareil pour voir ses zones de traitement'}
              {navigation.level === 'zones' && '2️⃣ Sélectionnez une zone pour découvrir les soins disponibles'}
              {navigation.level === 'soins' && '3️⃣ Gérez vos soins : consultez, modifiez ou supprimez-les'}
              {navigation.level === 'all' && '🔍 Vue complète : tous vos soins en un seul endroit avec recherche et filtres'}
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1">
          <SoinsBreadcrumb navigation={navigation} onNavigate={handleNavigate} />
        </div>

        <div className="flex items-center gap-3">
          {navigation.level !== 'all' && soins.length > 0 && (
            <button
              onClick={() => handleNavigate('all')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg transition-all text-sm font-medium"
              title="Voir tous les soins de tous les appareils"
            >
              <Layers className="w-4 h-4" />
              Voir tous les soins
            </button>
          )}
          
          <button
            onClick={openSoinForm}
            className="btn-primary flex items-center gap-2 shadow-lg"
          >
            <Plus size={18} />
            <span>Nouveau Soin</span>
          </button>
        </div>
      </div>

      {/* Search and filters - Only show for soins view */}
      {(navigation.level === 'soins' || navigation.level === 'all') && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative group flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher un soin..."
              className="input-elegant pl-10 pr-4 w-full transition-all duration-300 group-hover:shadow-elegant-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary" size={18} />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all duration-300 ${
              showFilters 
                ? 'bg-primary-light border-primary text-primary shadow-elegant-sm' 
                : 'border-border hover:bg-muted hover:border-primary/30'
            }`}
          >
            <Filter size={18} />
            <span className="font-medium">Filtres</span>
          </button>

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
            <option value="duration">Trier par durée</option>
            <option value="created">Plus récents</option>
          </select>
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (navigation.level === 'soins' || navigation.level === 'all') && (
        <div className="card-elegant p-6 space-y-4 animate-scale-in border-l-4 border-l-primary">
          <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
            <Filter size={20} className="text-primary" />
            Filtres avancés
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fourchette de prix (FCFA)
              </label>
              <div className="flex items-center gap-3">
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

      {/* Content based on navigation level */}
      {navigation.level === 'appareils' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appareils.map(appareil => (
            <AppareilCard
              key={appareil.id}
              appareil={appareil}
              soinsCount={getSoinsCountByAppareil(appareil.id)}
              zonesCount={getZonesCountByAppareil(appareil.id)}
              onClick={() => handleNavigate('zones', appareil.id)}
            />
          ))}
        </div>
      )}

      {navigation.level === 'zones' && navigation.selectedAppareilId && (
        <>
          <div className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">
              {zones.filter(z => getSoinsCountByZone(z.id, navigation.selectedAppareilId) > 0).length}
            </span> zone(s) disponible(s)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones
              .filter(zone => getSoinsCountByZone(zone.id, navigation.selectedAppareilId) > 0)
              .map(zone => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  soinsCount={getSoinsCountByZone(zone.id, navigation.selectedAppareilId)}
                  priceRange={getPriceRangeByZone(zone.id, navigation.selectedAppareilId)}
                  onClick={() => handleNavigate('soins', navigation.selectedAppareilId, zone.id)}
                />
              ))}
          </div>
        </>
      )}

      {(navigation.level === 'soins' || navigation.level === 'all') && (
        <>
          <div className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">{displayData.length}</span> soin(s) trouvé(s)
          </div>
          
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {displayData.map(soin => (
              <SoinCard
                key={soin.id}
                soin={soin}
                viewMode={viewMode}
                showAppareilZone={navigation.level === 'all'}
                onEdit={handleEditSoin}
                onDelete={handleDeleteSoin}
              />
            ))}
          </div>

          {displayData.length === 0 && (
            <div className="text-center py-16 card-elegant animate-fade-in">
              <div className="mb-6 flex justify-center">
                <div className="p-6 bg-primary-light rounded-full">
                  <Search size={48} className="text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Aucun soin trouvé</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {soins.length === 0 ? 
                  "Aucun soin n'est disponible. Créez votre premier soin pour commencer." :
                  "Aucun soin ne correspond aux critères de filtrage. Essayez de modifier vos filtres."
                }
              </p>
              {soins.length === 0 && (
                <button onClick={openSoinForm} className="btn-primary">
                  Créer le premier soin
                </button>
              )}
            </div>
          )}
        </>
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
