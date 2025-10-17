import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Appointment } from '../../types';
import { useAppointments } from '../../hooks/useAppointments';
import { usePatients } from '../../hooks/usePatients';
import { treatmentService } from '../../services/treatmentService';
import { productService } from '../../services/productService';
import { invoiceService } from '../../services/invoiceService';
import AppointmentForm from '../forms/AppointmentForm';
import AppointmentFilters from '../appointments/AppointmentFilters';
import AppointmentsList from '../appointments/AppointmentsList';
import { usePaginatedData } from '../../hooks/usePaginatedData';
import PaginationControls from '../ui/PaginationControls';
import { useToast } from '../../hooks/use-toast';

const Appointments: React.FC = () => {
  const { appointments, loading, error, refetch, updateAppointment, createAppointment } = useAppointments();
  const { patients } = usePatients();
  const [treatments, setTreatments] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [appointmentForInvoice, setAppointmentForInvoice] = useState<Appointment | null>(null);
  const { toast } = useToast();

  // Charger les traitements au montage
  React.useEffect(() => {
    const loadTreatments = async () => {
      try {
        const data = await treatmentService.getActive();
        setTreatments(data);
      } catch (err) {
        console.error('Erreur lors du chargement des traitements:', err);
      }
    };
    loadTreatments();
  }, []);

  // Filtrer les rendez-vous par date et statut
  const dateFilteredAppointments = appointments.filter(apt => {
    const matchesDate = apt.date === selectedDate;
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesDate && matchesStatus;
  });

  // Utiliser la pagination intelligente pour les rendez-vous filtrés
  const {
    paginatedData: paginatedAppointments,
    pagination,
    totalItems
  } = usePaginatedData({
    data: dateFilteredAppointments,
    searchTerm: '', // Pas de recherche textuelle pour les rendez-vous pour l'instant
    searchFields: [],
    initialPageSize: 10,
    sortKey: 'time',
    sortDirection: 'asc'
  });

  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, appointmentData);
        
        if (appointmentData.status === 'completed' && appointmentData.consumedProducts && appointmentData.consumedProducts.length > 0) {
          await processConsumedProducts(appointmentData.consumedProducts);
        }
        
        if (appointmentData.status === 'completed') {
          const fullAppointment = { ...appointmentData, id: editingAppointment.id };
          setAppointmentForInvoice(fullAppointment as Appointment);
          setShowInvoiceModal(true);
        }
      } else {
        await createAppointment(appointmentData);
      }
      
      setShowAddModal(false);
      setEditingAppointment(null);
      refetch();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du rendez-vous:', err);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde du rendez-vous",
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
      console.error('Erreur lors de la mise à jour du stock:', err);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
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
          await updateAppointment(appointmentId, updatedAppointment);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
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

  const createInvoiceFromAppointment = async () => {
    if (!appointmentForInvoice) return;
    
    try {
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
      
      setShowInvoiceModal(false);
      setAppointmentForInvoice(null);
    } catch (err) {
      console.error('Erreur création facture:', err);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de la facture",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rendez-vous</h1>
          <p className="text-gray-600">Gestion de l'agenda</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau RDV</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <AppointmentFilters
        viewMode={viewMode}
        selectedDate={selectedDate}
        statusFilter={statusFilter}
        appointmentsCount={totalItems}
        onViewModeChange={setViewMode}
        onDateChange={setSelectedDate}
        onStatusFilterChange={setStatusFilter}
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
        />
      )}

      {showInvoiceModal && appointmentForInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Créer la facture ?</h3>
            <p className="text-gray-600 mb-6">
              Le rendez-vous est terminé. Voulez-vous créer la facture maintenant ?
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={createInvoiceFromAppointment}
                className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Créer la facture
              </button>
              <button 
                onClick={() => {
                  setShowInvoiceModal(false);
                  setAppointmentForInvoice(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
