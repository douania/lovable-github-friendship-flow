
import React, { useState, useEffect } from 'react';
import { Soin, Product } from '../../types';
import { productService } from '../../services/productService';
import { X, Plus } from 'lucide-react';

interface SoinFormProps {
  soin?: Soin;
  onSave: (soinData: Omit<Soin, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const SoinForm: React.FC<SoinFormProps> = ({ soin, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: soin?.nom || '',
    description: soin?.description || '',
    appareilId: soin?.appareilId || '',
    zoneId: soin?.zoneId || '',
    duree: soin?.duree || 0,
    prix: soin?.prix || 0,
    contreIndications: Array.isArray(soin?.contreIndications) ? soin.contreIndications : [],
    conseilsPostTraitement: Array.isArray(soin?.conseilsPostTraitement) ? soin.conseilsPostTraitement : [],
    expectedConsumables: soin?.expectedConsumables || [],
    isActive: soin?.isActive || true,
    createdAt: soin?.createdAt || new Date().toISOString()
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const [newContraindication, setNewContraindication] = useState('');
  const [newConseil, setNewConseil] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const productsData = await productService.getAll();
      setProducts(productsData);
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await onSave(formData);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde du soin.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value
    }));
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

  const addConsumable = () => {
    setFormData(prev => ({
      ...prev,
      expectedConsumables: [...prev.expectedConsumables, { productId: '', quantity: 1 }]
    }));
  };

  const removeConsumable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expectedConsumables: prev.expectedConsumables.filter((_, i) => i !== index)
    }));
  };

  const updateConsumable = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      expectedConsumables: prev.expectedConsumables.map((consumable, i) => 
        i === index 
          ? { ...consumable, [field]: field === 'quantity' ? Number(value) : value }
          : consumable
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {soin ? 'Modifier le soin' : 'Nouveau soin'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du soin *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                placeholder="Ex: Épilation laser visage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (minutes) *
              </label>
              <input
                type="number"
                name="duree"
                value={formData.duree}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                min="1"
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={3}
              placeholder="Description détaillée du soin..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix (FCFA) *
            </label>
            <input
              type="number"
              name="prix"
              value={formData.prix}
              onChange={handleInputChange}
              step="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
              min="0"
              placeholder="25000"
            />
          </div>

          {/* Consommables attendus */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Consommables attendus</h3>
              <button
                type="button"
                onClick={addConsumable}
                className="flex items-center space-x-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-lg hover:bg-pink-200 transition-colors"
                disabled={loadingProducts}
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>
            
            {loadingProducts ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Chargement des produits...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.expectedConsumables.map((consumable, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Produit
                      </label>
                      <select
                        value={consumable.productId}
                        onChange={(e) => updateConsumable(index, 'productId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        required
                      >
                        <option value="">Sélectionner un produit</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.quantity} en stock)
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-24">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        value={consumable.quantity}
                        onChange={(e) => updateConsumable(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        min="1"
                        required
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeConsumable(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {formData.expectedConsumables.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Aucun consommable configuré</p>
                    <p className="text-sm">Cliquez sur "Ajouter" pour commencer</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contre-indications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contre-indications</label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newContraindication}
                onChange={(e) => setNewContraindication(e.target.value)}
                placeholder="Ajouter une contre-indication"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContraindication())}
              />
              <button
                type="button"
                onClick={addContraindication}
                className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
              >
                Ajouter
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

          {/* Conseils post-traitement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conseils post-traitement</label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newConseil}
                onChange={(e) => setNewConseil(e.target.value)}
                placeholder="Ajouter un conseil post-traitement"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConseil())}
              />
              <button
                type="button"
                onClick={addConseil}
                className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
              >
                Ajouter
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

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="mr-3 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Soin actif (visible dans les catalogues)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{soin ? 'Modifier' : 'Créer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SoinForm;
