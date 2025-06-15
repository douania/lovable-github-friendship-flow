
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
  console.log('App component rendering...');
  
  try {
    const { user, loading, isAuthenticated } = useAuth();
    const [activeModule, setActiveModule] = useState('dashboard');
    const [preselectedForfait, setPreselectedForfait] = useState<Forfait | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    console.log('App state:', { user: user ? 'exists' : 'null', loading, isAuthenticated });

    // Show loading while checking authentication
    if (loading) {
      console.log('Showing loading screen');
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
      console.log('User not authenticated, showing login screen');
      return (
        <div className="min-h-screen" style={{ backgroundColor: '#FDF6F3' }}>
          <Auth onAuthSuccess={() => {}} />
        </div>
      );
    }

    console.log('User authenticated, showing main app');

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
        console.log('Rendering module:', activeModule);
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
              <details className="mt-2">
                <summary className="text-red-600 text-sm cursor-pointer">Détails de l'erreur</summary>
                <pre className="text-xs mt-1 text-red-500">{String(error)}</pre>
              </details>
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
  } catch (error) {
    console.error('Critical error in App component:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Erreur critique</h1>
          <p className="text-red-600 mb-4">L'application a rencontré une erreur critique.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Recharger la page
          </button>
          <details className="mt-4 text-left">
            <summary className="text-red-600 cursor-pointer">Détails de l'erreur</summary>
            <pre className="text-xs mt-2 text-red-500 bg-red-100 p-2 rounded overflow-auto">
              {String(error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

export default App;
