import { ChevronRight, Home } from 'lucide-react';
import { NavigationState } from '../../types';

interface SoinsBreadcrumbProps {
  navigation: NavigationState;
  onNavigate: (level: NavigationState['level'], appareilId?: string, zoneId?: string) => void;
}

export function SoinsBreadcrumb({ navigation, onNavigate }: SoinsBreadcrumbProps) {
  return (
    <div className="bg-white border border-border rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">
          Navigation
        </span>
        
        <button
          onClick={() => onNavigate('appareils')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
            navigation.level === 'appareils' 
              ? 'bg-primary text-white shadow-sm' 
              : 'bg-gray-100 text-muted-foreground hover:bg-primary-light hover:text-primary'
          }`}
          title="Retour à la liste des appareils"
        >
          <Home className="w-4 h-4" />
          <span className="font-medium">Appareils</span>
        </button>

        {navigation.selectedAppareilId && navigation.selectedAppareilName && (
          <>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
            <button
              onClick={() => onNavigate('zones', navigation.selectedAppareilId)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                navigation.level === 'zones' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-gray-100 text-muted-foreground hover:bg-primary-light hover:text-primary'
              }`}
              title="Retour aux zones"
            >
              <span className="font-medium">{navigation.selectedAppareilName}</span>
            </button>
          </>
        )}

        {navigation.selectedZoneId && navigation.selectedZoneName && (
          <>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
            <div className="px-3 py-2 bg-primary text-white rounded-lg shadow-sm">
              <span className="font-medium">{navigation.selectedZoneName}</span>
            </div>
          </>
        )}

        {navigation.level === 'all' && (
          <>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
            <div className="px-3 py-2 bg-primary text-white rounded-lg shadow-sm">
              <span className="font-medium">Tous les soins</span>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        {navigation.level === 'appareils' && '📍 Sélectionnez un appareil pour voir ses zones'}
        {navigation.level === 'zones' && '📍 Sélectionnez une zone pour voir ses soins'}
        {navigation.level === 'soins' && '📍 Liste des soins disponibles pour cette zone'}
        {navigation.level === 'all' && '📍 Vue d\'ensemble de tous les soins'}
      </div>
    </div>
  );
}
