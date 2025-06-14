
import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/modules/Dashboard';
import Patients from './components/modules/Patients';
import TreatmentCatalog from './components/modules/TreatmentCatalog';
import PriceList from './components/modules/PriceList';
import Appointments from './components/modules/Appointments';
import Invoices from './components/modules/Invoices';
import Analytics from './components/modules/Analytics';
import Inventory from './components/modules/Inventory';
import ForfaitManagement from './components/modules/ForfaitManagement';
import PricingAndConsumables from './components/modules/PricingAndConsumables';
import { Forfait } from './types';

function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [preselectedForfait, setPreselectedForfait] = useState<Forfait | null>(null);

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDF6F3' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  const handleForfaitSelection = (forfait: Forfait) => {
    setPreselectedForfait(forfait);
    setActiveModule('invoices');
  };

  const clearPreselectedForfait = () => {
    setPreselectedForfait(null);
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return <Patients />;
      case 'treatments':
        return <TreatmentCatalog onForfaitSelect={handleForfaitSelection} />;
      case 'pricelist':
        return <PriceList />;
      case 'pricing-consumables':
        return <PricingAndConsumables />;
      case 'appointments':
        return <Appointments />;
      case 'invoices':
        return <Invoices preselectedForfait={preselectedForfait} onClearPreselected={clearPreselectedForfait} />;
      case 'analytics':
        return <Analytics />;
      case 'inventory':
        return <Inventory />;
      case 'forfaits':
        return <ForfaitManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF6F3' }}>
      <Header user={user} />
      <div className="flex">
        <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        <main className="flex-1 overflow-y-auto h-screen">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}

export default App;
