
import React from 'react';
import { 
  Home, 
  Users, 
  Scissors, 
  DollarSign, 
  Calendar, 
  FileText, 
  BarChart3, 
  Package,
  Gift,
  Calculator,
  CalendarDays,
  Stethoscope,
  Receipt,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule, 
  onModuleChange, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'calendar', label: 'Planning', icon: CalendarDays },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'consultations', label: 'Consultations', icon: Stethoscope },
    { id: 'treatments', label: 'Catalogue soins', icon: Scissors },
    { id: 'quotes', label: 'Devis', icon: Receipt },
    { id: 'pricelist', label: 'Tarifs', icon: DollarSign },
    { id: 'pricing-consumables', label: 'Tarifs & Consommables', icon: Calculator },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
    { id: 'invoices', label: 'Facturation', icon: FileText },
    { id: 'analytics', label: 'Analyses', icon: BarChart3 },
    { id: 'inventory', label: 'Stock', icon: Package },
    { id: 'forfaits', label: 'Forfaits', icon: Gift },
  ];

  return (
    <aside className={`
      ${isCollapsed ? 'w-16' : 'w-64'} 
      bg-white shadow-sm border-r border-pink-100 h-screen overflow-y-auto transition-all duration-300 flex-shrink-0
      ${isCollapsed ? 'md:w-16' : 'md:w-64'}
      ${isCollapsed ? 'hidden md:block' : 'block'}
    `}>
      <div className="p-4">
        {/* Toggle Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isCollapsed ? 'Développer la sidebar' : 'Réduire la sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`
                  w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} 
                  px-4 py-3 rounded-lg text-left transition-colors group
                  ${activeModule === item.id 
                    ? 'bg-gradient-to-r from-pink-100 to-orange-100 text-pink-800 border border-pink-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
