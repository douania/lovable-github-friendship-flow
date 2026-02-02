import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.tsx'
import { AuthProvider } from './hooks/useAuth.tsx'
import { queryClient } from './lib/queryClient'
import { logger } from './lib/logger'
import './index.css'

logger.debug('=== MAIN.TSX STARTING ===');

const root = document.getElementById('root');

if (root) {
  try {
    logger.debug('Rendering React app...');
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </React.StrictMode>,
    );
    logger.debug('React app rendered successfully');
  } catch (error) {
    logger.error('Error rendering application:', error);
  }
} else {
  logger.error('Root element not found');
}
