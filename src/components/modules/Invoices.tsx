
import React, { useState, useEffect } from 'react';
import { Invoice, Patient } from '../../types';
import { invoiceService } from '../../services/invoiceService';
import { patientService } from '../../services/patientService';
import InvoiceForm from '../forms/InvoiceForm';
import { Plus, Edit, Trash2, FileText, AlertCircle, Download, Search, Filter } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { InvoicePDF, printInvoice } from '../invoices/InvoicePDF';

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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceWithPatient | null>(null);

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const invoicesData = await invoiceService.getAllInvoices();
      const invoicesWithPatient = await Promise.all(
        invoicesData.map(async (invoice: Invoice) => {
          const patient = await patientService.getPatientById(invoice.patientId);
          return { ...invoice, patient: patient || undefined };
        })
      );
      setInvoices(invoicesWithPatient);
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des factures",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const patientsData = await patientService.getAllPatients();
      setPatients(patientsData);
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des patients",
        variant: "destructive"
      });
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
        toast({
          title: "Succès",
          description: "Facture supprimée avec succès"
        });
      } catch (err: any) {
        toast({
          title: "Erreur",
          description: "Erreur lors de la suppression de la facture",
          variant: "destructive"
        });
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
        const updatedInvoice = await invoiceService.updateInvoice(selectedInvoice.id, invoiceData);
        const patient = await patientService.getPatientById(updatedInvoice.patientId);
        setInvoices(
          invoices.map((invoice) => (invoice.id === updatedInvoice.id ? { ...updatedInvoice, patient: patient || undefined } : invoice))
        );
        toast({
          title: "Succès",
          description: "Facture modifiée avec succès"
        });
      } else {
        const newInvoice = await invoiceService.createInvoice(invoiceData);
        const patient = await patientService.getPatientById(newInvoice.patientId);
        setInvoices([...invoices, { ...newInvoice, patient: patient || undefined }]);
        toast({
          title: "Succès",
          description: "Facture créée avec succès"
        });
      }
      closeForm();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de la facture",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-orange-100 text-orange-800',
      unpaid: 'bg-red-100 text-red-800'
    };
    const labels = {
      paid: 'Payé',
      partial: 'Partiel',
      unpaid: 'Impayé'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.patient 
      ? `${invoice.patient.firstName} ${invoice.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
      : invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Factures</h1>
          <p className="text-gray-600">Gestion des factures et paiements</p>
        </div>
        <button
          onClick={openForm}
          className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
          disabled={loading}
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle facture</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par patient ou numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="paid">Payé</option>
              <option value="partial">Partiel</option>
              <option value="unpaid">Impayé</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune facture</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Aucune facture ne correspond aux critères' 
              : 'Créez votre première facture'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{invoice.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {invoice.patient ? `${invoice.patient.firstName} ${invoice.patient.lastName}` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">{invoice.amount} €</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPreviewInvoice(invoice)}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                        title="Aperçu PDF"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => invoice.patient && printInvoice(invoice.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Imprimer PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="text-orange-600 hover:text-orange-800 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
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

      {/* Modal aperçu PDF */}
      {previewInvoice && previewInvoice.patient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Aperçu de la facture</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => printInvoice(previewInvoice.id)}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Imprimer</span>
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
            <InvoicePDF invoice={previewInvoice} patient={previewInvoice.patient} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
