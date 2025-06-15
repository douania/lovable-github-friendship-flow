
import React from 'react';
import { Clock } from 'lucide-react';

interface Appointment {
  id: string;
  patientId: string;
  treatmentId: string;
  date: string;
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
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {selectedDate ? formatDate(selectedDate) : 'Sélectionnez une date'}
        </h3>
        
        {selectedDate && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Rendez-vous du jour</h4>
              {dayAppointments.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun rendez-vous</p>
              ) : (
                <div className="space-y-2">
                  {dayAppointments
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((appointment) => (
                      <div key={appointment.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{appointment.time}</p>
                          <p className="text-xs text-gray-600">{appointment.patientName || 'Patient'}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            {availableSlots.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Créneaux disponibles</h4>
                <div className="space-y-1">
                  {availableSlots.map((slot) => (
                    <div key={slot} className="flex items-center space-x-2 p-2 bg-green-50 rounded text-sm">
                      <Clock className="w-3 h-3 text-green-600" />
                      <span className="text-green-800">{slot}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSidebar;
