import { Zone } from '../../types';
import { ChevronRight, MapPin } from 'lucide-react';

interface ZoneCardProps {
  zone: Zone;
  soinsCount: number;
  priceRange?: { min: number; max: number };
  onClick: () => void;
}

export function ZoneCard({ zone, soinsCount, priceRange, onClick }: ZoneCardProps) {
  return (
    <div
      onClick={onClick}
      className="card-elegant group cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {zone.nom}
            </h3>
            {zone.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {zone.description}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-light">
          <span className="text-xs font-medium text-primary">{soinsCount}</span>
          <span className="text-xs text-muted-foreground">soin{soinsCount > 1 ? 's' : ''}</span>
        </div>
        {priceRange && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{priceRange.min} FCFA</span>
            {priceRange.min !== priceRange.max && (
              <>
                {' - '}
                <span className="font-medium text-foreground">{priceRange.max} FCFA</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
