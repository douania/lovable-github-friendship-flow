
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Package, 
  FileText, 
  BarChart3, 
  Scissors, 
  ShoppingCart,
  UserCheck,
  Save,
  Settings 
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleChange, isCollapsed }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'patients', name: 'Patients', icon: Users },
    { id: 'appointments', name: 'Rendez-vous', icon: Calendar },
    { id: 'treatments', name: 'Soins', icon: Scissors },
    { id: 'inventory', name: 'Stock', icon: Package },
    { id: 'invoices', name: 'Factures', icon: FileText },
    { id: 'quotes', name: 'Devis', icon: ShoppingCart },
    { id: 'consultations', name: 'Consultations', icon: UserCheck },
    { id: 'analytics', name: 'Analyses', icon: BarChart3 },
    { id: 'backup', name: 'Sauvegardes', icon: Save },
  ];

  return (
    <aside className={`bg-white shadow-lg transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full`}>
      <div className="p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-gray-800">Institut</h2>
        )}
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onModuleChange(item.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeModule === item.id
                    ? 'bg-pink-100 text-pink-700 border-r-2 border-pink-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => onModuleChange('settings')}
          className={`w-full flex items-center p-3 rounded-lg transition-colors ${
            activeModule === 'settings'
              ? 'bg-pink-100 text-pink-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={isCollapsed ? 'Paramètres' : ''}
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3">Paramètres</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
