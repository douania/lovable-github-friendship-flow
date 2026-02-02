import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ErrorBannerProps {
  title?: string;
  description: string;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

const variantStyles = {
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    description: 'text-red-700',
    button: 'text-red-500 hover:text-red-700 hover:bg-red-100'
  },
  warning: {
    container: 'bg-orange-50 border-orange-200',
    icon: 'text-orange-500',
    title: 'text-orange-800',
    description: 'text-orange-700',
    button: 'text-orange-500 hover:text-orange-700 hover:bg-orange-100'
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    description: 'text-blue-700',
    button: 'text-blue-500 hover:text-blue-700 hover:bg-blue-100'
  }
};

const variantIcons = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title,
  description,
  onDismiss,
  variant = 'error'
}) => {
  const styles = variantStyles[variant];
  const Icon = variantIcons[variant];
  const defaultTitle = variant === 'error' ? 'Erreur' : variant === 'warning' ? 'Attention' : 'Information';

  return (
    <div className={`mb-4 p-4 border rounded-xl ${styles.container}`}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${styles.icon}`} />
        <div className="flex-1 min-w-0">
          {(title || defaultTitle) && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title || defaultTitle}
            </h3>
          )}
          <p className={`text-sm mt-1 ${styles.description}`}>
            {description}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-3 p-1 rounded-lg flex-shrink-0 ${styles.button}`}
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
