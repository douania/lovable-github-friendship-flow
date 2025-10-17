import { Forfait, ForfaitCategorie, ForfaitBadge } from '../../types';
import { Package, Star, Zap, Sparkles, Clock } from 'lucide-react';

interface ForfaitCardProps {
  forfait: Forfait;
  onSelect: (forfait: Forfait) => void;
  onEdit: (forfait: Forfait) => void;
  onDelete: (id: string) => void;
  showSoinsDetails?: boolean;
}

export function ForfaitCard({ forfait, onSelect, onEdit, onDelete, showSoinsDetails = true }: ForfaitCardProps) {
  const calculateSavings = () => {
    if (forfait.prixTotal > forfait.prixReduit) {
      const savings = forfait.prixTotal - forfait.prixReduit;
      const percentage = Math.round((savings / forfait.prixTotal) * 100);
      return { savings, percentage };
    }
    return { savings: 0, percentage: 0 };
  };

  const { savings, percentage } = calculateSavings();

  const getBadgeConfig = (badge: ForfaitBadge) => {
    switch (badge) {
      case 'bestseller':
        return { icon: Star, label: 'Best seller', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      case 'nouveau':
        return { icon: Sparkles, label: 'Nouveau', className: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'promo':
        return { icon: Zap, label: 'Promo', className: 'bg-red-100 text-red-800 border-red-300' };
      case 'limite':
        return { icon: Clock, label: 'Offre limitée', className: 'bg-orange-100 text-orange-800 border-orange-300' };
      default:
        return null;
    }
  };

  const getCategorieLabel = (cat?: ForfaitCategorie) => {
    switch (cat) {
      case 'decouverte': return 'Découverte';
      case 'premium': return 'Premium';
      case 'zone': return 'Par Zone';
      case 'saisonnier': return 'Saisonnier';
      default: return 'Autre';
    }
  };

  return (
    <div className="card-elegant group hover:shadow-elegant-lg transition-all duration-300 relative overflow-hidden">
      {/* Discount ribbon */}
      {percentage > 0 && (
        <div className="absolute -right-12 top-6 rotate-45 bg-gradient-to-r from-success to-emerald-600 text-white px-16 py-1 text-sm font-bold shadow-lg z-10">
          -{percentage}%
        </div>
      )}

      {/* Badges */}
      {forfait.badges && forfait.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {forfait.badges.map((badge, idx) => {
            const config = getBadgeConfig(badge);
            if (!config) return null;
            const Icon = config.icon;
            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${config.className}`}
              >
                <Icon className="w-3 h-3" />
                {config.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {forfait.nom}
              </h3>
              {forfait.categorie && (
                <span className="text-xs text-muted-foreground">
                  {getCategorieLabel(forfait.categorie)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {forfait.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {forfait.description}
          </p>
        )}
      </div>

      {/* Soins inclus */}
      {showSoinsDetails && forfait.soins && forfait.soins.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <p className="text-xs font-medium text-muted-foreground mb-2">Soins inclus :</p>
          <div className="space-y-1">
            {forfait.soins.slice(0, 3).map((soin) => (
              <div key={soin.id} className="flex items-center gap-2 text-xs">
                {soin.appareil && (
                  <span className="text-primary">{soin.appareil.icone}</span>
                )}
                <span className="text-foreground">{soin.nom}</span>
                {soin.zone && (
                  <span className="text-muted-foreground">({soin.zone.nom})</span>
                )}
              </div>
            ))}
            {forfait.soins.length > 3 && (
              <p className="text-xs text-muted-foreground italic">
                +{forfait.soins.length - 3} autre(s) soin(s)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Package className="w-4 h-4 text-primary" />
          <span>{forfait.nbSeances} séances</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-4 h-4 text-primary" />
          <span>Valide {forfait.validiteMois} mois</span>
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4 p-4 rounded-lg bg-gradient-to-br from-primary-light to-accent-light">
        <div className="flex items-center justify-between">
          <div>
            {forfait.prixTotal > forfait.prixReduit && (
              <div className="text-sm text-muted-foreground line-through">
                {forfait.prixTotal.toLocaleString()} FCFA
              </div>
            )}
            <div className="text-2xl font-bold text-primary">
              {forfait.prixReduit.toLocaleString()} FCFA
            </div>
          </div>
          {savings > 0 && (
            <div className="text-right">
              <div className="text-xs text-success font-medium">Économie</div>
              <div className="text-lg font-bold text-success">
                {savings.toLocaleString()} FCFA
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <button
          onClick={() => onSelect(forfait)}
          className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          Sélectionner
        </button>
        <button
          onClick={() => onEdit(forfait)}
          className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <Package className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(forfait.id)}
          className="px-3 py-2 rounded-lg border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Status */}
      {!forfait.isActive && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
          <span className="px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium">
            Indisponible
          </span>
        </div>
      )}
    </div>
  );
}
