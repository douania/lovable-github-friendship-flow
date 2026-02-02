
import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Search, Eye, Edit } from 'lucide-react';
import { consultationService } from '../../services/consultationService';
import { patientService } from '../../services/patientService';
import { soinService } from '../../services/soinService';
import { Consultation } from '../../types/consultation';
import ConsultationForm from '../forms/ConsultationForm';
import ConsultationDetails from '../forms/ConsultationDetails';
import { useToast } from '../../hooks/use-toast';
import { usePaginatedData } from '../../hooks/usePaginatedData';
import PaginationControls from '../ui/PaginationControls';

interface EnrichedConsultation extends Consultation {
  patientName?: string;
  soinName?: string;
}

const Consultations: React.FC = () => {
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<EnrichedConsultation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState<EnrichedConsultation | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<EnrichedConsultation | null>(null);

  // Use paginated data
  const {
    paginatedData: paginatedConsultations,
    pagination,
    totalItems,
    isFiltered
  } = usePaginatedData({
    data: consultations,
    searchTerm,
    searchFields: ['patientName', 'soinName'],
    initialPageSize: 20,
    sortKey: 'consultationDate',
    sortDirection: 'desc'
  });

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const consultationsData = await consultationService.getAllConsultations();
      
      // Enrichir avec les noms des patients et soins
      const enrichedConsultations = await Promise.all(
        consultationsData.map(async (consultation: Consultation) => {
          try {
            const [patient, soin] = await Promise.all([
              patientService.getById(consultation.patientId),
              soinService.getSoinById(consultation.soinId)
            ]);
            
            return {
              ...consultation,
              patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu',
              soinName: soin ? soin.nom : 'Soin inconnu'
            };
          } catch (error) {
            return { 
              ...consultation, 
              patientName: 'Patient inconnu',
              soinName: 'Soin inconnu'
            };
          }
        })
      );

      setConsultations(enrichedConsultations);
    } catch (error) {
      console.error('Erreur lors du chargement des consultations:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des consultations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConsultation = async (consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingConsultation) {
        await consultationService.updateConsultation(editingConsultation.id, consultationData);
        toast({
          title: "Succès",
          description: "Consultation modifiée avec succès"
        });
      } else {
        await consultationService.createConsultation(consultationData);
        toast({
          title: "Succès",
          description: "Consultation créée avec succès"
        });
      }
      
      setShowForm(false);
      setEditingConsultation(null);
      loadConsultations();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de la consultation",
        variant: "destructive"
      });
    }
  };

  const handleEditConsultation = (consultation: EnrichedConsultation) => {
    setEditingConsultation(consultation);
    setShowForm(true);
    setShowDetails(null);
  };

  const handleViewDetails = (consultation: EnrichedConsultation) => {
    setShowDetails(consultation);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-pink-500" />
          Consultations & Dossiers Médicaux
        </h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle consultation
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par patient ou type de soin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div className="ml-4 text-sm text-gray-600">
            {isFiltered ? `${totalItems} consultation(s) trouvée(s)` : `${totalItems} consultation(s)`}
          </div>
        </div>
      </div>

      {/* Liste des consultations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {totalItems === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">
              {isFiltered ? 'Aucune consultation trouvée' : 'Aucune consultation'}
            </p>
            <p>
              {isFiltered ? 'Aucune consultation ne correspond à votre recherche.' : 'Commencez par créer votre première consultation.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Soin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consentement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Satisfaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Photos
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedConsultations.map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {consultation.patientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {consultation.soinName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(consultation.consultationDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          consultation.consentSigned 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {consultation.consentSigned ? 'Signé' : 'Non signé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {consultation.satisfactionRating ? (
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span 
                                key={i}
                                className={`text-sm ${
                                  i < consultation.satisfactionRating! 
                                    ? 'text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Non évalué</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            consultation.photosBefore.length > 0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            Avant: {consultation.photosBefore.length}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            consultation.photosAfter.length > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            Après: {consultation.photosAfter.length}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleViewDetails(consultation)}
                            className="text-pink-600 hover:text-pink-900 p-1"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditConsultation(consultation)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <PaginationControls
              pagination={pagination}
              className="border-t-0"
            />
          </>
        )}
      </div>

      {/* Formulaire de consultation */}
      {showForm && (
        <ConsultationForm
          consultation={editingConsultation || undefined}
          onSave={handleSaveConsultation}
          onCancel={() => {
            setShowForm(false);
            setEditingConsultation(null);
          }}
        />
      )}

      {/* Détails de la consultation */}
      {showDetails && (
        <ConsultationDetails
          consultation={showDetails}
          onClose={() => setShowDetails(null)}
          onEdit={() => handleEditConsultation(showDetails)}
        />
      )}
    </div>
  );
};

export default Consultations;
