
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
import Calendar from './components/modules/Calendar';
import Consultations from './components/modules/Consultations';
import Quotes from './components/modules/Quotes';
import { Forfait } from './types';

function App() {
  const { user, loading, isAuthenticated, criticalError } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [preselectedForfait, setPreselectedForfait] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Ecran erreur globale si état critique
  if (criticalError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center max-w-lg flex flex-col gap-6 p-4">
          <div className="text-3xl font-bold text-red-700">Erreur critique</div>
          <div className="bg-white rounded-xl border border-red-200 text-red-800 p-6 shadow">{criticalError}</div>
          <div className="text-sm text-gray-600">
            - Vérifiez que Supabase est bien configuré<br />
            - Testez en ouvrant l’app dans un nouvel onglet<br />
            - Contactez le support si le problème persiste
          </div>
        </div>
      </div>
    );
  }

  // Loading classique
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

  // Show login page if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FDF6F3' }}>
        <Auth onAuthSuccess={() => {}} />
      </div>
    );
  }

  const handleForfaitSelection = (forfait: Forfait) => {
    setPreselectedForfait(forfait);
    setActiveModule('invoices');
  };

  const clearPreselectedForfait = () => {
    setPreselectedForfait(null);
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const renderModule = () => {
    try {
      switch (activeModule) {
        case 'dashboard':
          return <Dashboard />;
        case 'calendar':
          return <Calendar />;
        case 'patients':
          return <Patients />;
        case 'consultations':
          return <Consultations />;
        case 'treatments':
          return <TreatmentCatalog onForfaitSelect={handleForfaitSelection} />;
        case 'quotes':
          return <Quotes />;
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
    } catch (error) {
      console.error('Error rendering module:', error);
      return (
        <div className="p-4 md:p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
            <p className="text-red-600 text-sm mt-1">
              Une erreur est survenue lors du chargement du module. Veuillez rafraîchir la page.
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FDF6F3' }}>
      <Header user={user} onToggleSidebar={handleToggleSidebar} />
      <div className="flex flex-1 relative">
        {/* Sidebar overlay for mobile */}
        {sidebarVisible && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarVisible(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300 ease-in-out z-50
          fixed md:static h-full
        `}>
          <Sidebar 
            activeModule={activeModule} 
            onModuleChange={(module) => {
              setActiveModule(module);
              setSidebarVisible(false); // Close mobile sidebar when selecting
            }}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto h-screen">
          <div className="min-h-full">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
