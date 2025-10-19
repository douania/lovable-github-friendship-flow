import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'accent';
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color = 'primary',
  className 
}: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary-light text-primary',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    destructive: 'bg-destructive/10 text-destructive',
    accent: 'bg-secondary text-secondary-foreground'
  };

  return (
    <div className={cn('card-elegant p-6 hover:shadow-elegant-lg transition-all', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-3">{value}</p>
          
          {trend && (
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-xs font-semibold px-2 py-1 rounded-full',
                trend.value >= 0 ? 'bg-success-light text-success' : 'bg-destructive/10 text-destructive'
              )}>
                {trend.value >= 0 ? '+' : ''}{trend.value.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          'p-3 rounded-xl group-hover:scale-110 transition-transform',
          colorClasses[color]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
