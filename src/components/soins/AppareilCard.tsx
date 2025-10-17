import { Appareil } from '../../types';
import { ChevronRight } from 'lucide-react';

interface AppareilCardProps {
  appareil: Appareil;
  soinsCount: number;
  zonesCount: number;
  onClick: () => void;
}

export function AppareilCard({ appareil, soinsCount, zonesCount, onClick }: AppareilCardProps) {
  return (
    <div
      onClick={onClick}
      className="card-elegant group cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {appareil.icone && (
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-2xl">
              {appareil.icone}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {appareil.nom}
            </h3>
            {appareil.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {appareil.description}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-light">
          <span className="text-xs font-medium text-primary">{soinsCount}</span>
          <span className="text-xs text-muted-foreground">soin{soinsCount > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
          <span className="text-xs font-medium text-foreground">{zonesCount}</span>
          <span className="text-xs text-muted-foreground">zone{zonesCount > 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
