import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface RevenueChartProps {
  data: ChartData[];
  title?: string;
  height?: number;
}

export function RevenueChart({ data, title = "Revenus" }: RevenueChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  const average = useMemo(() => total / (data.length || 1), [total, data.length]);
  
  const trend = useMemo(() => {
    if (data.length < 2) return 0;
    const lastValue = data[data.length - 1].value;
    const previousValue = data[data.length - 2].value;
    return previousValue > 0 ? ((lastValue - previousValue) / previousValue) * 100 : 0;
  }, [data]);

  return (
    <div className="card-elegant p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Total: {total.toLocaleString()} FCFA
          </p>
        </div>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
            trend > 0 ? 'bg-success-light text-success' : 'bg-destructive/10 text-destructive'
          }`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-semibold">
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const isAboveAverage = item.value >= average;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">{item.label}</span>
                <span className="text-foreground font-semibold">
                  {item.value.toLocaleString()} FCFA
                </span>
              </div>
              <div className="relative h-8 bg-muted/30 rounded-lg overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ${
                    item.color || 
                    (isAboveAverage ? 'bg-gradient-to-r from-primary to-primary-glow' : 'bg-gradient-to-r from-muted to-muted-foreground/20')
                  }`}
                  style={{ width: `${percentage}%` }}
                >
                  <div className="absolute inset-0 flex items-center justify-end pr-3">
                    <span className="text-xs font-medium text-white drop-shadow">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Moyenne</span>
            <span className="text-foreground font-semibold">
              {average.toLocaleString()} FCFA
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
