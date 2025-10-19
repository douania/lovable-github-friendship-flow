import { useState } from 'react';
import { Download, FileText, Table, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ExportOption {
  id: string;
  label: string;
  icon: typeof FileText;
  format: 'csv' | 'pdf' | 'excel';
  description: string;
}

interface ExportMenuProps {
  onExport: (format: 'csv' | 'pdf' | 'excel') => void;
  disabled?: boolean;
}

export function ExportMenu({ onExport, disabled = false }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions: ExportOption[] = [
    {
      id: 'csv',
      label: 'Export CSV',
      icon: Table,
      format: 'csv',
      description: 'Compatible Excel, Google Sheets'
    },
    {
      id: 'pdf',
      label: 'Export PDF',
      icon: FileText,
      format: 'pdf',
      description: 'Document imprimable'
    }
  ];

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    onExport(format);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
          'bg-accent text-white hover:bg-accent/90',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Download className="w-4 h-4" />
        <span>Exporter</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-card rounded-xl shadow-elegant-lg border border-border z-50 overflow-hidden animate-scale-in">
            <div className="p-3 border-b border-border bg-gradient-to-r from-accent/10 to-accent/5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Download className="w-4 h-4 text-accent" />
                  Format d'export
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-2">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleExport(option.format)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Les données exportées respectent les filtres appliqués
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
