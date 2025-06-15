
import React from 'react';
import { Menu, LogOut, User, Settings, ExternalLink } from 'lucide-react';
import NotificationCenter from '../notifications/NotificationCenter';
import { supabase } from '../../integrations/supabase/client';

interface HeaderProps {
  user: any;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onToggleSidebar }) => {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openClientPortal = () => {
    // Ouvrir l'espace client dans un nouvel onglet
    window.open('/client', '_blank');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            Institut de Beauté
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <NotificationCenter />
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>
              {user?.user_metadata?.first_name || user?.email || 'Utilisateur'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={openClientPortal}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              title="Espace Client"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            
            <button
              className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
              title="Paramètres"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
