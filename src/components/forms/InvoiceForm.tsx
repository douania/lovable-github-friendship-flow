
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Invoice, Patient, Forfait } from '../../types';
import { patientService } from '../../services/patientService';
import { useToast } from '../../hooks/use-toast';

interface InvoiceFormProps {
  invoice?: Invoice;
  patients: Patient[];
  preselectedForfait?: Forfait | null;
  onSave: (invoiceData: Omit<Invoice, 'id'>) => void;
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  invoice, 
  patients, 
  preselectedForfait, 
  onSave, 
  onCancel 
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    patientId: invoice?.patientId || '',
    items: invoice?.items || [],
    total: invoice?.total || 0,
    status: invoice?.status || 'pending',
    createdAt: invoice?.createdAt || new Date().toISOString()
  });

  useEffect(() => {
    if (preselectedForfait) {
      setFormData(prev => ({
        ...prev,
        items: [{
          type: 'forfait',
          id: preselectedForfait.id,
          name: preselectedForfait.nom,
          price: preselectedForfait.prixReduit,
          quantity: 1
        }],
        total: preselectedForfait.prixReduit
      }));
    }
  }, [preselectedForfait]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un patient",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const selectedPatient = patients.find(p => p.id === formData.patientId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient
            </label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
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

          {selectedPatient && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="font-medium">Informations patient :</h3>
              <p className="text-sm text-gray-600">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
              <p className="text-sm text-gray-600">{selectedPatient.email}</p>
              <p className="text-sm text-gray-600">{selectedPatient.phone}</p>
            </div>
          )}

          {preselectedForfait && (
            <div className="bg-blue-50 p-3 rounded-md">
              <h3 className="font-medium text-blue-800">Forfait présélectionné :</h3>
              <p className="text-sm text-blue-600">{preselectedForfait.nom}</p>
              <p className="text-sm text-blue-600">{preselectedForfait.prixReduit} €</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="pending">En attente</option>
              <option value="paid">Payée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="font-medium">Total : {formData.total} €</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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
              {invoice ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
