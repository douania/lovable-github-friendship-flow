
import React from 'react';
import { Calendar, FileText, User, Clock, CreditCard } from 'lucide-react';
import { useClientAuth } from '../../hooks/useClientAuth';

const ClientDashboard: React.FC = () => {
  const { patient } = useClientAuth();

  const quickStats = [
    {
      name: 'Prochains RDV',
      value: '2',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      name: 'Séances totales',
      value: '12',
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      name: 'Factures',
      value: '3',
      icon: CreditCard,
      color: 'bg-purple-500'
    },
    {
      name: 'Documents',
      value: '5',
      icon: FileText,
      color: 'bg-orange-500'
    }
  ];

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
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Soin du visage</p>
                <p className="text-sm text-gray-600">15 janvier 2025 à 14h00</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Confirmé
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Épilation laser</p>
                <p className="text-sm text-gray-600">22 janvier 2025 à 10h30</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Confirmé
            </span>
          </div>
        </div>
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
