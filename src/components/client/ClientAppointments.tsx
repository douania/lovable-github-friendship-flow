
import React from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

const ClientAppointments: React.FC = () => {
  const upcomingAppointments = [
    {
      id: '1',
      treatment: 'Soin du visage anti-âge',
      date: '2025-01-15',
      time: '14:00',
      duration: 60,
      practitioner: 'Dr. Martin',
      status: 'confirmed',
      location: 'Salle 1'
    },
    {
      id: '2',
      treatment: 'Épilation laser jambes',
      date: '2025-01-22',
      time: '10:30',
      duration: 45,
      practitioner: 'Dr. Dubois',
      status: 'confirmed',
      location: 'Salle 2'
    }
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mes rendez-vous</h1>
        <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
          Demander un RDV
        </button>
      </div>

      {/* Prochains rendez-vous */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Prochains rendez-vous</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {appointment.treatment}
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
                      <span>{appointment.time} ({appointment.duration} min)</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{appointment.practitioner}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{appointment.location}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-6">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Modifier
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
};

export default ClientAppointments;
