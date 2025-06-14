
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
  Receipt
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleChange }) => {
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
    <aside className="w-64 bg-white shadow-sm border-r border-pink-100 h-screen overflow-y-auto">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                ${activeModule === item.id 
                  ? 'bg-gradient-to-r from-pink-100 to-orange-100 text-pink-800 border border-pink-200' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
