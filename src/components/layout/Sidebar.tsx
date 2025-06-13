import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Package,
  Gift,
  DollarSign,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'treatments', label: 'Catalogue Soins', icon: Stethoscope },
  { id: 'pricelist', label: 'Liste des Prix', icon: DollarSign },
  { id: 'pricing-consumables', label: 'Tarifs & Consommables', icon: Settings },
  { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
  { id: 'invoices', label: 'Facturation', icon: FileText },
  { id: 'forfaits', label: 'Forfaits', icon: Gift },
  { id: 'analytics', label: 'Comptabilité', icon: TrendingUp },
  { id: 'inventory', label: 'Stock', icon: Package },
];

const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleChange }) => {
  return (
    <aside className="w-64 h-screen\" style={{ background: 'linear-gradient(to bottom, #F5C7D1, #D3BCE5)' }}>
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white shadow-md text-pink-600 transform scale-105'
                  : 'text-gray-700 hover:bg-white hover:bg-opacity-50 hover:text-gray-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-pink-600' : 'text-gray-600'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;