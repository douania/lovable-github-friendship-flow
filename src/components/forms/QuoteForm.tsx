
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Quote, QuoteItem } from '../../types/consultation';
import { Patient, Soin } from '../../types';
import { patientService } from '../../services/patientService';
import { soinService } from '../../services/soinService';
import { useToast } from '../../hooks/use-toast';

interface QuoteFormProps {
  quote?: Quote;
  onSave: (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  initialQuoteNumber: string;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ 
  quote, 
  onSave, 
  onCancel,
  initialQuoteNumber
}) => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [soins, setSoins] = useState<Soin[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    quoteNumber: quote?.quoteNumber || initialQuoteNumber,
    patientId: quote?.patientId || '',
    practitionerId: quote?.practitionerId || '',
    treatmentItems: quote?.treatmentItems || [],
    subtotal: quote?.subtotal || 0,
    discountAmount: quote?.discountAmount || 0,
    taxAmount: quote?.taxAmount || 0,
    totalAmount: quote?.totalAmount || 0,
    status: quote?.status || 'draft' as const,
    validUntil: quote?.validUntil || '',
    notes: quote?.notes || ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData.treatmentItems, formData.discountAmount, formData.taxAmount]);

  const loadData = async () => {
    try {
      const [patientsData, soinsData] = await Promise.all([
        patientService.getAllPatients(),
        soinService.getAllActive()
      ]);
      setPatients(patientsData);
      setSoins(soinsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données nécessaires.',
        variant: 'destructive'
      });
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.treatmentItems.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = subtotal - formData.discountAmount + formData.taxAmount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      totalAmount
    }));
  };

  const addTreatmentItem = () => {
    const newItem: QuoteItem = {
      soinId: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    
    setFormData(prev => ({
      ...prev,
      treatmentItems: [...prev.treatmentItems, newItem]
    }));
  };

  const updateTreatmentItem = (index: number, field: keyof QuoteItem, value: any) => {
    setFormData(prev => {
      const updatedItems = [...prev.treatmentItems];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      
      // Mettre à jour le prix unitaire si un soin est sélectionné
      if (field === 'soinId') {
        const selectedSoin = soins.find(s => s.id === value);
        if (selectedSoin) {
          updatedItems[index].unitPrice = selectedSoin.prix;
        }
      }
      
      // Recalculer le total de l'item
      if (field === 'quantity' || field === 'unitPrice' || field === 'soinId') {
        updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
      }
      
      return { ...prev, treatmentItems: updatedItems };
    });
  };

  const removeTreatmentItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      treatmentItems: prev.treatmentItems.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un patient.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.treatmentItems.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez ajouter au moins un soin.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      toast({
        title: 'Succès',
        description: quote ? 'Devis modifié avec succès.' : 'Devis créé avec succès.'
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le devis.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {quote ? 'Modifier le devis' : 'Nouveau devis'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de devis
              </label>
              <input
                type="text"
                value={formData.quoteNumber}
                onChange={(e) => handleInputChange('quoteNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient *
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => handleInputChange('patientId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">Sélectionner un patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="rejected">Refusé</option>
                <option value="expired">Expiré</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valide jusqu'au
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Soins */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Soins</h3>
              <button
                type="button"
                onClick={addTreatmentItem}
                className="bg-pink-500 text-white px-3 py-1 rounded-md hover:bg-pink-600 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Ajouter un soin
              </button>
            </div>

            <div className="space-y-3">
              {formData.treatmentItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-md">
                  <div className="flex-1">
                    <select
                      value={item.soinId}
                      onChange={(e) => updateTreatmentItem(index, 'soinId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    >
                      <option value="">Sélectionner un soin</option>
                      {soins.map(soin => (
                        <option key={soin.id} value={soin.id}>
                          {soin.nom} - {soin.prix} FCFA
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateTreatmentItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      min="1"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateTreatmentItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      min="0"
                      required
                    />
                  </div>
                  <div className="w-24 text-right font-medium">
                    {item.total.toLocaleString()} FCFA
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTreatmentItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totaux */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span className="font-medium">{formData.subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Remise:</span>
                <input
                  type="number"
                  value={formData.discountAmount}
                  onChange={(e) => handleInputChange('discountAmount', parseInt(e.target.value) || 0)}
                  className="w-32 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-right"
                  min="0"
                />
              </div>
              <div className="flex justify-between items-center">
                <span>Taxes:</span>
                <input
                  type="number"
                  value={formData.taxAmount}
                  onChange={(e) => handleInputChange('taxAmount', parseInt(e.target.value) || 0)}
                  className="w-32 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-right"
                  min="0"
                />
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span>{formData.totalAmount.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Notes ou commentaires sur le devis..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sauvegarde...' : (quote ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteForm;
