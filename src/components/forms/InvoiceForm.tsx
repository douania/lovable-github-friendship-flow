import React, { useState, useEffect } from 'react';
import { Forfait, Patient } from '../../types';
import { supabase } from '../../lib/supabase';

interface InvoiceFormProps {
  invoice?: any;
  patients: Patient[];
  preselectedForfait?: Forfait | null;
  onSave: (invoiceData: any) => void;
  onCancel: () => void;
}

export default function InvoiceForm({ 
  invoice, 
  patients, 
  preselectedForfait, 
  onSave, 
  onCancel 
}: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    patient_id: invoice?.patient_id || '',
    treatment_ids: invoice?.treatment_ids || [],
    amount: invoice?.amount || 0,
    status: invoice?.status || 'unpaid',
    payment_method: invoice?.payment_method || 'cash'
  });

  const [treatments, setTreatments] = useState<any[]>([]);
  const [soins, setSoins] = useState<any[]>([]);
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [selectedForfait, setSelectedForfait] = useState<Forfait | null>(preselectedForfait || null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [treatmentsResult, soinsResult, forfaitsResult] = await Promise.all([
        supabase.from('treatments').select('*').eq('is_active', true),
        supabase.from('soins').select('*').eq('is_active', true),
        supabase.from('forfaits').select('*').eq('is_active', true)
      ]);

      if (treatmentsResult.data) setTreatments(treatmentsResult.data);
      if (soinsResult.data) setSoins(soinsResult.data);
      if (forfaitsResult.data) setForfaits(forfaitsResult.data);
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
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient
            </label>
            <select
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Sélectionner un patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="paid">Payé</option>
              <option value="partial">Partiellement payé</option>
              <option value="unpaid">Non payé</option>
            </select>
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Méthode de paiement
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="cash">Espèces</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="card">Carte</option>
              <option value="bank_transfer">Virement bancaire</option>
            </select>
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
              {invoice ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
