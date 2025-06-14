import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Eye, ShoppingBag } from 'lucide-react';
import { Soin, Forfait } from '../../types';
import SoinForm from '../forms/SoinForm';
import ForfaitForm from '../forms/ForfaitForm';
import { soinService } from '../../services/soinService';
import { useToast } from '../../hooks/useToast';

interface TreatmentCatalogProps {
  onForfaitSelect: (forfait: Forfait) => void;
}

export default function TreatmentCatalog({ onForfaitSelect }: TreatmentCatalogProps) {
  const [soins, setSoins] = useState<Soin[]>([]);
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [isSoinFormOpen, setIsSoinFormOpen] = useState(false);
  const [isForfaitFormOpen, setIsForfaitFormOpen] = useState(false);
  const [selectedSoin, setSelectedSoin] = useState<Soin | null>(null);
  const [selectedForfait, setSelectedForfait] = useState<Forfait | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const soinsData = await soinService.getAll();
      const forfaitsData = await soinService.getAllForfaits();
      setSoins(soinsData);
      setForfaits(forfaitsData);
    } catch (error: any) {
      toast({
        title: "Erreur !",
        description: "Impossible de charger les données.",
        variant: "destructive",
      })
      console.error('Error loading data:', error);
    }
  };

  const handleSaveSoin = async (soinData: Omit<Soin, 'id'>) => {
    try {
      if (selectedSoin) {
        // Update existing soin
        await soinService.update(selectedSoin.id, soinData);
        toast({
          title: "Soin mis à jour !",
          description: "Le soin a été mis à jour avec succès.",
        })
      } else {
        // Create new soin
        await soinService.create(soinData);
        toast({
          title: "Soin créé !",
          description: "Le soin a été créé avec succès.",
        })
      }
      loadData(); // Reload data to refresh the list
    } catch (error: any) {
      toast({
        title: "Erreur !",
        description: "Une erreur est survenue lors de l'enregistrement du soin.",
        variant: "destructive",
      })
      console.error('Error saving soin:', error);
    } finally {
      closeSoinForm();
    }
  };

  const handleDeleteSoin = async (id: string) => {
    try {
      await soinService.delete(id);
      loadData();
      toast({
        title: "Soin supprimé !",
        description: "Le soin a été supprimé avec succès.",
      })
    } catch (error: any) {
      toast({
        title: "Erreur !",
        description: "Une erreur est survenue lors de la suppression du soin.",
        variant: "destructive",
      })
      console.error('Error deleting soin:', error);
    }
  };

  const handleSaveForfait = async (forfaitData: Omit<Forfait, 'id' | 'created_at'>) => {
    try {
      if (selectedForfait) {
        // Update existing forfait
        await soinService.updateForfait(selectedForfait.id, forfaitData);
        toast({
          title: "Forfait mis à jour !",
          description: "Le forfait a été mis à jour avec succès.",
        })
      } else {
        // Create new forfait
        await soinService.createForfait(forfaitData);
        toast({
          title: "Forfait créé !",
          description: "Le forfait a été créé avec succès.",
        })
      }
      loadData(); // Reload data to refresh the list
    } catch (error: any) {
      toast({
        title: "Erreur !",
        description: "Une erreur est survenue lors de l'enregistrement du forfait.",
        variant: "destructive",
      })
      console.error('Error saving forfait:', error);
    } finally {
      closeForfaitForm();
    }
  };

  const handleDeleteForfait = async (id: string) => {
    try {
      await soinService.deleteForfait(id);
      loadData();
      toast({
        title: "Forfait supprimé !",
        description: "Le forfait a été supprimé avec succès.",
      })
    } catch (error: any) {
      toast({
        title: "Erreur !",
        description: "Une erreur est survenue lors de la suppression du forfait.",
        variant: "destructive",
      })
      console.error('Error deleting forfait:', error);
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

  const openForfaitForm = () => {
    setSelectedForfait(null);
    setIsForfaitFormOpen(true);
  };

  const closeForfaitForm = () => {
    setIsForfaitFormOpen(false);
    setSelectedForfait(null);
  };

  const handleEditSoin = (soin: Soin) => {
    setSelectedSoin(soin);
    setIsSoinFormOpen(true);
  };

  const handleEditForfait = (forfait: Forfait) => {
    setSelectedForfait(forfait);
    setIsForfaitFormOpen(true);
  };

  const filteredSoins = soins.filter((soin) => {
    const searchTermLower = searchTerm.toLowerCase();
    const soinNomLower = soin.nom.toLowerCase();
    return soinNomLower.includes(searchTermLower);
  });

  const filteredForfaits = forfaits.filter((forfait) => {
    const searchTermLower = searchTerm.toLowerCase();
    const forfaitNomLower = forfait.nom.toLowerCase();
    return forfaitNomLower.includes(searchTermLower);
  });
  
  return (
    <div className="p-6" style={{ backgroundColor: '#FDF6F3' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Catalogue des Soins et Forfaits</h1>
        <div className="space-x-4">
          <button onClick={openSoinForm} className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded flex items-center">
            <Plus className="mr-2" size={16} /> Nouveau Soin
          </button>
          <button onClick={openForfaitForm} className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded flex items-center">
            <Plus className="mr-2" size={16} /> Nouveau Forfait
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un soin ou un forfait..."
              className="px-4 py-2 border rounded-md w-full max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
          {/* <select
            className="px-4 py-2 border rounded-md"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select> */}
        </div>
        {/* <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded flex items-center">
          <Filter className="mr-2" size={16} /> Filtrer
        </button> */}
      </div>
      
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Soins</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSoins.map((soin) => (
          <div key={soin.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{soin.nom}</h3>
              <p className="text-gray-600 text-sm">{soin.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-pink-500 font-bold">{soin.prix} €</span>
                <div className="space-x-2">
                  <button onClick={() => handleEditSoin(soin)} className="text-gray-500 hover:text-gray-700">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteSoin(soin.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mt-8 mb-4">Forfaits</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForfaits.map((forfait) => (
          <div key={forfait.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{forfait.nom}</h3>
              <p className="text-gray-600 text-sm">{forfait.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-pink-500 font-bold">{forfait.prix_reduit} €</span>
                <div className="space-x-2">
                  <button
                    onClick={() => onForfaitSelect(forfait)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <ShoppingBag size={16} />
                  </button>
                  <button onClick={() => handleEditForfait(forfait)} className="text-gray-500 hover:text-gray-700">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteForfait(forfait.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {isSoinFormOpen && (
        <SoinForm
          soin={selectedSoin || undefined}
          onSave={handleSaveSoin}
          onCancel={closeSoinForm}
        />
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
