import React, { useState } from 'react';
import { Appointment, Product } from '../../types';
import { X, Save, Calendar, Clock } from 'lucide-react';
import { productService } from '../../services/productService';

interface AppointmentFormProps {
  appointment?: Appointment;
  patients: any[];
  treatments: any[];
  onSave: (appointment: Omit<Appointment, 'id'>) => void;
  onCancel: () => void;
  selectedDate?: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  appointment, 
  patients,
  treatments,
  onSave, 
  onCancel, 
  selectedDate 
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedConsumedProducts, setSelectedConsumedProducts] = useState<Array<{ productId: string; quantity: number; }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || '',
    treatmentId: appointment?.treatmentId || '',
    date: appointment?.date || selectedDate || new Date().toISOString().split('T')[0],
    time: appointment?.time || '09:00',
    status: appointment?.status || 'scheduled' as const,
    notes: appointment?.notes || ''
  });

  // Charger les produits disponibles au montage du composant
  React.useEffect(() => {
    loadProducts();
  }, []);

  // Initialiser les produits consommés si on édite un rendez-vous
  React.useEffect(() => {
    if (appointment?.consumedProducts) {
      setSelectedConsumedProducts(appointment.consumedProducts);
    }
  }, [appointment]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const products = await productService.getAll();
      setAllProducts(products);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      consumedProducts: selectedConsumedProducts,
      createdAt: appointment?.createdAt || new Date().toISOString().split('T')[0]
    });
  };

  const addConsumedProduct = (productId: string, quantity: number) => {
    const existingIndex = selectedConsumedProducts.findIndex(p => p.productId === productId);
    if (existingIndex >= 0) {
      // Mettre à jour la quantité si le produit existe déjà
      const updated = [...selectedConsumedProducts];
      updated[existingIndex].quantity += quantity;
      setSelectedConsumedProducts(updated);
    } else {
      // Ajouter un nouveau produit
      setSelectedConsumedProducts(prev => [...prev, { productId, quantity }]);
    }
  };

  const updateConsumedProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedConsumedProducts(prev => prev.filter(p => p.productId !== productId));
    } else {
      setSelectedConsumedProducts(prev => prev.map(p => 
        p.productId === productId ? { ...p, quantity } : p
      ));
    }
  };

  const removeConsumedProduct = (productId: string) => {
    setSelectedConsumedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  const getProductName = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    return product ? product.name : 'Produit inconnu';
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : '';
  };

  const getTreatmentName = (treatmentId: string) => {
    const treatment = treatments.find(t => t.id === treatmentId);
    return treatment ? treatment.name : '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {appointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Soin *</label>
            <select
              required
              value={formData.treatmentId}
              onChange={(e) => setFormData(prev => ({ ...prev, treatmentId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
            >
              <option value="">Sélectionner un soin</option>
              {treatments.filter(t => t.isActive).map(treatment => (
                <option key={treatment.id} value={treatment.id}>
                  {treatment.name} - {treatment.price.toLocaleString()} FCFA ({treatment.duration}min)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  required
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
            >
              <option value="scheduled">Programmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
              <option value="no-show">Absent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Notes additionnelles..."
            />
          </div>

          {/* Section Produits Consommés */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Produits Consommés</label>
            
            {/* Ajouter un produit */}
            <div className="mb-4">
              <div className="flex space-x-2">
                <select
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      addConsumedProduct(e.target.value, 1);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Ajouter un produit...</option>
                  {loadingProducts ? (
                    <option disabled>Chargement...</option>
                  ) : (
                    allProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Stock: {product.quantity})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Liste des produits sélectionnés */}
            <div className="space-y-2">
              {selectedConsumedProducts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-3 border border-gray-200 rounded-lg">
                  Aucun produit consommé
                </p>
              ) : (
                selectedConsumedProducts.map(item => (
                  <div key={item.productId} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{getProductName(item.productId)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateConsumedProductQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-orange-200 text-orange-700 rounded hover:bg-orange-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateConsumedProductQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-orange-200 text-orange-700 rounded hover:bg-orange-300"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeConsumedProduct(item.productId)}
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
          {formData.patientId && formData.treatmentId && (
            <div className="p-4 bg-pink-50 rounded-xl">
              <h4 className="font-medium text-pink-800 mb-2">Résumé du rendez-vous</h4>
              <p className="text-sm text-pink-700">
                <strong>Patient:</strong> {getPatientName(formData.patientId)}
              </p>
              <p className="text-sm text-pink-700">
                <strong>Soin:</strong> {getTreatmentName(formData.treatmentId)}
              </p>
              <p className="text-sm text-pink-700">
                <strong>Date:</strong> {new Date(formData.date).toLocaleDateString('fr-FR')} à {formData.time}
              </p>
              {selectedConsumedProducts.length > 0 && (
                <p className="text-sm text-pink-700">
                  <strong>Produits:</strong> {selectedConsumedProducts.length} produit(s) consommé(s)
                </p>
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

export default AppointmentForm;