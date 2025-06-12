import React, { useState, useEffect } from 'react';
import { Invoice, Soin, Forfait } from '../../types';
import { X, Save, DollarSign, CreditCard } from 'lucide-react';
import { soinService } from '../../services/soinService';

interface InvoiceFormProps {
  invoice?: Invoice;
  patients: any[];
  treatments: any[];
  onSave: (invoice: Omit<Invoice, 'id'>) => void;
  onCancel: () => void;
  preselectedPatient?: string;
  preselectedForfait?: Forfait | null;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  invoice, 
  patients,
  treatments,
  onSave, 
  onCancel,
  preselectedPatient,
  preselectedForfait
}) => {
  const [availableSoins, setAvailableSoins] = useState<Soin[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    patientId: invoice?.patientId || preselectedPatient || '',
    treatmentIds: invoice?.treatmentIds || [],
    amount: invoice?.amount || 0,
    status: invoice?.status || 'unpaid' as const,
    paymentMethod: invoice?.paymentMethod || 'cash' as const
  });
  const [selectedForfait, setSelectedForfait] = useState<Forfait | null>(preselectedForfait || null);

  // Charger les soins disponibles
  useEffect(() => {
    loadSoins();
  }, []);

  // Initialiser avec le forfait pré-sélectionné
  useEffect(() => {
    if (preselectedForfait && availableSoins.length > 0) {
      console.log('Forfait pré-sélectionné:', preselectedForfait);
      console.log('Soins du forfait:', preselectedForfait.soinIds);
      console.log('Soins disponibles:', availableSoins.map(s => s.id));
      
      // Filtrer les soins qui existent réellement dans la base
      const validSoinIds = preselectedForfait.soinIds.filter(soinId => 
        availableSoins.some(soin => soin.id === soinId)
      );

      console.log('Soins valides trouvés:', validSoinIds);

      setFormData(prev => ({
        ...prev,
        treatmentIds: validSoinIds,
        amount: preselectedForfait.prixReduit
      }));
      
      setSelectedForfait(preselectedForfait);
    }
  }, [preselectedForfait, availableSoins]);

  // Calculer le montant automatiquement quand les soins changent (seulement si pas de forfait)
  useEffect(() => {
    if (availableSoins.length > 0 && formData.treatmentIds.length > 0 && !selectedForfait) {
      const calculatedAmount = calculateTotal();
      if (!invoice || formData.amount === 0) {
        setFormData(prev => ({ ...prev, amount: calculatedAmount }));
      }
    }
  }, [formData.treatmentIds, availableSoins, selectedForfait]);

  const loadSoins = async () => {
    try {
      setLoading(true);
      const soins = await soinService.getAllActive();
      console.log('Soins chargés:', soins.length);
      setAvailableSoins(soins);
    } catch (error) {
      console.error('Erreur lors du chargement des soins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      patientId: formData.patientId,
      treatmentIds: formData.treatmentIds,
      amount: formData.amount,
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      createdAt: invoice?.createdAt || new Date().toISOString().split('T')[0],
      ...(formData.status === 'paid' && !invoice?.paidAt ? { paidAt: new Date().toISOString().split('T')[0] } : {})
    });
  };

  const toggleTreatment = (treatmentId: string) => {
    // Si un forfait est sélectionné, ne pas permettre de modifier les soins
    if (selectedForfait) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      treatmentIds: prev.treatmentIds.includes(treatmentId)
        ? prev.treatmentIds.filter(id => id !== treatmentId)
        : [...prev.treatmentIds, treatmentId]
    }));
  };

  const calculateTotal = () => {
    return formData.treatmentIds.reduce((sum, treatmentId) => {
      const soin = availableSoins.find(s => s.id === treatmentId);
      return sum + (soin?.prix || 0);
    }, 0);
  };

  const calculateTotalWithoutDiscount = () => {
    if (!selectedForfait) return calculateTotal();
    
    return selectedForfait.soinIds.reduce((sum, soinId) => {
      const soin = availableSoins.find(s => s.id === soinId);
      return sum + (soin?.prix || 0);
    }, 0);
  };

  const getSoinName = (soinId: string) => {
    const soin = availableSoins.find(s => s.id === soinId);
    return soin ? soin.nom : 'Soin inconnu';
  };

  const getSoinPrice = (soinId: string) => {
    const soin = availableSoins.find(s => s.id === soinId);
    return soin ? soin.prix : 0;
  };

  const clearForfait = () => {
    setSelectedForfait(null);
    setFormData(prev => ({
      ...prev,
      treatmentIds: [],
      amount: 0
    }));
  };

  const selectedPatient = patients.find(p => p.id === formData.patientId);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Chargement des soins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
              {selectedForfait && (
                <span className="text-sm font-normal text-purple-600 ml-2">
                  (Forfait: {selectedForfait.nom})
                </span>
              )}
            </h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
            <select
              required
              value={formData.patientId}
              onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
            >
              <option value="">Sélectionner un patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Affichage du forfait sélectionné */}
          {selectedForfait && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-purple-800 mb-2">Forfait sélectionné: {selectedForfait.nom}</h3>
                  <p className="text-sm text-purple-700 mb-3">{selectedForfait.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-purple-600">Séances:</span>
                      <span className="font-medium text-purple-800 ml-1">{selectedForfait.nbSeances}</span>
                    </div>
                    <div>
                      <span className="text-purple-600">Validité:</span>
                      <span className="font-medium text-purple-800 ml-1">{selectedForfait.validiteMois} mois</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearForfait}
                  className="text-purple-600 hover:text-purple-800 text-sm underline"
                >
                  Retirer forfait
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Soins facturés *
              {selectedForfait && (
                <span className="text-purple-600 text-sm ml-2">
                  (Soins inclus dans le forfait)
                </span>
              )}
            </label>
            
            <div className={`space-y-2 max-h-40 overflow-y-auto border rounded-xl p-4 ${
              selectedForfait 
                ? 'border-purple-200 bg-purple-50' 
                : 'border-gray-200'
            }`}>
              {selectedForfait && (
                <p className="text-sm text-purple-700 font-medium mb-3">
                  ✓ Soins inclus dans le forfait "{selectedForfait.nom}":
                </p>
              )}
              
              {availableSoins.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun soin disponible</p>
              ) : (
                availableSoins.map(soin => {
                  const isChecked = formData.treatmentIds.includes(soin.id);
                  const isFromForfait = selectedForfait?.soinIds.includes(soin.id) || false;
                  const isDisabled = selectedForfait && !isFromForfait;
                  
                  return (
                    <label 
                      key={soin.id} 
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isFromForfait 
                          ? 'bg-white border-2 border-purple-300 shadow-sm' 
                          : isDisabled
                          ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTreatment(soin.id)}
                        disabled={isDisabled}
                        className={`w-4 h-4 border-gray-300 rounded focus:ring-pink-500 ${
                          isFromForfait 
                            ? 'text-purple-600' 
                            : isDisabled
                            ? 'cursor-not-allowed'
                            : 'text-pink-600'
                        }`}
                      />
                      <div className="flex-1 flex justify-between">
                        <div>
                          <span className={`${
                            isFromForfait ? 'text-purple-800 font-medium' : 
                            isDisabled ? 'text-gray-500' : 'text-gray-800'
                          }`}>
                            {soin.nom}
                          </span>
                          {soin.appareil && (
                            <span className="text-xs text-gray-500 ml-2">({soin.appareil.nom})</span>
                          )}
                          {isFromForfait && (
                            <span className="text-xs text-purple-600 ml-2 font-bold">✓ INCLUS FORFAIT</span>
                          )}
                        </div>
                        <span className={`font-medium ${
                          isFromForfait ? 'text-purple-600' : 
                          isDisabled ? 'text-gray-400' : 'text-pink-600'
                        }`}>
                          {soin.prix.toLocaleString()} FCFA
                        </span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Affichage des économies pour les forfaits */}
          {selectedForfait && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <h4 className="font-bold text-green-800 mb-3">💰 Économies réalisées avec ce forfait</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Prix total sans forfait:</span>
                  <span className="text-green-700 line-through font-medium">
                    {calculateTotalWithoutDiscount().toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-bold">Prix avec forfait:</span>
                  <span className="text-green-800 font-bold text-xl">
                    {selectedForfait.prixReduit.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-green-300">
                  <span className="text-green-800 font-bold">Vous économisez:</span>
                  <div className="text-right">
                    <div className="text-green-800 font-bold text-lg">
                      {(calculateTotalWithoutDiscount() - selectedForfait.prixReduit).toLocaleString()} FCFA
                    </div>
                    <div className="text-green-700 text-sm">
                      ({Math.round(((calculateTotalWithoutDiscount() - selectedForfait.prixReduit) / calculateTotalWithoutDiscount()) * 100)}% d'économie)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
              >
                <option value="unpaid">Impayé</option>
                <option value="partial">Partiel</option>
                <option value="paid">Payé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
              >
                <option value="cash">Espèces</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="card">Carte bancaire</option>
                <option value="bank_transfer">Virement</option>
              </select>
            </div>
          </div>

          {!selectedForfait && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant personnalisé (FCFA)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                  placeholder={`Montant calculé: ${calculateTotal().toLocaleString()}`}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Laissez vide pour utiliser le montant calculé automatiquement ({calculateTotal().toLocaleString()} FCFA)
              </p>
            </div>
          )}

          {selectedPatient && formData.treatmentIds.length > 0 && (
            <div className="p-4 bg-pink-50 rounded-xl">
              <h4 className="font-medium text-pink-800 mb-2">📋 Résumé de la facture</h4>
              <p className="text-sm text-pink-700">
                <strong>Patient:</strong> {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
              <p className="text-sm text-pink-700">
                <strong>Soins:</strong> {formData.treatmentIds.length} soin(s) sélectionné(s)
              </p>
              <p className="text-sm text-pink-700">
                <strong>Total:</strong> {formData.amount.toLocaleString()} FCFA
              </p>
              {selectedForfait && (
                <div className="mt-2 p-2 bg-purple-100 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium">
                    ✓ Forfait "{selectedForfait.nom}" - {selectedForfait.nbSeances} séances
                  </p>
                  <p className="text-xs text-purple-600">
                    Économie: {Math.round(((calculateTotalWithoutDiscount() - formData.amount) / calculateTotalWithoutDiscount()) * 100)}% 
                    ({(calculateTotalWithoutDiscount() - formData.amount).toLocaleString()} FCFA)
                  </p>
                </div>
              )}
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

export default InvoiceForm;