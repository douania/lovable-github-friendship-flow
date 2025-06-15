
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './hooks/useAuth.tsx'
import './index.css'

console.log('=== MAIN.TSX STARTING ===');

const root = document.getElementById('root');

if (root) {
  try {
    console.log('Rendering React app...');
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>,
    );
    console.log('React app rendered successfully');
  } catch (error) {
    console.error('Error rendering application:', error);
  }
} else {
  console.error('Root element not found');
}
