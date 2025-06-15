
import React, { useState } from 'react';
import { Download, Eye, Search, Filter } from 'lucide-react';

const ClientInvoices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const invoices = [
    {
      id: 'INV-2025-001',
      date: '2025-01-05',
      amount: 85.00,
      status: 'paid',
      treatments: ['Soin du visage anti-âge'],
      paymentMethod: 'Carte bancaire',
      dueDate: '2025-01-19'
    },
    {
      id: 'INV-2024-125',
      date: '2024-12-20',
      amount: 120.00,
      status: 'paid',
      treatments: ['Épilation laser jambes'],
      paymentMethod: 'Espèces',
      dueDate: '2025-01-03'
    },
    {
      id: 'INV-2024-124',
      date: '2024-12-10',
      amount: 65.00,
      status: 'paid',
      treatments: ['Massage relaxant'],
      paymentMethod: 'Carte bancaire',
      dueDate: '2024-12-24'
    },
    {
      id: 'INV-2025-002',
      date: '2025-01-10',
      amount: 150.00,
      status: 'pending',
      treatments: ['Soin complet visage + massage'],
      paymentMethod: '-',
      dueDate: '2025-01-24'
    }
  ];

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
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.treatments.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mes factures</h1>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{totalAmount.toFixed(2)}€</p>
            <p className="text-sm text-gray-600">Total payé</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{pendingAmount.toFixed(2)}€</p>
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
              <option value="pending">En attente</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Liste des factures</h2>
        </div>
        
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
                      <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                      <p><strong>Échéance:</strong> {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p><strong>Mode de paiement:</strong> {invoice.paymentMethod}</p>
                      <p><strong>Montant:</strong> <span className="font-semibold">{invoice.amount.toFixed(2)}€</span></p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <strong>Soins:</strong> {invoice.treatments.join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-6">
                  <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
                    <Eye className="h-4 w-4" />
                    <span>Voir</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm font-medium">
                    <Download className="h-4 w-4" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientInvoices;
