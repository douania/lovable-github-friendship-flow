
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Appointment } from '../../types';
import { useAppointments } from '../../hooks/useAppointments';
import { usePatients } from '../../hooks/usePatients';
import { patientService } from '../../services/patientService';
import { treatmentService } from '../../services/treatmentService';
import { productService } from '../../services/productService';
import AppointmentForm from '../forms/AppointmentForm';
import AppointmentFilters from '../appointments/AppointmentFilters';
import AppointmentsList from '../appointments/AppointmentsList';

const Appointments: React.FC = () => {
  const { appointments, loading, error, refetch, updateAppointment } = useAppointments();
  const { patients } = usePatients();
  const [treatments, setTreatments] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

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

  // Filtrer les rendez-vous
  const filteredAppointments = appointments.filter(apt => {
    const matchesDate = apt.date === selectedDate;
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesDate && matchesStatus;
  });

  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, appointmentData);
        
        // Si le rendez-vous est marqué comme terminé et qu'il y a des produits consommés
        if (appointmentData.status === 'completed' && appointmentData.consumedProducts && appointmentData.consumedProducts.length > 0) {
          await processConsumedProducts(appointmentData.consumedProducts);
        }
      } else {
        // Pour les nouveaux rendez-vous, utiliser le hook useAppointments
        // Note: Le hook devra être étendu pour supporter la création
        console.log('Création de nouveau rendez-vous à implémenter');
      }
      
      setShowAddModal(false);
      setEditingAppointment(null);
      refetch();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du rendez-vous:', err);
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
        await updateAppointment(appointmentId, { status });
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
        appointmentsCount={filteredAppointments.length}
        onViewModeChange={setViewMode}
        onDateChange={setSelectedDate}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="space-y-4">
        <AppointmentsList
          appointments={filteredAppointments}
          loading={loading}
          getPatientName={getPatientName}
          getTreatmentName={getTreatmentName}
          onUpdateStatus={updateAppointmentStatus}
        />
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
    </div>
  );
};

export default Appointments;
