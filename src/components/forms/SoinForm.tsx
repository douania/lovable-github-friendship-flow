import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { Soin, Appareil, Zone } from '../../types';
import { supabase } from '../../lib/supabase';

interface SoinFormProps {
  soin?: Soin;
  onSave: (soinData: Omit<Soin, 'id'>) => void;
  onCancel: () => void;
}

export default function SoinForm({ soin, onSave, onCancel }: SoinFormProps) {
  const [appareils, setAppareils] = useState<Appareil[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [showConsumablesModal, setShowConsumablesModal] = useState(false);
  const [consumableQuantities, setConsumableQuantities] = useState<{ [productId: string]: number }>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const toggleConsumablesModal = () => {
    setShowConsumablesModal(!showConsumablesModal);
  };

  const handleConsumableQuantityChange = (productId: string, quantity: number) => {
    setConsumableQuantities({
      ...consumableQuantities,
      [productId]: quantity,
    });
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.nom) {
      errors.push('Le nom du soin est obligatoire.');
    }
    if (!formData.prix) {
      errors.push('Le prix du soin est obligatoire.');
    }
    if (!formData.appareil_id) {
      errors.push('L\'appareil est obligatoire.');
    }
    if (!formData.zone_id) {
      errors.push('La zone est obligatoire.');
    }
    if (!formData.duree) {
      errors.push('La durée est obligatoire.');
    }
    setFormErrors(errors);
    return errors.length === 0;
  };

  const [formData, setFormData] = useState({
    nom: soin?.nom || '',
    description: soin?.description || '',
    appareil_id: soin?.appareil_id || '',
    zone_id: soin?.zone_id || '',
    duree: soin?.duree || 60,
    prix: soin?.prix || 0,
    contre_indications: soin?.contre_indications || [],
    conseils_post_traitement: soin?.conseils_post_traitement || [],
    expected_consumables: soin?.expected_consumables || {},
    is_active: soin?.is_active ?? true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appareilsResult, zonesResult, productsResult] = await Promise.all([
        supabase.from('appareils').select('*').eq('is_active', true),
        supabase.from('zones').select('*'),
        supabase.from('products').select('*')
      ]);

      if (appareilsResult.data) setAppareils(appareilsResult.data);
      if (zonesResult.data) setZones(zonesResult.data);
      if (productsResult.data) setProducts(productsResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {soin ? 'Modifier le soin' : 'Nouveau soin'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du soin *
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (€) *
              </label>
              <input
                type="number"
                value={formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appareil *
              </label>
              <select
                value={formData.appareil_id}
                onChange={(e) => setFormData({ ...formData, appareil_id: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Sélectionner un appareil</option>
                {appareils.map((appareil) => (
                  <option key={appareil.id} value={appareil.id}>
                    {appareil.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone *
              </label>
              <select
                value={formData.zone_id}
                onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Sélectionner une zone</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée (minutes) *
              </label>
              <input
                type="number"
                value={formData.duree}
                onChange={(e) => setFormData({ ...formData, duree: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Soin actif
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
            >
              {soin ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
