import React, { useState } from 'react';
import { Calendar, Clock, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Appointment } from '../../types';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { treatmentService } from '../../services/treatmentService';
import { productService } from '../../services/productService';
import AppointmentForm from '../forms/AppointmentForm';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Charger les données au montage du composant
  React.useEffect(() => {
    loadData();
  }, []);

  // Recharger les rendez-vous quand la date change
  React.useEffect(() => {
    if (!loading) {
      loadAppointmentsByDate();
    }
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les patients et traitements en parallèle
      const [patientsData, treatmentsData] = await Promise.all([
        patientService.getAll(),
        treatmentService.getActive()
      ]);
      
      setPatients(patientsData);
      setTreatments(treatmentsData);
      
      // Charger les rendez-vous pour la date sélectionnée
      await loadAppointmentsByDate();
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données. Vérifiez votre connexion Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointmentsByDate = async () => {
    try {
      const data = await appointmentService.getByDate(selectedDate);
      setAppointments(data);
    } catch (err) {  
      console.error('Erreur lors du chargement des rendez-vous:', err);
      setError('Erreur lors du chargement des rendez-vous.');
    }
  };
  
  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesStatus;
  });

  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      setError(null);
      
      if (editingAppointment) {
        // Mise à jour d'un rendez-vous existant
        const updatedAppointment = await appointmentService.update(editingAppointment.id, appointmentData);
        setAppointments(prev => prev.map(a => 
          a.id === editingAppointment.id ? updatedAppointment : a
        ));

        // Si le rendez-vous est marqué comme terminé et qu'il y a des produits consommés
        if (appointmentData.status === 'completed' && appointmentData.consumedProducts && appointmentData.consumedProducts.length > 0) {
          await processConsumedProducts(appointmentData.consumedProducts);
        }
      } else {
        // Création d'un nouveau rendez-vous
        const newAppointment = await appointmentService.create(appointmentData);
        
        // Si le nouveau rendez-vous est pour la date sélectionnée, l'ajouter à la liste
        if (newAppointment.date === selectedDate) {
          setAppointments(prev => [...prev, newAppointment]);
        }

        // Si le rendez-vous est créé comme terminé et qu'il y a des produits consommés
        if (appointmentData.status === 'completed' && appointmentData.consumedProducts && appointmentData.consumedProducts.length > 0) {
          await processConsumedProducts(appointmentData.consumedProducts);
        }
      }
      
      // Recharger les données pour s'assurer que la liste des patients est à jour
      await loadData();
      
      setShowAddModal(false);
      setEditingAppointment(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du rendez-vous:', err);
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const processConsumedProducts = async (consumedProducts: Array<{ productId: string; quantity: number; }>) => {
    try {
      // Décrémenter la quantité de chaque produit consommé
      for (const item of consumedProducts) {
        await productService.decrementProductQuantity(item.productId, item.quantity);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du stock:', err);
      setError('Rendez-vous sauvegardé mais erreur lors de la mise à jour du stock.');
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    try {
      setError(null);
      
      if (status === 'completed') {
        // Pour marquer comme terminé, ouvrir le formulaire d'édition pour permettre la saisie des produits consommés
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          setEditingAppointment(appointment);
          setShowAddModal(true);
        }
      } else {
        // Pour les autres statuts, mettre à jour directement
        const updatedAppointment = await appointmentService.updateStatus(appointmentId, status);
        setAppointments(prev => prev.map(a => 
          a.id === appointmentId ? updatedAppointment : a
        ));
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError('Erreur lors de la mise à jour du statut.');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'no-show':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programmé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      case 'no-show': return 'Absent';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(appointment.status)}
          <div>
            <h3 className="font-semibold text-gray-800">{getPatientName(appointment.patientId)}</h3>
            <p className="text-sm text-gray-600">{getTreatmentName(appointment.treatmentId)}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
          {getStatusText(appointment.status)}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(appointment.date).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{appointment.time}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {appointment.status === 'scheduled' && (
            <>
              <button 
                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                title="Marquer comme terminé et gérer les produits consommés"
              >
                Terminer
              </button>
              <button 
                onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
              >
                Annuler
              </button>
            </>
          )}
        </div>
      </div>
      
      {appointment.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{appointment.notes}</p>
        </div>
      )}

      {appointment.consumedProducts && appointment.consumedProducts.length > 0 && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-sm font-medium text-orange-800 mb-1">Produits consommés:</p>
          <div className="text-sm text-orange-700">
            {appointment.consumedProducts.map((item, index) => (
              <span key={item.productId}>
                {index > 0 && ', '}
                {item.quantity}x produit
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

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
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm underline mt-1"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Liste
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'calendar' ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Calendrier
          </button>
        </div>
        
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="scheduled">Programmé</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
          <option value="no-show">Absent</option>
        </select>
        
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
          {filteredAppointments.length} RDV
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des rendez-vous...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun rendez-vous</h3>
            <p className="text-gray-500">Aucun rendez-vous trouvé pour cette date</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAppointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
          </div>
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
    </div>
  );
};

export default Appointments;
