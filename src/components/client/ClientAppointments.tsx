
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, X } from 'lucide-react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types';
import AppointmentBooking from './AppointmentBooking';
import { useToast } from '../../hooks/use-toast';

const ClientAppointments: React.FC = () => {
  const [showBooking, setShowBooking] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { client } = useClientAuth();
  const { toast } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (client?.patientId) {
      loadAppointments();
    }
  }, [client]);

  const loadAppointments = async () => {
    if (!client?.patientId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getByPatient(client.patientId);
      
      // Filtrer pour ne garder que les rendez-vous futurs et triés
      const upcomingAppts = data
        .filter(apt => new Date(`${apt.date}T${apt.time}`) > new Date())
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
      
      setAppointments(upcomingAppts);
    } catch (err) {
      console.error('Erreur lors du chargement des rendez-vous:', err);
      setError('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const handleCancelAppointment = async (appointmentId: string, appointmentDate: string, appointmentTime: string) => {
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      toast({
        title: "Annulation impossible",
        description: "Vous devez annuler au moins 24h avant le rendez-vous",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      setCancellingId(appointmentId);
      try {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          await appointmentService.update(appointmentId, {
            ...appointment,
            status: 'cancelled'
          });
          
          await loadAppointments();
          
          toast({
            title: "Rendez-vous annulé",
            description: "Votre rendez-vous a été annulé avec succès"
          });
        }
      } catch (err) {
        console.error('Erreur lors de l\'annulation:', err);
        toast({
          title: "Erreur",
          description: "Impossible d'annuler le rendez-vous",
          variant: "destructive"
        });
      } finally {
        setCancellingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mes rendez-vous</h1>
        <button 
          onClick={() => setShowBooking(true)}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
        >
          Demander un RDV
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Prochains rendez-vous */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Prochains rendez-vous</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des rendez-vous...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun rendez-vous programmé</h3>
            <p className="text-gray-500">Demandez votre prochain rendez-vous pour prendre soin de vous !</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Traitement (ID: {appointment.treatmentId})
                      </h3>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(appointment.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Institut de Beauté</span>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-6">
                    <button
                      onClick={() => handleCancelAppointment(appointment.id, appointment.date, appointment.time)}
                      disabled={cancellingId === appointment.id || appointment.status === 'cancelled'}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        appointment.status === 'cancelled' 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {cancellingId === appointment.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span>{appointment.status === 'cancelled' ? 'Annulé' : 'Annuler'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conseils pré-rendez-vous */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Conseils pour vos rendez-vous
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Arrivez 10 minutes avant votre rendez-vous</li>
          <li>• Apportez une pièce d'identité</li>
          <li>• Portez des vêtements confortables</li>
          <li>• Évitez l'exposition au soleil 48h avant un soin</li>
          <li>• N'hésitez pas à poser vos questions</li>
        </ul>
      </div>

      {/* Modal de réservation */}
      {showBooking && (
        <AppointmentBooking onClose={() => setShowBooking(false)} />
      )}
    </div>
  );
};

export default ClientAppointments;
