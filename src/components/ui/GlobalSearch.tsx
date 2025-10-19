import { useState, useEffect, useRef } from 'react';
import { Search, Users, Calendar, Package, FileText, X } from 'lucide-react';
import type { Patient, Appointment, Product } from '../../types';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import { productService } from '../../services/productService';
import { cn } from '../../lib/utils';

export interface SearchResult {
  id: string;
  type: 'patient' | 'appointment' | 'product';
  title: string;
  subtitle: string;
  icon: typeof Users;
  data?: Patient | Appointment | Product;
}

interface GlobalSearchProps {
  onSelect?: (result: SearchResult) => void;
}

export function GlobalSearch({ onSelect }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Raccourci clavier Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Recherche avec debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const [patients, appointments, products] = await Promise.all([
          patientService.getAll(),
          appointmentService.getAll(),
          productService.getAll()
        ]);

        const searchQuery = query.toLowerCase();
        const searchResults: SearchResult[] = [];

        // Recherche patients
        patients
          .filter(p => 
            `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery) ||
            p.email?.toLowerCase().includes(searchQuery) ||
            p.phone?.includes(searchQuery)
          )
          .slice(0, 3)
          .forEach(p => {
            searchResults.push({
              id: p.id,
              type: 'patient',
              title: `${p.firstName} ${p.lastName}`,
              subtitle: p.email || p.phone || '',
              icon: Users
            });
          });

        // Recherche produits
        products
          .filter(p => 
            p.name.toLowerCase().includes(searchQuery) ||
            p.category?.toLowerCase().includes(searchQuery)
          )
          .slice(0, 3)
          .forEach(p => {
            searchResults.push({
              id: p.id,
              type: 'product',
              title: p.name,
              subtitle: `${p.quantity} en stock - ${(p.unitPrice || 0).toLocaleString()} FCFA`,
              icon: Package
            });
          });

        // Recherche rendez-vous
        appointments
          .filter(a => {
            const patient = patients.find(p => p.id === a.patientId);
            return patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery);
          })
          .slice(0, 3)
          .forEach(a => {
            const patient = patients.find(p => p.id === a.patientId);
            searchResults.push({
              id: a.id,
              type: 'appointment',
              title: `RDV - ${patient?.firstName} ${patient?.lastName}`,
              subtitle: `${a.date} à ${a.time}`,
              icon: Calendar
            });
          });

        setResults(searchResults);
      } catch (error) {
        console.error('Erreur recherche:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    onSelect?.(result);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Bouton de recherche */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline text-sm">Rechercher...</span>
        <kbd className="hidden md:inline px-2 py-0.5 text-xs bg-background border border-border rounded">
          ⌘K
        </kbd>
      </button>

      {/* Modal de recherche */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
          <div
            ref={containerRef}
            className="w-full max-w-2xl bg-card rounded-xl shadow-elegant-lg animate-scale-in"
          >
            {/* Input de recherche */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher patients, produits, rendez-vous..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Résultats */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : results.length > 0 ? (
                <div className="p-2">
                  {results.map((result) => {
                    const Icon = result.icon;
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelect(result)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div className={cn(
                          'p-2 rounded-lg',
                          result.type === 'patient' && 'bg-primary-light',
                          result.type === 'product' && 'bg-accent/10',
                          result.type === 'appointment' && 'bg-secondary'
                        )}>
                          <Icon className={cn(
                            'w-4 h-4',
                            result.type === 'patient' && 'text-primary',
                            result.type === 'product' && 'text-accent',
                            result.type === 'appointment' && 'text-secondary-foreground'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{result.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {result.type === 'patient' ? 'Patient' :
                           result.type === 'product' ? 'Produit' : 'RDV'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : query ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Aucun résultat trouvé</p>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Tapez pour rechercher</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-muted/30 rounded-b-xl">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">↑↓</kbd>
                    Naviguer
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">Enter</kbd>
                    Sélectionner
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">Esc</kbd>
                  Fermer
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
