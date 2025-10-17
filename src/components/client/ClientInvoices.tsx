
import React, { useState, useEffect } from 'react';
import { Download, Eye, Search, Filter } from 'lucide-react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { invoiceService } from '../../services/invoiceService';
import { patientService } from '../../services/patientService';
import { Invoice } from '../../types';
import { InvoicePDF, printInvoice } from '../invoices/InvoicePDF';
import { useToast } from '../../hooks/use-toast';

const ClientInvoices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const { client } = useClientAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (client?.patientId) {
      loadInvoices();
    }
  }, [client]);

  const loadInvoices = async () => {
    if (!client?.patientId) return;
    
    try {
      setLoading(true);
      const data = await invoiceService.getByPatient(client.patientId);
      setInvoices(data);
    } catch (err) {
      console.error('Erreur lors du chargement des factures:', err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'pending':
        return 'En attente';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'partial').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mes factures</h1>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{totalAmount.toFixed(0)} FCFA</p>
            <p className="text-sm text-gray-600">Total payé</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{pendingAmount.toFixed(0)} FCFA</p>
            <p className="text-sm text-gray-600">En attente</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{invoices.length}</p>
            <p className="text-sm text-gray-600">Factures totales</p>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">Tous les statuts</option>
              <option value="paid">Payées</option>
              <option value="partial">Partiellement payées</option>
              <option value="unpaid">Impayées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Liste des factures</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {invoice.id}
                      </h3>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <p><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
                        <p><strong>Mode de paiement:</strong> {invoice.paymentMethod === 'cash' ? 'Espèces' :
                           invoice.paymentMethod === 'card' ? 'Carte' :
                           invoice.paymentMethod === 'bank_transfer' ? 'Virement' :
                           invoice.paymentMethod === 'mobile_money' ? 'Mobile Money' : 'N/A'}</p>
                      </div>
                      <div>
                        <p><strong>Montant:</strong> <span className="font-semibold">{invoice.amount.toFixed(0)} FCFA</span></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-6">
                    <button
                      onClick={async () => {
                        try {
                          const patient = await patientService.getPatientById(invoice.patientId);
                          if (patient) {
                            setPreviewInvoice({ ...invoice, patient } as any);
                          }
                        } catch (err) {
                          toast({
                            title: "Erreur",
                            description: "Impossible de charger l'aperçu",
                            variant: "destructive"
                          });
                        }
                      }}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Voir</span>
                    </button>
                    <button
                      onClick={() => printInvoice(invoice.id)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      <Download className="h-4 w-4" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal aperçu PDF */}
      {previewInvoice && (previewInvoice as any).patient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Facture {previewInvoice.id}</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => printInvoice(previewInvoice.id)}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger PDF</span>
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
            <InvoicePDF invoice={previewInvoice} patient={(previewInvoice as any).patient} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientInvoices;
