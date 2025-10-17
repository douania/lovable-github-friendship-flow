import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { ForfaitCategorie, ForfaitBadge } from '../../types';

interface ForfaitFiltersProps {
  selectedCategorie: ForfaitCategorie | 'all';
  selectedBadges: ForfaitBadge[];
  priceRange: [number, number];
  onCategorieChange: (categorie: ForfaitCategorie | 'all') => void;
  onBadgesChange: (badges: ForfaitBadge[]) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onReset: () => void;
}

export function ForfaitFilters({
  selectedCategorie,
  selectedBadges,
  priceRange,
  onCategorieChange,
  onBadgesChange,
  onPriceRangeChange,
  onReset
}: ForfaitFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categories: { value: ForfaitCategorie | 'all'; label: string }[] = [
    { value: 'all', label: 'Toutes catégories' },
    { value: 'decouverte', label: 'Découverte' },
    { value: 'premium', label: 'Premium' },
    { value: 'zone', label: 'Par Zone' },
    { value: 'saisonnier', label: 'Saisonnier' },
    { value: 'autre', label: 'Autre' }
  ];

  const badges: { value: ForfaitBadge; label: string }[] = [
    { value: 'bestseller', label: 'Best seller' },
    { value: 'nouveau', label: 'Nouveau' },
    { value: 'promo', label: 'Promotion' },
    { value: 'limite', label: 'Offre limitée' }
  ];

  const toggleBadge = (badge: ForfaitBadge) => {
    if (selectedBadges.includes(badge)) {
      onBadgesChange(selectedBadges.filter(b => b !== badge));
    } else {
      onBadgesChange([...selectedBadges, badge]);
    }
  };

  const hasActiveFilters = selectedCategorie !== 'all' || selectedBadges.length > 0 || 
    priceRange[0] > 0 || priceRange[1] < 1000000;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all duration-300 ${
            isOpen || hasActiveFilters
              ? 'bg-primary-light border-primary text-primary shadow-elegant-sm' 
              : 'border-border hover:bg-muted hover:border-primary/30'
          }`}
        >
          <Filter size={18} />
          <span className="font-medium">Filtres</span>
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
              {[selectedCategorie !== 'all' ? 1 : 0, selectedBadges.length].reduce((a, b) => a + b)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
            Réinitialiser
          </button>
        )}
      </div>

      {isOpen && (
        <div className="card-elegant p-6 space-y-6 animate-scale-in border-l-4 border-l-primary">
          <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
            <Filter size={20} className="text-primary" />
            Filtres avancés
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Catégorie
              </label>
              <select
                value={selectedCategorie}
                onChange={(e) => onCategorieChange(e.target.value as ForfaitCategorie | 'all')}
                className="input-elegant w-full"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fourchette de prix (FCFA)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => onPriceRangeChange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="input-elegant w-full text-center"
                  placeholder="Min"
                />
                <span className="text-muted-foreground font-medium">—</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value) || 1000000])}
                  className="input-elegant w-full text-center"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Badges */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Filtres spéciaux
              </label>
              <div className="flex flex-wrap gap-2">
                {badges.map(badge => (
                  <button
                    key={badge.value}
                    onClick={() => toggleBadge(badge.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedBadges.includes(badge.value)
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-primary-light hover:text-primary'
                    }`}
                  >
                    {badge.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
