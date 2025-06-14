import React, { useState, useEffect } from 'react';
import { Forfait, Soin, Product } from '../../types';
import { X, Save, Plus, Minus, Calculator } from 'lucide-react';
import { soinService } from '../../services/soinService';
import { productService } from '../../services/productService';

interface ForfaitFormProps {
  forfait?: Forfait;
  onSave: (forfait: Omit<Forfait, 'id'>) => void;
  onCancel: () => void;
}

const ForfaitForm: React.FC<ForfaitFormProps> = ({ forfait, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: forfait?.nom || '',
    description: forfait?.description || '',
    soinIds: forfait?.soinIds || [],
    prixTotal: forfait?.prixTotal || 0,
    prixReduit: forfait?.prixReduit || 0,
    nbSeances: forfait?.nbSeances || 1,
    validiteMois: forfait?.validiteMois || 6,
    isActive: forfait?.isActive ?? true,
    ordre: forfait?.ordre || 0
  });

  const [availableSoins, setAvailableSoins] = useState<Soin[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedSoins, setSelectedSoins] = useState<Array<{soin: Soin, quantity: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (forfait && availableSoins.length > 0) {
      // Initialiser les soins sélectionnés pour l'édition
      const initialSelected = forfait.soinIds.map(soinId => {
        const soin = availableSoins.find(s => s.id === soinId);
        return soin ? { soin, quantity: 1 } : null;
      }).filter(Boolean) as Array<{soin: Soin, quantity: number}>;
      
      setSelectedSoins(initialSelected);
    }
  }, [forfait, availableSoins]);

  useEffect(() => {
    // Calculer le prix total automatiquement
    const total = selectedSoins.reduce((sum, item) => sum + (item.soin.prix * item.quantity), 0);
    setCalculatedTotal(total);
    
    // Mettre à jour le prix total si pas défini manuellement
    if (formData.prixTotal === 0) {
      setFormData(prev => ({ ...prev, prixTotal: total }));
    }
  }, [selectedSoins]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [soins, products] = await Promise.all([
        soinService.getAllActive(),
        productService.getAll()
      ]);
      setAvailableSoins(soins);
      setAllProducts(products);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateConsumablesCost = (): number => {
    return selectedSoins.reduce((totalCost, item) => {
      const { soin, quantity } = item;
      
      // Calculer le coût des consommables pour ce soin
      const soinConsumablesCost = (soin.expectedConsumables || []).reduce((soinCost, consumable) => {
        const product = allProducts.find(p => p.id === consumable.productId);
        if (product) {
          return soinCost + (product.unitPrice * consumable.quantity);
        }
        return soinCost;
      }, 0);
      
      return totalCost + (soinConsumablesCost * quantity);
    }, 0);
  };

  const calculateMargin = () => {
    const consumablesCost = calculateConsumablesCost();
    const margin = formData.prixReduit - consumablesCost;
    const marginPercentage = formData.prixReduit > 0 
      ? Math.round((margin / formData.prixReduit) * 100)
      : 0;
    
    return { margin, marginPercentage };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const soinIds = selectedSoins.map(item => item.soin.id);
    const totalSeances = selectedSoins.reduce((sum, item) => sum + item.quantity, 0);
    
    onSave({
      ...formData,
      soinIds,
      nbSeances: totalSeances,
      createdAt: forfait?.createdAt || new Date().toISOString()
    });
  };

  const addSoin = (soin: Soin) => {
    const existing = selectedSoins.find(item => item.soin.id === soin.id);
    if (existing) {
      setSelectedSoins(prev => prev.map(item => 
        item.soin.id === soin.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedSoins(prev => [...prev, { soin, quantity: 1 }]);
    }
  };

  const removeSoin = (soinId: string) => {
    setSelectedSoins(prev => prev.filter(item => item.soin.id !== soinId));
  };

  const updateQuantity = (soinId: string, quantity: number) => {
    if (quantity <= 0) {
      removeSoin(soinId);
    } else {
      setSelectedSoins(prev => prev.map(item => 
        item.soin.id === soinId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const calculateDiscount = () => {
    if (calculatedTotal > 0 && formData.prixReduit > 0) {
      const discount = ((calculatedTotal - formData.prixReduit) / calculatedTotal) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const consumablesCost = calculateConsumablesCost();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {forfait ? 'Modifier le forfait' : 'Nouveau forfait'}
            </h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du forfait *</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Ex: Forfait Rajeunissement Complet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordre d'affichage</label>
              <input
                type="number"
                min="0"
                value={formData.ordre}
                onChange={(e) => setFormData(prev => ({ ...prev, ordre: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Décrivez les avantages et spécificités de ce forfait..."
            />
          </div>

          {/* Sélection des soins */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Soins inclus dans le forfait</label>
            
            {/* Soins disponibles */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Ajouter des soins :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-4">
                {loading ? (
                  <p className="text-gray-500 text-center col-span-2">Chargement des soins...</p>
                ) : availableSoins.length === 0 ? (
                  <p className="text-gray-500 text-center col-span-2">
                    Aucun soin disponible. Veuillez d'abord créer des soins dans le catalogue.
                  </p>
                ) : (
                  availableSoins.map(soin => (
                    <button
                      key={soin.id}
                      type="button"
                      onClick={() => addSoin(soin)}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-pink-50 hover:border-pink-200 transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{soin.nom}</p>
                        <p className="text-sm text-gray-600">{soin.prix.toLocaleString()} FCFA</p>
                      </div>
                      <Plus className="w-4 h-4 text-pink-600" />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Soins sélectionnés */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Soins sélectionnés :</h4>
              {selectedSoins.length === 0 ? (
                <p className="text-gray-500 text-center py-4 border border-gray-200 rounded-xl">
                  Aucun soin sélectionné
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedSoins.map(item => (
                    <div key={item.soin.id} className="flex items-center justify-between p-3 bg-pink-50 border border-pink-200 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.soin.nom}</p>
                        <p className="text-sm text-gray-600">
                          {item.soin.prix.toLocaleString()} FCFA × {item.quantity} = {(item.soin.prix * item.quantity).toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.soin.id, item.quantity - 1)}
                          className="p-1 hover:bg-pink-200 rounded"
                        >
                          <Minus className="w-4 h-4 text-pink-600" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.soin.id, item.quantity + 1)}
                          className="p-1 hover:bg-pink-200 rounded"
                        >
                          <Plus className="w-4 h-4 text-pink-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSoin(item.soin.id)}
                          className="p-1 hover:bg-red-200 rounded ml-2"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tarification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix total calculé
                <Calculator className="w-4 h-4 inline ml-1" />
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="font-bold text-gray-800">{calculatedTotal.toLocaleString()} FCFA</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix forfait (réduit) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.prixReduit}
                onChange={(e) => setFormData(prev => ({ ...prev, prixReduit: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              {calculateDiscount() > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Économie: {calculateDiscount()}% ({(calculatedTotal - formData.prixReduit).toLocaleString()} FCFA)
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Validité (mois) *</label>
              <input
                type="number"
                required
                min="1"
                max="24"
                value={formData.validiteMois}
                onChange={(e) => setFormData(prev => ({ ...prev, validiteMois: parseInt(e.target.value) || 6 }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Statut */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Forfait actif (visible pour les clients)
            </label>
          </div>

          {/* Résumé */}
          {selectedSoins.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl border border-pink-200">
              <h4 className="font-medium text-pink-800 mb-2">Résumé du forfait</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-pink-700">
                    <strong>Nombre total de séances:</strong> {selectedSoins.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                  <p className="text-pink-700">
                    <strong>Prix sans forfait:</strong> {calculatedTotal.toLocaleString()} FCFA
                  </p>
                  <p className="text-pink-700">
                    <strong>Coût consommables:</strong> {consumablesCost.toLocaleString()} FCFA
                  </p>
                </div>
                <div>
                  <p className="text-pink-700">
                    <strong>Prix forfait:</strong> {formData.prixReduit.toLocaleString()} FCFA
                  </p>
                  <p className="text-pink-700">
                    <strong>Validité:</strong> {formData.validiteMois} mois
                  </p>
                  {(() => {
                    const { margin, marginPercentage } = calculateMargin();
                    return (
                      <p className={`${margin > 0 ? 'text-green-700' : 'text-red-700'}`}>
                        <strong>Marge:</strong> {margin.toLocaleString()} FCFA ({marginPercentage}%)
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={selectedSoins.length === 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForfaitForm;
