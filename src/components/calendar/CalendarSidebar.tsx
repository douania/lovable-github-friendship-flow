
import React from 'react';
import { Clock, User } from 'lucide-react';

interface Appointment {
  id: string;
  time: string;
  status: string;
  patientName?: string;
}

interface CalendarSidebarProps {
  selectedDate: string;
  availableSlots: string[];
  dayAppointments: Appointment[];
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  selectedDate,
  availableSlots,
  dayAppointments
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!selectedDate) return null;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-pink-500" />
          Créneaux disponibles
        </h3>
        <div className="text-sm text-gray-600 mb-3">
          {new Date(selectedDate).toLocaleDateString('fr-FR', { 
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {availableSlots.length > 0 ? (
            availableSlots.map((slot, index) => (
              <button
                key={index}
                className="p-2 text-sm border border-gray-200 rounded-lg hover:bg-pink-50 hover:border-pink-200 transition-colors"
              >
                {slot}
              </button>
            ))
          ) : (
            <div className="col-span-2 text-sm text-gray-500 text-center py-4">
              Aucun créneau disponible
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-pink-500" />
          Rendez-vous programmés
        </h3>
        <div className="space-y-2">
          {dayAppointments.map((apt) => (
            <div key={apt.id} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{apt.time}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(apt.status)}`}>
                  {apt.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {apt.patientName}
              </div>
            </div>
          ))}
          {dayAppointments.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              Aucun rendez-vous programmé
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarSidebar;
