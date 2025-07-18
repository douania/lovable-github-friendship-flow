
import React, { useState, useEffect } from 'react';
import { Calendar, FileText, User, Clock, CreditCard } from 'lucide-react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types';

const ClientDashboard: React.FC = () => {
  const { patient, client } = useClientAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (client?.patientId) {
      loadDashboardData();
    }
  }, [client]);

  const loadDashboardData = async () => {
    if (!client?.patientId) return;
    
    try {
      const appointmentsData = await appointmentService.getByPatient(client.patientId);
      
      // Filtrer les rendez-vous futurs
      const upcomingAppointments = appointmentsData
        .filter(apt => new Date(`${apt.date}T${apt.time}`) > new Date())
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
        .slice(0, 5); // Les 5 prochains
      
      setAppointments(upcomingAppointments);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    {
      name: 'Prochains RDV',
      value: appointments.length.toString(),
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      name: 'Total consultations',
      value: '12', // TODO: calculer depuis l'historique
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      name: 'Factures en attente',
      value: '0', // TODO: récupérer les factures
      icon: CreditCard,
      color: 'bg-purple-500'
    },
    {
      name: 'Documents',
      value: '5', // TODO: récupérer les documents
      icon: FileText,
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de bienvenue */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Bonjour {patient?.first_name} {patient?.last_name}
            </h1>
            <p className="text-pink-100">
              Bienvenue dans votre espace personnel
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prochains rendez-vous */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Prochains rendez-vous</h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Aucun rendez-vous programmé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 3).map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Traitement (ID: {appointment.treatmentId})</p>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {appointment.status === 'scheduled' ? 'Programmé' : 
                   appointment.status === 'completed' ? 'Terminé' : 
                   appointment.status === 'cancelled' ? 'Annulé' : appointment.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dernières factures */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dernières factures</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Facture #INV-2025-001</p>
                <p className="text-sm text-gray-600">5 janvier 2025</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">85,00 €</p>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Payée
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Facture #INV-2024-125</p>
                <p className="text-sm text-gray-600">20 décembre 2024</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">120,00 €</p>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Payée
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
