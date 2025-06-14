
import React from 'react';
import { User, Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  user?: any;
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onToggleSidebar }) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      await signOut();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-40">
      <div className="px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-300 to-orange-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold" style={{ color: '#2E2E2E' }}>Skin 101</h1>
              <p className="text-sm" style={{ color: '#6B7280' }}>Cabinet de Médecine Esthétique</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium" style={{ color: '#2E2E2E' }}>
              {user?.email || 'Dr. Aïcha Mbaye'}
            </p>
            <p className="text-xs" style={{ color: '#6B7280' }}>Praticienne</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-pink-200 to-orange-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#2E2E2E' }} />
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#6B7280' }} />
          </button>
          <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <Settings className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#6B7280' }} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
