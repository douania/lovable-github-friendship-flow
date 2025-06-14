
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Eye, Trash2, Package, Calendar, X } from 'lucide-react';
import { Forfait } from '../../types';
import { forfaitService } from '../../services/forfaitService';
import ForfaitForm from '../forms/ForfaitForm';

const ForfaitManagement: React.FC = () => {
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingForfait, setEditingForfait] = useState<Forfait | null>(null);
  const [selectedForfait, setSelectedForfait] = useState<Forfait | null>(null);

  useEffect(() => {
    loadForfaits();
  }, []);

  const loadForfaits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await forfaitService.getAll();
      setForfaits(data);
    } catch (err) {
      console.error('Erreur lors du chargement des forfaits:', err);
      setError('Erreur lors du chargement des forfaits.');
    } finally {
      setLoading(false);
    }
  };

  const filteredForfaits = forfaits.filter(forfait =>
    forfait.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forfait.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveForfait = async (forfaitData: Omit<Forfait, 'id'>) => {
    try {
      setError(null);
      
      if (editingForfait) {
        const updatedForfait = await forfaitService.update(editingForfait.id, forfaitData);
        setForfaits(prev => prev.map(f => 
          f.id === editingForfait.id ? updatedForfait : f
        ));
      } else {
        const newForfait = await forfaitService.create(forfaitData);
        setForfaits(prev => [newForfait, ...prev]);
      }
      
      setShowAddModal(false);
      setEditingForfait(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du forfait:', err);
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const handleEditForfait = (forfait: Forfait) => {
    setEditingForfait(forfait);
    setShowAddModal(true);
  };

  const handleDeleteForfait = async (forfaitId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce forfait ?')) {
      return;
    }

    try {
      setError(null);
      await forfaitService.delete(forfaitId);
      setForfaits(prev => prev.filter(f => f.id !== forfaitId));
      setSelectedForfait(null);
    } catch (err) {
      console.error('Erreur lors de la suppression du forfait:', err);
      setError('Erreur lors de la suppression. Veuillez réessayer.');
    }
  };

  const calculateDiscount = (forfait: Forfait) => {
    if (forfait.prixTotal > 0 && forfait.prixReduit > 0) {
      const discount = ((forfait.prixTotal - forfait.prixReduit) / forfait.prixTotal) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const ForfaitCard: React.FC<{ forfait: Forfait }> = ({ forfait }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${
      !forfait.isActive ? 'opacity-60 border-gray-200' : 'border-gray-100'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{forfait.nom}</h3>
            {!forfait.isActive && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                Inactif
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-3">{forfait.description}</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedForfait(forfait)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
          <button 
            onClick={() => handleEditForfait(forfait)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-gray-500" />
          </button>
          <button 
            onClick={() => handleDeleteForfait(forfait.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Séances</p>
            <p className="font-semibold text-gray-800">{forfait.nbSeances}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Validité</p>
            <p className="font-semibold text-gray-800">{forfait.validiteMois} mois</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Prix normal:</span>
          <span className="text-sm line-through text-gray-500">{forfait.prixTotal.toLocaleString()} FCFA</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Prix forfait:</span>
          <span className="text-lg font-bold text-pink-600">{forfait.prixReduit.toLocaleString()} FCFA</span>
        </div>
        {calculateDiscount(forfait) > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-600">Économie:</span>
            <span className="text-sm font-medium text-green-600">
              {calculateDiscount(forfait)}% ({(forfait.prixTotal - forfait.prixReduit).toLocaleString()} FCFA)
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Forfaits</h1>
          <p className="text-gray-600">Créez et gérez vos forfaits personnalisés</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Forfait</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm underline mt-1"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un forfait..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        <div className="text-sm text-gray-600 bg-white px-4 py-3 rounded-xl border border-gray-200">
          {filteredForfaits.length} forfait(s)
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des forfaits...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForfaits.map((forfait) => (
            <ForfaitCard key={forfait.id} forfait={forfait} />
          ))}
        </div>
      )}

      {!loading && filteredForfaits.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun forfait trouvé</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Aucun forfait ne correspond à votre recherche' : 'Commencez par créer votre premier forfait'}
          </p>
        </div>
      )}

      {/* Modal de détails */}
      {selectedForfait && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Détails du forfait</h2>
                <button 
                  onClick={() => setSelectedForfait(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedForfait.nom}</h3>
                <p className="text-gray-600">{selectedForfait.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Séances incluses</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{selectedForfait.nbSeances}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Validité</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{selectedForfait.validiteMois} mois</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl border border-pink-200">
                <h4 className="font-medium text-pink-800 mb-3">Tarification</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-pink-700">Prix normal:</span>
                    <span className="line-through text-pink-600">{selectedForfait.prixTotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-pink-800">Prix forfait:</span>
                    <span className="text-xl font-bold text-pink-700">{selectedForfait.prixReduit.toLocaleString()} FCFA</span>
                  </div>
                  {calculateDiscount(selectedForfait) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Économie:</span>
                      <span className="font-medium text-green-700">
                        {calculateDiscount(selectedForfait)}% ({(selectedForfait.prixTotal - selectedForfait.prixReduit).toLocaleString()} FCFA)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedForfait.soins && selectedForfait.soins.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Soins inclus</h4>
                  <div className="space-y-2">
                    {selectedForfait.soins.map(soin => (
                      <div key={soin.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{soin.nom}</p>
                          <p className="text-sm text-gray-600">{soin.duree} min</p>
                        </div>
                        <span className="font-medium text-gray-700">{soin.prix.toLocaleString()} FCFA</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-100">
              <button
                onClick={() => handleEditForfait(selectedForfait)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDeleteForfait(selectedForfait.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {(showAddModal || editingForfait) && (
        <ForfaitForm
          forfait={editingForfait || undefined}
          onSave={handleSaveForfait}
          onCancel={() => {
            setShowAddModal(false);
            setEditingForfait(null);
          }}
        />
      )}
    </div>
  );
};

export default ForfaitManagement;
