
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Appointment } from '../../types';
import { invoiceService } from '../../services/invoiceService';

interface AppointmentCardProps {
  appointment: Appointment;
  getPatientName: (patientId: string) => string;
  getTreatmentName: (treatmentId: string) => string;
  onUpdateStatus: (appointmentId: string, status: Appointment['status']) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  getPatientName,
  getTreatmentName,
  onUpdateStatus
}) => {
  const [hasInvoice, setHasInvoice] = useState(false);

  useEffect(() => {
    const checkInvoice = async () => {
      if (appointment.status === 'completed') {
        try {
          const invoices = await invoiceService.getByPatient(appointment.patientId);
          const found = invoices.some(inv => 
            inv.treatmentIds.includes(appointment.treatmentId)
          );
          setHasInvoice(found);
        } catch (err) {
          console.error('Error checking invoice:', err);
        }
      }
    };
    checkInvoice();
  }, [appointment]);

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

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(appointment.status)}
          <div>
            <h3 className="font-semibold text-gray-800">{getPatientName(appointment.patientId)}</h3>
            <p className="text-sm text-gray-600">{getTreatmentName(appointment.treatmentId)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </span>
          {hasInvoice && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              ✓ Facture créée
            </span>
          )}
        </div>
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
                onClick={() => onUpdateStatus(appointment.id, 'completed')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                title="Marquer comme terminé et gérer les produits consommés"
              >
                Terminer
              </button>
              <button 
                onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
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
};

export default AppointmentCard;
