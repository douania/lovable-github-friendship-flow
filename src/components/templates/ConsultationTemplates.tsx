import { useState } from 'react';
import { FileText, Plus, Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  notes: string;
  isFavorite: boolean;
  usageCount: number;
}

interface ConsultationTemplatesProps {
  onSelectTemplate: (template: Template) => void;
}

export function ConsultationTemplates({ onSelectTemplate }: ConsultationTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Consultation initiale',
      description: 'Première consultation avec analyse complète',
      category: 'Standard',
      notes: 'Antécédents médicaux\nContre-indications\nObjectifs du patient\nPlan de traitement recommandé',
      isFavorite: true,
      usageCount: 45
    },
    {
      id: '2',
      name: 'Suivi post-traitement',
      description: 'Consultation de suivi après un soin',
      category: 'Suivi',
      notes: 'Effets observés\nSatisfaction patient\nEffets secondaires\nProchaines étapes',
      isFavorite: false,
      usageCount: 28
    },
    {
      id: '3',
      name: 'Consultation express',
      description: 'Consultation rapide pour renouvellement',
      category: 'Express',
      notes: 'État actuel\nRenouvellement traitement\nProchain RDV',
      isFavorite: true,
      usageCount: 67
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);

  const toggleFavorite = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.usageCount - a.usageCount;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Templates de consultation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gagnez du temps avec des modèles pré-remplis
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nouveau template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTemplates.map((template) => (
          <div
            key={template.id}
            className="card-elegant p-4 hover:shadow-elegant-md transition-all group cursor-pointer"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary-light">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(template.id);
                }}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  template.isFavorite ? 'text-accent' : 'text-muted-foreground hover:text-accent'
                )}
              >
                <Star className={cn('w-4 h-4', template.isFavorite && 'fill-current')} />
              </button>
            </div>

            <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {template.name}
            </h4>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {template.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
                {template.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {template.usageCount} utilisations
              </span>
            </div>
          </div>
        ))}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-elegant-lg max-w-2xl w-full p-6 animate-scale-in">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Nouveau template de consultation
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="label-elegant">Nom du template</label>
                <input
                  type="text"
                  placeholder="Ex: Consultation post-injection"
                  className="input-elegant w-full"
                />
              </div>

              <div>
                <label className="label-elegant">Description</label>
                <input
                  type="text"
                  placeholder="Description courte du template"
                  className="input-elegant w-full"
                />
              </div>

              <div>
                <label className="label-elegant">Catégorie</label>
                <select className="input-elegant w-full">
                  <option value="standard">Standard</option>
                  <option value="suivi">Suivi</option>
                  <option value="express">Express</option>
                  <option value="specialise">Spécialisé</option>
                </select>
              </div>

              <div>
                <label className="label-elegant">Notes pré-remplies</label>
                <textarea
                  rows={6}
                  placeholder="Entrez les notes qui seront automatiquement ajoutées..."
                  className="input-elegant w-full resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setIsCreating(false)}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    // Save template logic
                    setIsCreating(false);
                  }}
                  className="btn-primary flex-1"
                >
                  Créer le template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
