import { ChevronRight, Home } from 'lucide-react';
import { NavigationState } from '../../types';

interface SoinsBreadcrumbProps {
  navigation: NavigationState;
  onNavigate: (level: NavigationState['level'], appareilId?: string, zoneId?: string) => void;
}

export function SoinsBreadcrumb({ navigation, onNavigate }: SoinsBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={() => onNavigate('appareils')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary-light hover:text-primary transition-colors ${
          navigation.level === 'appareils' ? 'text-primary font-medium' : 'text-muted-foreground'
        }`}
      >
        <Home className="w-4 h-4" />
        Appareils
      </button>

      {navigation.selectedAppareilId && navigation.selectedAppareilName && (
        <>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => onNavigate('zones', navigation.selectedAppareilId)}
            className={`px-3 py-1.5 rounded-lg hover:bg-primary-light hover:text-primary transition-colors ${
              navigation.level === 'zones' ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            {navigation.selectedAppareilName}
          </button>
        </>
      )}

      {navigation.selectedZoneId && navigation.selectedZoneName && (
        <>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-primary font-medium">{navigation.selectedZoneName}</span>
        </>
      )}

      {navigation.level === 'all' && (
        <>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-primary font-medium">Tous les soins</span>
        </>
      )}
    </div>
  );
}
