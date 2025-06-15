import React, { useState, useEffect } from 'react';
import { Invoice, Patient, Forfait } from '../../types';
import { invoiceService } from '../../services/invoiceService';
import { patientService } from '../../services/patientService';
import InvoiceForm from '../forms/InvoiceForm';
import { Plus, Edit, Trash2, FileText, AlertCircle } from 'lucide-react';

interface InvoiceWithPatient extends Invoice {
  patient?: Patient;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceWithPatient[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const invoicesData = await invoiceService.getAllInvoices();
      // Fetch patient data for each invoice
      const invoicesWithPatient = await Promise.all(
        invoicesData.map(async (invoice: Invoice) => {
          const patient = await patientService.getPatientById(invoice.patientId);
          return { ...invoice, patient: patient || undefined };
        })
      );
      setInvoices(invoicesWithPatient);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des factures');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const patientsData = await patientService.getAllPatients();
      setPatients(patientsData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des patients');
    }
  };

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedInvoice(undefined);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    openForm();
  };

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      setLoading(true);
      setError(null);
      try {
        await invoiceService.deleteInvoice(id);
        setInvoices(invoices.filter((invoice) => invoice.id !== id));
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la suppression de la facture');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      if (selectedInvoice) {
        // Update existing invoice
        const updatedInvoice = await invoiceService.updateInvoice(selectedInvoice.id, invoiceData);
        const patient = await patientService.getPatientById(updatedInvoice.patientId);
        setInvoices(
          invoices.map((invoice) => (invoice.id === updatedInvoice.id ? { ...updatedInvoice, patient: patient || undefined } : invoice))
        );
      } else {
        // Create new invoice
        const newInvoice = await invoiceService.createInvoice(invoiceData);
        // Fetch patient data for the new invoice
        const patient = await patientService.getPatientById(newInvoice.patientId);
        setInvoices([...invoices, { ...newInvoice, patient: patient || undefined }]);
      }
      closeForm();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde de la facture');
    } finally {
      setLoading(false);
    }
  };

  const renderInvoiceForm = () => {
    if (isFormOpen) {
      return (
        <InvoiceForm
          invoice={selectedInvoice}
          patients={patients}
          onSave={handleSaveInvoice}
          onCancel={closeForm}
        />
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Factures</h1>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={openForm}
          className="flex items-center space-x-2 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-xl transition-colors"
          disabled={loading}
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle facture</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200 rounded-xl shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left">ID</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Patient</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Montant</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Statut</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Date de création</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border border-gray-200 px-4 py-2">{invoice.id}</td>
                  <td className="border border-gray-200 px-4 py-2">
                    {invoice.patient ? `${invoice.patient.firstName} ${invoice.patient.lastName}` : 'N/A'}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">{invoice.amount} €</td>
                  <td className="border border-gray-200 px-4 py-2">{invoice.status}</td>
                  <td className="border border-gray-200 px-4 py-2">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 transition-colors">
                        <FileText className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {renderInvoiceForm()}
    </div>
  );
};

export default Invoices;
