
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ShoppingBag, Tag, Calendar, TrendingUp } from 'lucide-react';
import { Forfait } from '../../types';
import ForfaitForm from '../forms/ForfaitForm';
import { soinService } from '../../services/soinService';
import { useToast } from '../../hooks/use-toast';

interface ForfaitsCatalogProps {
  onForfaitSelect: (forfait: Forfait) => void;
}

export default function ForfaitsCatalog({ onForfaitSelect }: ForfaitsCatalogProps) {
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [filteredForfaits, setFilteredForfaits] = useState<Forfait[]>([]);
  const [isForfaitFormOpen, setIsForfaitFormOpen] = useState(false);
  const [selectedForfait, setSelectedForfait] = useState<Forfait | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadForfaits();
  }, []);

  useEffect(() => {
    filterForfaits();
  }, [forfaits, searchTerm]);

  const loadForfaits = async () => {
    try {
      const data = await soinService.getAllForfaits();
      setForfaits(data);
    } catch (error: any) {
      toast({
        title: "Erreur !",
        description: "Impossible de charger les forfaits.",
        variant: "destructive",
      });
    }
  };

  const filterForfaits = () => {
    const filtered = forfaits.filter((forfait) => 
      forfait.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      forfait.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredForfaits(filtered);
  };

  const handleSaveForfait = async (forfaitData: Omit<Forfait, 'id' | 'created_at'>) => {
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

  const calculateSavings = (forfait: Forfait) => {
    if (forfait.prixTotal > forfait.prixReduit) {
      const savings = forfait.prixTotal - forfait.prixReduit;
      const percentage = Math.round((savings / forfait.prixTotal) * 100);
      return { savings, percentage };
    }
    return { savings: 0, percentage: 0 };
  };

  return (
    <div className="space-y-6">
      {/* Header with search and actions */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un forfait..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>

        <button
          onClick={openForfaitForm}
          className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={18} />
          <span>Nouveau Forfait</span>
        </button>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{filteredForfaits.length} forfait(s) disponible(s)</span>
      </div>

      {/* Forfaits grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForfaits.map((forfait) => {
          const { savings, percentage } = calculateSavings(forfait);
          
          return (
            <div key={forfait.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
              {/* Header with discount badge */}
              <div className="relative p-6 pb-4">
                {percentage > 0 && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      -{percentage}%
                    </div>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-800 mb-2 pr-16">{forfait.nom}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{forfait.description}</p>
              </div>

              {/* Content */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Tag size={14} />
                      <span>{forfait.nbSeances} séances</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{forfait.validiteMois} mois</span>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      {forfait.prixTotal > forfait.prixReduit && (
                        <div className="text-sm text-gray-500 line-through">
                          {forfait.prixTotal} €
                        </div>
                      )}
                      <div className="text-2xl font-bold text-pink-600">
                        {forfait.prixReduit} €
                      </div>
                    </div>
                    {savings > 0 && (
                      <div className="text-right">
                        <div className="text-sm text-green-600 font-medium">
                          Économie
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {savings} €
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onForfaitSelect(forfait)}
                      className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ajouter au panier"
                    >
                      <ShoppingBag size={16} />
                      <span className="text-sm">Sélectionner</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditForfait(forfait)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteForfait(forfait.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover: bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    forfait.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {forfait.isActive ? 'Disponible' : 'Indisponible'}
                  </span>
                  
                  {percentage > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-green-600">
                      <TrendingUp size={12} />
                      <span>Économie de {percentage}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredForfaits.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun forfait trouvé</h3>
          <p className="text-gray-500">Essayez de modifier votre recherche</p>
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
