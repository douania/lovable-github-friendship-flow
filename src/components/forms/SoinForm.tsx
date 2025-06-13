import React, { useState, useEffect } from 'react';
import { Soin, Appareil, Zone } from '../../types';
import { X, Save, Plus, Minus } from 'lucide-react';
import { appareilService } from '../../services/appareilService';
import { soinService } from '../../services/soinService';
import { productService } from '../../services/productService';

interface SoinFormProps {
  soin?: Soin;
  appareilId?: string;
  zoneId?: string;
  onSave: (soin: Omit<Soin, 'id'>) => void;
  onCancel: () => void;
}

const SoinForm: React.FC<SoinFormProps> = ({ soin, appareilId, zoneId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    appareilId: soin?.appareilId || appareilId || '',
    zoneId: soin?.zoneId || zoneId || '',
    nom: soin?.nom || '',
    description: soin?.description || '',
    duree: soin?.duree || 30,
    prix: soin?.prix || 0,
    contreIndications: soin?.contreIndications || [],
    conseilsPostTraitement: soin?.conseilsPostTraitement || [],
    isActive: soin?.isActive ?? true
  });

  const [appareils, setAppareils] = useState<Appareil[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContraindication, setNewContraindication] = useState('');
  const [newConseil, setNewConseil] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedExpectedConsumables, setSelectedExpectedConsumables] = useState<Array<{ productId: string; quantity: number; }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    loadAppareils();
    loadProducts();
  }, []);

  useEffect(() => {
    if (formData.appareilId) {
      loadZones(formData.appareilId);
    }
  }, [formData.appareilId]);

  const loadAppareils = async () => {
    try {
      setLoading(true);
      const data = await appareilService.getActive();
      setAppareils(data);
    } catch (error) {
      console.error('Erreur lors du chargement des appareils:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await productService.getAll();
      setAllProducts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadZones = async (appareilId: string) => {
    try {
      const data = await soinService.getZonesByAppareil(appareilId);
      setZones(data);
    } catch (error) {
      console.error('Erreur lors du chargement des zones:', error);
    }
  };

  const addExpectedConsumable = (productId: string, quantity: number) => {
    const existingIndex = selectedExpectedConsumables.findIndex(item => item.productId === productId);
    if (existingIndex >= 0) {
      updateExpectedConsumableQuantity(productId, selectedExpectedConsumables[existingIndex].quantity + quantity);
    } else {
      setSelectedExpectedConsumables(prev => [...prev, { productId, quantity }]);
    }
  };

  const updateExpectedConsumableQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeExpectedConsumable(productId);
    } else {
      setSelectedExpectedConsumables(prev =>
        prev.map(item =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeExpectedConsumable = (productId: string) => {
    setSelectedExpectedConsumables(prev => prev.filter(item => item.productId !== productId));
  };

  const getProductName = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    return product ? product.name : 'Produit inconnu';
  };

  const getProductUnit = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    return product ? (product.unit || 'unité') : 'unité';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      createdAt: soin?.createdAt || new Date().toISOString()
    });
  };

  const addContraindication = () => {
    if (newContraindication.trim()) {
      setFormData(prev => ({
        ...prev,
        contreIndications: [...prev.contreIndications, newContraindication.trim()]
      }));
      setNewContraindication('');
    }
  };

  const removeContraindication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contreIndications: prev.contreIndications.filter((_, i) => i !== index)
    }));
  };

  const addConseil = () => {
    if (newConseil.trim()) {
      setFormData(prev => ({
        ...prev,
        conseilsPostTraitement: [...prev.conseilsPostTraitement, newConseil.trim()]
      }));
      setNewConseil('');
    }
  };

  const removeConseil = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conseilsPostTraitement: prev.conseilsPostTraitement.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {soin ? 'Modifier le soin' : 'Nouveau soin'}
            </h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Appareil *</label>
              <select
                required
                value={formData.appareilId}
                onChange={(e) => setFormData(prev => ({ ...prev, appareilId: e.target.value, zoneId: '' }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                disabled={!!appareilId} // Disable if pre-filled
              >
                <option value="">Sélectionner un appareil</option>
                {appareils.map(appareil => (
                  <option key={appareil.id} value={appareil.id}>
                    {appareil.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zone *</label>
              <select
                required
                value={formData.zoneId}
                onChange={(e) => setFormData(prev => ({ ...prev, zoneId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                disabled={!formData.appareilId || !!zoneId} // Disable if no appareil selected or pre-filled
              >
                <option value="">Sélectionner une zone</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom du soin *</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Ex: Emface Zone front"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Décrivez le soin..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée (minutes) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.duree}
                onChange={(e) => setFormData(prev => ({ ...prev, duree: parseInt(e.target.value) || 30 }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix (FCFA) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.prix}
                onChange={(e) => setFormData(prev => ({ ...prev, prix: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contre-indications</label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newContraindication}
                onChange={(e) => setNewContraindication(e.target.value)}
                placeholder="Ajouter une contre-indication"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContraindication())}
              />
              <button
                type="button"
                onClick={addContraindication}
                className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.contreIndications.map((ci, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center space-x-1"
                >
                  <span>{ci}</span>
                  <button
                    type="button"
                    onClick={() => removeContraindication(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conseils post-traitement</label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newConseil}
                onChange={(e) => setNewConseil(e.target.value)}
                placeholder="Ajouter un conseil post-traitement"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConseil())}
              />
              <button
                type="button"
                onClick={addConseil}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {formData.conseilsPostTraitement.map((conseil, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <span className="text-green-800">{conseil}</span>
                  <button
                    type="button"
                    onClick={() => removeConseil(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section Consommables Attendus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Consommables attendus par séance</label>
            
            {/* Ajouter un consommable */}
            <div className="mb-4">
              <div className="flex space-x-2">
                <select
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      addExpectedConsumable(e.target.value, 1);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Ajouter un consommable...</option>
                  {loadingProducts ? (
                    <option disabled>Chargement...</option>
                  ) : (
                    allProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.unit || 'unité'}) - Stock: {product.quantity}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Liste des consommables sélectionnés */}
            <div className="space-y-2">
              {selectedExpectedConsumables.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-3 border border-gray-200 rounded-lg">
                  Aucun consommable prévu
                </p>
              ) : (
                selectedExpectedConsumables.map(item => (
                  <div key={item.productId} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{getProductName(item.productId)}</p>
                      <p className="text-sm text-gray-600">Unité: {getProductUnit(item.productId)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateExpectedConsumableQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-blue-200 text-blue-700 rounded hover:bg-blue-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateExpectedConsumableQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-blue-200 text-blue-700 rounded hover:bg-blue-300"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExpectedConsumable(item.productId)}
                        className="w-6 h-6 flex items-center justify-center bg-red-200 text-red-700 rounded hover:bg-red-300 ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Soin actif (visible dans le catalogue)
            </label>
          </div>

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
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
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

export default SoinForm;