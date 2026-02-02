import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Appointment, CompletionReason } from '../../types';
import { 
  useAppointmentsQuery, 
  useCreateAppointmentMutation, 
  useUpdateAppointmentMutation 
} from '../../queries/appointments.queries';
import { usePatientsQuery } from '../../queries/patients.queries';
import { 
  useActivePatientForfaitsQuery, 
  useDecrementSessionMutation 
} from '../../queries/patientForfaits.queries';
import { getErrorMessage } from '../../lib/errorMessage';
import { treatmentService } from '../../services/treatmentService';
import { productService } from '../../services/productService';
import { invoiceService } from '../../services/invoiceService';
import AppointmentForm from '../forms/AppointmentForm';
import AppointmentFilters from '../appointments/AppointmentFilters';
import AppointmentsList from '../appointments/AppointmentsList';
import { usePaginatedData } from '../../hooks/usePaginatedData';
import PaginationControls from '../ui/PaginationControls';
import { useToast } from '../../hooks/use-toast';
import { logger } from '../../lib/logger';
import ErrorBanner from '../ui/ErrorBanner';

// Phase 3B - Pilier 4: Labels pour les raisons de fin de RDV
const COMPLETION_REASON_LABELS: Record<CompletionReason, string> = {
  invoiced: 'Créer la facture',
  included_in_forfait: 'Inclus dans un forfait',
  free: 'Gratuit',
  pending_invoice: 'Facturer plus tard',
  other: 'Autre'
};

const Appointments: React.FC = () => {
  // TanStack Query hooks
  const { 
    data: appointments = [], 
    isLoading: loading, 
    isError, 
    error: queryError 
  } = useAppointmentsQuery();
  
  const { data: patients = [] } = usePatientsQuery();
  
  const createMutation = useCreateAppointmentMutation();
  const updateMutation = useUpdateAppointmentMutation();

  const [treatments, setTreatments] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [patientFilter, setPatientFilter] = useState<string>('all');
  const [treatmentFilter, setTreatmentFilter] = useState<string>('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [appointmentForInvoice, setAppointmentForInvoice] = useState<Appointment | null>(null);
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  // Phase 3B - Pilier 4: State pour la raison de completion
  // Correction CTO: null par défaut pour forcer un choix explicite
  const [selectedCompletionReason, setSelectedCompletionReason] = useState<CompletionReason | null>(null);
  // Phase 3D: State pour le forfait sélectionné
  const [selectedPatientForfaitId, setSelectedPatientForfaitId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Phase 3D: Query pour récupérer les forfaits actifs du patient quand le modal est ouvert
  const { data: activePatientForfaits = [] } = useActivePatientForfaitsQuery(
    appointmentForInvoice?.patientId
  );
  const decrementSessionMutation = useDecrementSessionMutation();

  // Error message for display
  const currentErrorMessage = isError ? getErrorMessage(queryError) : null;

  // Reset du dismissed quand une nouvelle erreur arrive
  React.useEffect(() => {
    if (currentErrorMessage && currentErrorMessage !== dismissedError) {
      setDismissedError(null);
    }
  }, [currentErrorMessage, dismissedError]);

  // Charger les traitements au montage
  React.useEffect(() => {
    const loadTreatments = async () => {
      try {
        const data = await treatmentService.getActive();
        setTreatments(data);
      } catch (err) {
        logger.error('Erreur lors du chargement des traitements', err);
      }
    };
    loadTreatments();
  }, []);

  // Filtrer les rendez-vous avec tous les critères
  const filteredAppointments = appointments.filter(apt => {
    // Filtre par date unique ou plage
    let matchesDate = true;
    if (dateRangeStart && dateRangeEnd) {
      matchesDate = apt.date >= dateRangeStart && apt.date <= dateRangeEnd;
    } else if (selectedDate) {
      matchesDate = apt.date === selectedDate;
    }
    
    // Filtre par statut
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    
    // Filtre par patient
    const matchesPatient = patientFilter === 'all' || apt.patientId === patientFilter;
    
    // Filtre par traitement
    const matchesTreatment = treatmentFilter === 'all' || apt.treatmentId === treatmentFilter;
    
    // Recherche textuelle (nom patient ou traitement)
    let matchesSearch = true;
    if (searchTerm) {
      const patientName = getPatientName(apt.patientId).toLowerCase();
      const treatmentName = getTreatmentName(apt.treatmentId).toLowerCase();
      matchesSearch = patientName.includes(searchTerm.toLowerCase()) || 
                     treatmentName.includes(searchTerm.toLowerCase());
    }
    
    return matchesDate && matchesStatus && matchesPatient && matchesTreatment && matchesSearch;
  });

  // Utiliser la pagination intelligente pour les rendez-vous filtrés
  const {
    paginatedData: paginatedAppointments,
    pagination,
    totalItems
  } = usePaginatedData({
    data: filteredAppointments,
    searchTerm: '',
    searchFields: [],
    initialPageSize: 10,
    sortKey: 'time',
    sortDirection: 'asc'
  });

  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    // GUARD: empêcher double submit
    if (createMutation.isPending || updateMutation.isPending) return;
    
    try {
      if (editingAppointment) {
        await updateMutation.mutateAsync({ id: editingAppointment.id, data: appointmentData });
        
        // Toast succès APRÈS mutation réussie (jamais en finally)
        toast({
          title: "Succès",
          description: "Rendez-vous modifié avec succès"
        });
        
        if (appointmentData.status === 'completed' && appointmentData.consumedProducts && appointmentData.consumedProducts.length > 0) {
          await processConsumedProducts(appointmentData.consumedProducts);
        }
        
        if (appointmentData.status === 'completed') {
          const fullAppointment = { ...appointmentData, id: editingAppointment.id };
          setAppointmentForInvoice(fullAppointment as Appointment);
          setShowInvoiceModal(true);
        }
      } else {
        await createMutation.mutateAsync(appointmentData);
        
        // Toast succès APRÈS mutation réussie (jamais en finally)
        toast({
          title: "Succès",
          description: "Rendez-vous créé avec succès"
        });
      }
      
      setShowAddModal(false);
      setEditingAppointment(null);
      // Pas de refetch() manuel - invalidation automatique via TanStack Query
    } catch (err) {
      logger.error('Erreur lors de la sauvegarde du rendez-vous', err);
      toast({
        title: "Erreur",
        description: getErrorMessage(err),
        variant: "destructive"
      });
    }
  };

  const processConsumedProducts = async (consumedProducts: Array<{ productId: string; quantity: number; }>) => {
    try {
      for (const item of consumedProducts) {
        await productService.decrementProductQuantity(item.productId, item.quantity);
      }
    } catch (err) {
      logger.error('Erreur lors de la mise à jour du stock', err);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    // GUARD: empêcher double mise à jour
    if (updateMutation.isPending) return;
    
    try {
      if (status === 'completed') {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          setEditingAppointment(appointment);
          setShowAddModal(true);
        }
      } else {
        // Récupérer l'appointment complet et mettre à jour seulement le statut
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          const updatedAppointment: Omit<Appointment, 'id'> = {
            ...appointment,
            status
          };
          await updateMutation.mutateAsync({ id: appointmentId, data: updatedAppointment });
          
          // Toast succès APRÈS mutation réussie (jamais en finally)
          toast({
            title: "Succès",
            description: "Statut du rendez-vous mis à jour"
          });
        }
      }
    } catch (err) {
      logger.error('Erreur lors de la mise à jour du statut', err);
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  };

  const getTreatmentName = (treatmentId: string) => {
    const treatment = treatments.find(t => t.id === treatmentId);
    return treatment ? treatment.name : 'Soin inconnu';
  };

  const createInvoiceFromAppointment = async (reason: CompletionReason) => {
    // GUARD: empêcher double création facture
    if (!appointmentForInvoice || isCreatingInvoice) return;
    
    // Phase 3D: Si forfait sélectionné, vérifier qu'un forfait est choisi
    if (reason === 'included_in_forfait' && !selectedPatientForfaitId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un forfait",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreatingInvoice(true);
    try {
      // Phase 3D: Décrémenter le forfait si applicable
      if (reason === 'included_in_forfait' && selectedPatientForfaitId) {
        await decrementSessionMutation.mutateAsync(selectedPatientForfaitId);
        logger.info('Séance décrémentée du forfait', { patientForfaitId: selectedPatientForfaitId });
      }
      
      // Phase 3B - Pilier 4: Mettre à jour le RDV avec la raison de completion
      const updatedAppointmentData: Omit<Appointment, 'id'> = {
        ...appointmentForInvoice,
        completionReason: reason
      };
      await updateMutation.mutateAsync({ 
        id: appointmentForInvoice.id, 
        data: updatedAppointmentData 
      });

      // Si "invoiced", créer la facture
      if (reason === 'invoiced') {
        const treatment = treatments.find(t => t.id === appointmentForInvoice.treatmentId);
        const invoiceData = {
          patientId: appointmentForInvoice.patientId,
          treatmentIds: [appointmentForInvoice.treatmentId],
          amount: treatment?.price || 0,
          status: 'unpaid' as const,
          paymentMethod: 'cash' as const,
          createdAt: new Date().toISOString(),
        };
        
        await invoiceService.create(invoiceData);
        
        toast({
          title: "Facture créée",
          description: "La facture a été créée avec succès",
        });
      } else if (reason === 'included_in_forfait') {
        toast({
          title: "Séance utilisée",
          description: "La séance a été déduite du forfait",
        });
      } else {
        // Juste enregistrer la raison
        const reasonLabel = COMPLETION_REASON_LABELS[reason];
        toast({
          title: "RDV terminé",
          description: `Raison enregistrée: ${reasonLabel}`,
        });
      }
      
      setShowInvoiceModal(false);
      setAppointmentForInvoice(null);
      setSelectedCompletionReason(null);
      setSelectedPatientForfaitId(null);
    } catch (err) {
      logger.error('Erreur création facture', err);
      toast({
        title: "Erreur",
        description: getErrorMessage(err),
        variant: "destructive"
      });
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rendez-vous</h1>
          <p className="text-muted-foreground">Gestion de l'agenda</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau RDV</span>
        </button>
      </div>

      {isError && currentErrorMessage !== dismissedError && (
        <ErrorBanner
          description={currentErrorMessage || 'Une erreur s\'est produite'}
          onDismiss={() => setDismissedError(currentErrorMessage)}
        />
      )}

      <AppointmentFilters
        viewMode={viewMode}
        selectedDate={selectedDate}
        statusFilter={statusFilter}
        appointmentsCount={totalItems}
        onViewModeChange={setViewMode}
        onDateChange={setSelectedDate}
        onStatusFilterChange={setStatusFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        patientFilter={patientFilter}
        onPatientFilterChange={setPatientFilter}
        treatmentFilter={treatmentFilter}
        onTreatmentFilterChange={setTreatmentFilter}
        dateRangeStart={dateRangeStart}
        onDateRangeStartChange={setDateRangeStart}
        dateRangeEnd={dateRangeEnd}
        onDateRangeEndChange={setDateRangeEnd}
        patients={patients}
        treatments={treatments}
      />

      <div className="space-y-4">
        <AppointmentsList
          appointments={paginatedAppointments}
          loading={loading}
          getPatientName={getPatientName}
          getTreatmentName={getTreatmentName}
          onUpdateStatus={updateAppointmentStatus}
        />
        
        {totalItems > 0 && (
          <PaginationControls
            pagination={pagination}
            className="mt-6"
            showPageSizeSelector={true}
            showInfo={true}
          />
        )}
      </div>

      {(showAddModal || editingAppointment) && (
        <AppointmentForm
          appointment={editingAppointment || undefined}
          patients={patients}
          treatments={treatments}
          selectedDate={selectedDate}
          onSave={handleSaveAppointment}
          onCancel={() => {
            setShowAddModal(false);
            setEditingAppointment(null);
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {showInvoiceModal && appointmentForInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Terminer le rendez-vous</h3>
            <p className="text-muted-foreground mb-4">
              Le rendez-vous est terminé. Comment souhaitez-vous le finaliser ?
            </p>
            
            {/* Phase 3B - Pilier 4: Choix de la raison */}
            <div className="space-y-2 mb-6">
              {(Object.entries(COMPLETION_REASON_LABELS) as [CompletionReason, string][]).map(([value, label]) => (
                <label 
                  key={value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCompletionReason === value 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="completionReason"
                    value={value}
                    checked={selectedCompletionReason === value}
                    onChange={() => {
                      setSelectedCompletionReason(value);
                      // Reset forfait selection quand on change de raison
                      if (value !== 'included_in_forfait') {
                        setSelectedPatientForfaitId(null);
                      }
                    }}
                    className="mr-3 text-primary focus:ring-primary"
                  />
                  <span className="text-foreground">{label}</span>
                </label>
              ))}
            </div>
            
            {/* Phase 3D: Sélection du forfait si "included_in_forfait" est choisi */}
            {selectedCompletionReason === 'included_in_forfait' && (
              <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-3">
                  Sélectionner le forfait à utiliser
                </h4>
                {activePatientForfaits.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Ce patient n'a aucun forfait actif. Vous pouvez en vendre un depuis sa fiche.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activePatientForfaits.map((pf) => (
                      <label 
                        key={pf.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPatientForfaitId === pf.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:bg-background'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="patientForfait"
                            value={pf.id}
                            checked={selectedPatientForfaitId === pf.id}
                            onChange={() => setSelectedPatientForfaitId(pf.id)}
                            className="mr-3 text-primary focus:ring-primary"
                          />
                          <div>
                            <span className="text-foreground font-medium">
                              {pf.forfait?.nom || 'Forfait'}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              Expire le {new Date(pf.expiryDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {pf.remainingSessions}/{pf.totalSessions} séances
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-4">
              <button 
                onClick={() => selectedCompletionReason && createInvoiceFromAppointment(selectedCompletionReason)}
                disabled={
                  isCreatingInvoice || 
                  !selectedCompletionReason ||
                  (selectedCompletionReason === 'included_in_forfait' && !selectedPatientForfaitId)
                }
                className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingInvoice ? 'Traitement...' : 'Confirmer'}
              </button>
              <button 
                onClick={() => {
                  setShowInvoiceModal(false);
                  setAppointmentForInvoice(null);
                  setSelectedCompletionReason(null);
                  setSelectedPatientForfaitId(null);
                }}
                className="flex-1 bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
