
import React from 'react';
import { Menu, LogOut, User, ExternalLink } from 'lucide-react';
import NotificationCenter from '../notifications/NotificationCenter';
import { GlobalSearch } from '../ui/GlobalSearch';
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
    <header className="bg-card shadow-elegant-sm border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-primary-light hover:text-primary transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-foreground hidden sm:block">
            Institut de Beauté
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <GlobalSearch onSelect={(result) => console.log('Selected:', result)} />
          <NotificationCenter />
          
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground font-medium">
              {user?.user_metadata?.first_name || user?.email || 'Utilisateur'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={openClientPortal}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary-light transition-all duration-200"
              title="Espace Client"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
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
