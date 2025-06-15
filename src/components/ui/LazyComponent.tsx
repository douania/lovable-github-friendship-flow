
import React, { Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
}

function DefaultFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
      <span className="ml-2 text-gray-600">Chargement...</span>
    </div>
  );
}

function DefaultError() {
  return (
    <div className="flex items-center justify-center p-8 text-red-600">
      <span>Erreur lors du chargement du composant</span>
    </div>
  );
}

export function LazyComponent<T = {}>(
  LazyImport: () => Promise<{ default: ComponentType<T> }>,
  options: LazyComponentProps = {}
) {
  const { fallback = <DefaultFallback />, error = <DefaultError />, className } = options;
  
  const LazyLoadedComponent = React.lazy(LazyImport);

  return function WrappedLazyComponent(props: T) {
    return (
      <div className={className}>
        <Suspense fallback={fallback}>
          <React.ErrorBoundary fallback={error}>
            <LazyLoadedComponent {...props} />
          </React.ErrorBoundary>
        </Suspense>
      </div>
    );
  };
}

// Hook pour le lazy loading conditionnel
export function useLazyLoading(shouldLoad: boolean, delay = 100) {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (shouldLoad) {
      const timer = setTimeout(() => setIsReady(true), delay);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [shouldLoad, delay]);

  return isReady;
}
