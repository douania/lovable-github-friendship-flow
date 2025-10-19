
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
    { id: 'consumption-reports', name: 'Consommation', icon: BarChart3 },
    { id: 'profitability', name: 'Rentabilité', icon: BarChart3 },
    { id: 'backup', name: 'Sauvegardes', icon: Save },
    { id: 'availability', name: 'Disponibilités', icon: Calendar },
  ];

  return (
    <aside className={`bg-card shadow-elegant-md transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    } flex flex-col h-full border-r border-border`}>
      <div className="p-4 border-b border-border">
        {!isCollapsed ? (
          <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Skin 101
          </h2>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">S1</span>
          </div>
        )}
      </div>
      
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onModuleChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  activeModule === item.id
                    ? 'bg-primary-light text-primary font-medium shadow-elegant-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  activeModule === item.id ? '' : 'opacity-70'
                }`} />
                {!isCollapsed && (
                  <span className="text-sm truncate">{item.name}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-3 border-t border-border">
        <button
          onClick={() => onModuleChange('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
            activeModule === 'settings'
              ? 'bg-primary-light text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          title={isCollapsed ? 'Paramètres' : ''}
        >
          <Settings className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:rotate-90 ${
            activeModule === 'settings' ? '' : 'opacity-70'
          }`} />
          {!isCollapsed && <span className="text-sm">Paramètres</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
