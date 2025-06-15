
import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/modules/Dashboard';

function App() {
  console.log('=== APP STARTED ===');
  
  const { user, loading, isAuthenticated } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  console.log('App render - Auth state:', { 
    hasUser: !!user, 
    loading, 
    isAuthenticated,
    activeModule
  });

  // Show loading while checking authentication
  if (loading) {
    console.log('SHOWING LOADING SCREEN');
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDF6F3' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'application...</p>
          <p className="text-sm text-gray-500 mt-2">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!isAuthenticated) {
    console.log('SHOWING AUTH SCREEN');
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FDF6F3' }}>
        <Auth onAuthSuccess={() => console.log('Auth success callback')} />
      </div>
    );
  }

  console.log('SHOWING MAIN APP');

  const handleToggleSidebar = () => {
    console.log('Toggle sidebar');
    if (window.innerWidth < 768) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const renderModule = () => {
    console.log('Rendering module:', activeModule);
    
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Planning</h1>
            <p>Module Calendar simplifié</p>
          </div>
        );
      case 'patients':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Patients</h1>
            <p>Module Patients simplifié</p>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Module: {activeModule}</h1>
            <p>Module {activeModule} simplifié pour débogage</p>
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
              console.log('Module change to:', module);
              setActiveModule(module);
              setSidebarVisible(false);
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
