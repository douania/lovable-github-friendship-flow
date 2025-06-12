import React, { useState } from 'react';
import { Search, Plus, Download, Eye, DollarSign, Calendar, CreditCard, X } from 'lucide-react';
import { Invoice, Soin } from '../../types';
import { patientService } from '../../services/patientService';
import { treatmentService } from '../../services/treatmentService';
import { soinService } from '../../services/soinService';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import InvoiceForm from '../forms/InvoiceForm';
import { generateInvoicePDF } from '../../utils/invoiceGenerator';

import { Forfait } from '../../types';

interface InvoicesProps {
  preselectedForfait?: Forfait | null;
  onClearPreselected?: () => void;
}

const Invoices: React.FC<InvoicesProps> = ({ preselectedForfait, onClearPreselected }) => {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [patients, setPatients] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [allSoins, setAllSoins] = useState<Soin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Charger les données au montage du composant
  React.useEffect(() => {
    loadData();
  }, []);

  // Gérer les soins pré-sélectionnés depuis un forfait
  React.useEffect(() => {
    if (preselectedForfait && !loading) {
      setShowAddModal(true);
      // Nettoyer le forfait pré-sélectionné après ouverture du modal
      if (onClearPreselected) {
        setTimeout(() => onClearPreselected(), 100);
      }
    }
  }, [preselectedForfait, loading, onClearPreselected]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les patients, traitements et soins en parallèle
      const [patientsData, treatmentsData, soinsData] = await Promise.all([
        patientService.getAll(),
        treatmentService.getActive(),
        soinService.getAllActive()
      ]);
      
      setPatients(patientsData);
      setTreatments(treatmentsData);
      setAllSoins(soinsData);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données. Vérifiez votre connexion Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const mockInvoices: Invoice[] = [
    {
      id: 'INV-001',
      patientId: '1',
      treatmentIds: ['1'],
      amount: 150000,
      status: 'paid',
      paymentMethod: 'card',
      createdAt: '2024-02-25',
      paidAt: '2024-02-25'
    },
    {
      id: 'INV-002',
      patientId: '2',
      treatmentIds: ['2'],
      amount: 75000,
      status: 'partial',
      paymentMethod: 'cash',
      createdAt: '2024-02-24'
    },
    {
      id: 'INV-003',
      patientId: '1',
      treatmentIds: ['3'],
      amount: 200000,
      status: 'unpaid',
      paymentMethod: 'mobile_money',
      createdAt: '2024-02-23'
    }
  ];

  const allInvoices = [...invoices, ...mockInvoices];
  
  const filteredInvoices = allInvoices.filter(invoice => {
    const patient = patients.find(p => p.id === invoice.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';
    
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  };

  const getTreatmentNames = (treatmentIds: string[]) => {
    return treatmentIds.map(id => {
      // D'abord essayer de trouver dans les treatments (anciens soins)
      const treatment = treatments.find(t => t.id === id);
      if (treatment) {
        return treatment.name;
      }
      
      // Si pas trouvé dans treatments, chercher dans les soins du catalogue
      const soin = allSoins.find(s => s.id === id);
      if (soin) {
        return soin.nom;
      }
      
      // Si toujours pas trouvé
      return 'Soin inconnu';
    }).join(', ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Payé';
      case 'partial': return 'Partiel';
      case 'unpaid': return 'Impayé';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'card': return 'Carte';
      case 'mobile_money': return 'Mobile Money';
      case 'bank_transfer': return 'Virement';
      default: return method;
    }
  };

  const totalRevenue = allInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = allInvoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + i.amount, 0);

  const handleSaveInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    if (editingInvoice) {
      setInvoices(prev => prev.map(i => 
        i.id === editingInvoice.id 
          ? { ...invoiceData, id: editingInvoice.id }
          : i
      ));
    } else {
      const newInvoice: Invoice = {
        ...invoiceData,
        id: `INV-${String(Date.now()).slice(-6)}`
      };
      setInvoices(prev => [...prev, newInvoice]);
    }
    setShowAddModal(false);
    setEditingInvoice(null);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    const patient = patients.find(p => p.id === invoice.patientId);
    const invoiceTreatments = invoice.treatmentIds.map(id => {
      // D'abord chercher dans les treatments
      const treatment = treatments.find(t => t.id === id);
      if (treatment) return treatment;
      
      // Sinon chercher dans les soins
      const soin = allSoins.find(s => s.id === id);
      if (soin) {
        // Convertir le soin en format treatment pour la compatibilité
        return {
          id: soin.id,
          name: soin.nom,
          price: soin.prix,
          duration: soin.duree
        };
      }
      
      return null;
    }).filter(Boolean) as any[];
    
    if (patient) {
      generateInvoicePDF(invoice, patient, invoiceTreatments);
    }
  };

  const updateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(i => 
      i.id === invoiceId 
        ? { 
            ...i, 
            status,
            ...(status === 'paid' && !i.paidAt ? { paidAt: new Date().toISOString().split('T')[0] } : {})
          }
        : i
    ));
  };

  const InvoiceCard: React.FC<{ invoice: Invoice }> = ({ invoice }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{invoice.id}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
              {getStatusText(invoice.status)}
            </span>
          </div>
          <p className="text-gray-600">{getPatientName(invoice.patientId)}</p>
          <p className="text-sm text-gray-500">{getTreatmentNames(invoice.treatmentIds)}</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedInvoice(invoice)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
          <button 
            onClick={() => handleDownloadInvoice(invoice)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Montant</p>
            <p className="font-semibold text-gray-800">{invoice.amount.toLocaleString()} FCFA</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Paiement</p>
            <p className="font-semibold text-gray-800">{getPaymentMethodText(invoice.paymentMethod)}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>
        {invoice.status === 'unpaid' && (
          <button 
            onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
          >
            Marquer payé
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Facturation</h1>
          <p className="text-gray-600">Gestion des factures et paiements</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle Facture</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Revenus encaissés</p>
              <p className="text-2xl font-bold text-green-700">{totalRevenue.toLocaleString()} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Montants impayés</p>
              <p className="text-2xl font-bold text-red-700">{pendingAmount.toLocaleString()} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total factures</p>
              <p className="text-2xl font-bold text-blue-700">{allInvoices.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm underline mt-1"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une facture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="paid">Payé</option>
          <option value="partial">Partiel</option>
          <option value="unpaid">Impayé</option>
        </select>
        
        <div className="text-sm text-gray-600 bg-white px-4 py-3 rounded-xl border border-gray-200">
          {filteredInvoices.length} facture(s)
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des factures...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInvoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}

      {!loading && filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune facture trouvée</h3>
          <p className="text-gray-500">Aucune facture ne correspond à vos critères de recherche</p>
        </div>
      )}

      {(showAddModal || editingInvoice) && (
        <InvoiceForm
          invoice={editingInvoice || undefined}
          patients={patients}
          treatments={treatments}
          preselectedForfait={preselectedForfait}
          onSave={handleSaveInvoice}
          onCancel={() => {
            setShowAddModal(false);
            setEditingInvoice(null);
          }}
        />
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Détails de la facture</h2>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Informations facture</h3>
                  <p><strong>N°:</strong> {selectedInvoice.id}</p>
                  <p><strong>Date:</strong> {new Date(selectedInvoice.createdAt).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Statut:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedInvoice.status)}`}>
                    {getStatusText(selectedInvoice.status)}
                  </span></p>
                  <p><strong>Paiement:</strong> {getPaymentMethodText(selectedInvoice.paymentMethod)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Patient</h3>
                  <p><strong>Nom:</strong> {getPatientName(selectedInvoice.patientId)}</p>
                  <p><strong>Montant:</strong> {selectedInvoice.amount.toLocaleString()} FCFA</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Soins facturés</h3>
                <div className="space-y-2">
                  {selectedInvoice.treatmentIds.map(treatmentId => {
                    // D'abord chercher dans les treatments
                    const treatment = treatments.find(t => t.id === treatmentId);
                    if (treatment) {
                      return (
                        <div key={treatmentId} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span>{treatment.name}</span>
                          <span className="font-medium">{treatment.price.toLocaleString()} FCFA</span>
                        </div>
                      );
                    }
                    
                    // Sinon chercher dans les soins
                    const soin = allSoins.find(s => s.id === treatmentId);
                    if (soin) {
                      return (
                        <div key={treatmentId} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span>{soin.nom}</span>
                          <span className="font-medium">{soin.prix.toLocaleString()} FCFA</span>
                        </div>
                      );
                    }
                    
                    // Si aucun trouvé
                    return (
                      <div key={treatmentId} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Soin inconnu</span>
                        <span className="font-medium">- FCFA</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger</span>
                </button>
                {selectedInvoice.status === 'unpaid' && (
                  <button
                    onClick={() => {
                      updateInvoiceStatus(selectedInvoice.id, 'paid');
                      setSelectedInvoice(null);
                    }}
                    className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <span>Marquer payé</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;