
import React, { useState } from 'react';
import { LogOut, Home, Calendar, History, FileText, User } from 'lucide-react';
import { useClientAuth } from '../../hooks/useClientAuth';
import ClientDashboard from './ClientDashboard';
import ClientAppointments from './ClientAppointments';
import ClientHistory from './ClientHistory';
import ClientInvoices from './ClientInvoices';
import ClientProfile from './ClientProfile';

const ClientPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { client, patient, signOut } = useClientAuth();

  const tabs = [
    { id: 'dashboard', name: 'Tableau de bord', icon: Home },
    { id: 'appointments', name: 'Mes RDV', icon: Calendar },
    { id: 'history', name: 'Historique', icon: History },
    { id: 'invoices', name: 'Factures', icon: FileText },
    { id: 'profile', name: 'Mon Profil', icon: User },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ClientDashboard />;
      case 'appointments':
        return <ClientAppointments />;
      case 'history':
        return <ClientHistory />;
      case 'invoices':
        return <ClientInvoices />;
      case 'profile':
        return <ClientProfile />;
      default:
        return <ClientDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">IB</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Institut de Beauté</h1>
                <p className="text-sm text-gray-600">Espace Client</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {patient?.first_name} {patient?.last_name}
                </p>
                <p className="text-xs text-gray-600">{client?.email}</p>
              </div>
              
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-pink-100 text-pink-700 border-r-2 border-pink-500'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;
