
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Starting application...');

const root = document.getElementById('root');

if (root) {
  try {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('Application rendered successfully');
  } catch (error) {
    console.error('Error rendering application:', error);
  }
} else {
  console.error('Root element not found');
}
