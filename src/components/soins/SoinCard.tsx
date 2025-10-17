import { Soin } from '../../types';
import { Clock, Euro, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

interface SoinCardProps {
  soin: Soin;
  viewMode: 'grid' | 'list';
  showAppareilZone?: boolean;
  onEdit: (soin: Soin) => void;
  onDelete: (id: string) => void;
}

export function SoinCard({ soin, viewMode, showAppareilZone = false, onEdit, onDelete }: SoinCardProps) {
  if (viewMode === 'grid') {
    return (
      <div className="card-elegant group hover:shadow-elegant transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {soin.nom}
            </h3>
            {showAppareilZone && (soin.appareil || soin.zone) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {soin.appareil && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-light text-xs text-primary">
                    {soin.appareil.icone} {soin.appareil.nom}
                  </span>
                )}
                {soin.zone && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground">
                    {soin.zone.nom}
                  </span>
                )}
              </div>
            )}
          </div>
          {soin.isActive && (
            <span className="px-2 py-1 rounded-lg bg-success-light text-xs font-medium text-success flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Actif
            </span>
          )}
        </div>

        {soin.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {soin.description}
          </p>
        )}

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>{soin.duree} min</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-primary">
            <Euro className="w-4 h-4" />
            <span>{soin.prix}€</span>
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t border-border">
          <button
            onClick={() => onEdit(soin)}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors flex items-center justify-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Modifier
          </button>
          <button
            onClick={() => onDelete(soin.id)}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer
          </button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="card-elegant group hover:shadow-elegant-sm transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {soin.nom}
              </h3>
              {soin.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {soin.description}
                </p>
              )}
              {showAppareilZone && (soin.appareil || soin.zone) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {soin.appareil && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-light text-xs text-primary">
                      {soin.appareil.icone} {soin.appareil.nom}
                    </span>
                  )}
                  {soin.zone && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground">
                      {soin.zone.nom}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>{soin.duree} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <Euro className="w-4 h-4" />
            <span>{soin.prix}€</span>
          </div>
          {soin.isActive && (
            <span className="px-2 py-1 rounded-lg bg-success-light text-xs font-medium text-success flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Actif
            </span>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(soin)}
              className="p-2 rounded-lg border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(soin.id)}
              className="p-2 rounded-lg border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
