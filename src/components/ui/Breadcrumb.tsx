import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center gap-2 text-sm mb-6', className)}>
      <button
        onClick={items[0]?.onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary-light hover:text-primary transition-colors text-muted-foreground"
      >
        <Home className="w-4 h-4" />
      </button>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          
          {item.onClick && !item.isActive ? (
            <button
              onClick={item.onClick}
              className="px-3 py-1.5 rounded-lg hover:bg-primary-light hover:text-primary transition-colors text-muted-foreground"
            >
              {item.label}
            </button>
          ) : (
            <span className={cn(
              'px-3 py-1.5 rounded-lg',
              item.isActive ? 'text-primary font-medium' : 'text-muted-foreground'
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
