
import React from 'react';
import { useClientAuth, ClientAuthProvider } from '../../hooks/useClientAuth';
import ClientLogin from './ClientLogin';
import ClientPortal from './ClientPortal';

const ClientAppContent: React.FC = () => {
  const { isAuthenticated, loading } = useClientAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <ClientPortal /> : <ClientLogin />;
};

const ClientApp: React.FC = () => {
  return (
    <ClientAuthProvider>
      <ClientAppContent />
    </ClientAuthProvider>
  );
};

export default ClientApp;
