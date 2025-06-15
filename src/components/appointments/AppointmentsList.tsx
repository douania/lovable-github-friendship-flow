
import React from 'react';
import { Calendar } from 'lucide-react';
import { Appointment } from '../../types';
import AppointmentCard from './AppointmentCard';

interface AppointmentsListProps {
  appointments: Appointment[];
  loading: boolean;
  getPatientName: (patientId: string) => string;
  getTreatmentName: (treatmentId: string) => string;
  onUpdateStatus: (appointmentId: string, status: Appointment['status']) => void;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointments,
  loading,
  getPatientName,
  getTreatmentName,
  onUpdateStatus
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des rendez-vous...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun rendez-vous</h3>
        <p className="text-gray-500">Aucun rendez-vous trouvé pour cette date</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {appointments
        .sort((a, b) => a.time.localeCompare(b.time))
        .map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            getPatientName={getPatientName}
            getTreatmentName={getTreatmentName}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
    </div>
  );
};

export default AppointmentsList;
