import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Eye, Edit, Trash2, Printer } from 'lucide-react';
import { quoteService } from '../../services/quoteService';
import { patientService } from '../../services/patientService';
import { soinService } from '../../services/soinService';
import { Quote } from '../../types/consultation';
import { Patient, Soin } from '../../types';
import QuoteForm from '../forms/QuoteForm';
import PrintableQuote from '../forms/PrintableQuote';
import { useToast } from '../../hooks/use-toast';

const Quotes: React.FC = () => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [soins, setSoins] = useState<Soin[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [printingQuote, setPrintingQuote] = useState<Quote | null>(null);
  const [quoteNumber, setQuoteNumber] = useState('');

  useEffect(() => {
    loadQuotes();
    loadPatients();
    loadSoins();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, statusFilter]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const quotesData = await quoteService.getAllQuotes();
      setQuotes(quotesData);
    } catch (error) {
      console.error('Erreur lors du chargement des devis:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les devis.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const patientsData = await patientService.getAllPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
    }
  };

  const loadSoins = async () => {
    try {
      const soinsData = await soinService.getAllActive();
      setSoins(soinsData);
    } catch (error) {
      console.error('Erreur lors du chargement des soins:', error);
    }
  };

  const filterQuotes = () => {
    let filtered = [...quotes];

    if (searchTerm) {
      filtered = filtered.filter(quote => {
        const patient = patients.find(p => p.id === quote.patientId);
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';
        return quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
               patientName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    setFilteredQuotes(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'sent': return 'Envoyé';
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  };

  const handleCreateQuote = async () => {
    try {
      const generatedQuoteNumber = await quoteService.generateQuoteNumber();
      setQuoteNumber(generatedQuoteNumber);
      setEditingQuote(null);
      setShowForm(true);
    } catch (error) {
      console.error('Erreur lors de la génération du numéro de devis:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer un numéro de devis.',
        variant: 'destructive'
      });
    }
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setQuoteNumber(quote.quoteNumber);
    setShowForm(true);
  };

  const handlePrintQuote = (quote: Quote) => {
    setPrintingQuote(quote);
    // Attendre un peu pour que le composant se rende avant d'imprimer
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleSaveQuote = async (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingQuote) {
        await quoteService.updateQuote(editingQuote.id, quoteData);
      } else {
        await quoteService.createQuote(quoteData);
      }
      
      setShowForm(false);
      setEditingQuote(null);
      await loadQuotes();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm('Ce devis et toutes les données associées seront définitivement supprimés. Cette action est irréversible. Voulez-vous continuer ?')) {
      return;
    }

    try {
      console.log('Suppression du devis avec ID:', id);
      toast({
        title: 'Information',
        description: 'Fonction de suppression à implémenter.',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le devis.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  // Mode impression
  if (printingQuote) {
    const patient = patients.find(p => p.id === printingQuote.patientId);
    if (patient) {
      return (
        <div className="print:block hidden">
          <PrintableQuote quote={printingQuote} patient={patient} soins={soins} />
          <button
            onClick={() => setPrintingQuote(null)}
            className="fixed top-4 right-4 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-lg print:hidden"
          >
            Fermer l'aperçu
          </button>
        </div>
      );
    }
  }

  return (
    <div className="p-6 space-y-6 print:hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-pink-500" />
          Devis
        </h1>
        <button 
          onClick={handleCreateQuote}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau devis
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro ou patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyé</option>
              <option value="accepted">Accepté</option>
              <option value="rejected">Refusé</option>
              <option value="expired">Expiré</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des devis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Aucun devis trouvé</p>
            <p>Commencez par créer votre premier devis.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valide jusqu'au
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {quote.quoteNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getPatientName(quote.patientId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {quote.totalAmount.toLocaleString()} FCFA
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                        {getStatusLabel(quote.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-pink-600 hover:text-pink-900 p-1">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditQuote(quote)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handlePrintQuote(quote)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Imprimer le devis"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulaire de devis */}
      {showForm && (
        <QuoteForm
          quote={editingQuote || undefined}
          initialQuoteNumber={quoteNumber}
          onSave={handleSaveQuote}
          onCancel={() => {
            setShowForm(false);
            setEditingQuote(null);
          }}
        />
      )}

      {/* Version imprimable cachée */}
      {printingQuote && (
        <div className="hidden print:block">
          <PrintableQuote 
            quote={printingQuote} 
            patient={patients.find(p => p.id === printingQuote.patientId)!} 
            soins={soins} 
          />
        </div>
      )}
    </div>
  );
};

export default Quotes;
