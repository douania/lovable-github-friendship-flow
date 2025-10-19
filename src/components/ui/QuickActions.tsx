import { Plus, Calendar, Users, Package, FileText } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: typeof Plus;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  onNewAppointment?: () => void;
  onNewPatient?: () => void;
  onNewProduct?: () => void;
  onNewInvoice?: () => void;
}

export function QuickActions({
  onNewAppointment,
  onNewPatient,
  onNewProduct,
  onNewInvoice
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions: QuickAction[] = [
    {
      id: 'appointment',
      label: 'Nouveau RDV',
      icon: Calendar,
      color: 'from-primary to-primary-glow',
      onClick: () => {
        onNewAppointment?.();
        setIsOpen(false);
      }
    },
    {
      id: 'patient',
      label: 'Nouveau Patient',
      icon: Users,
      color: 'from-accent to-accent',
      onClick: () => {
        onNewPatient?.();
        setIsOpen(false);
      }
    },
    {
      id: 'product',
      label: 'Nouveau Produit',
      icon: Package,
      color: 'from-success to-success',
      onClick: () => {
        onNewProduct?.();
        setIsOpen(false);
      }
    },
    {
      id: 'invoice',
      label: 'Nouvelle Facture',
      icon: FileText,
      color: 'from-warning to-warning',
      onClick: () => {
        onNewInvoice?.();
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Actions menu */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-3 animate-scale-in">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card shadow-elegant-md hover:shadow-elegant-lg transition-all group"
              >
                <div className={cn(
                  'p-2 rounded-lg bg-gradient-to-br',
                  action.color
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground whitespace-nowrap">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-elegant-lg hover:shadow-glow transition-all flex items-center justify-center group',
          isOpen && 'rotate-45'
        )}
      >
        <Plus className="w-6 h-6 text-white transition-transform" />
      </button>
    </div>
  );
}
