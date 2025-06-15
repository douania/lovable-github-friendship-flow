
import { useState, useEffect, createContext, useContext } from 'react';
import { clientAuthService } from '../services/clientAuthService';
import { ClientAuthContext, ClientAccess } from '../types/client';

const ClientAuthContext = createContext<ClientAuthContext | undefined>(undefined);

export const ClientAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [client, setClient] = useState<ClientAccess | null>(null);
  const [patient, setPatient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateSession();
  }, []);

  const validateSession = async () => {
    try {
      const { client: clientData, patient: patientData, error } = await clientAuthService.validateSession();
      
      if (!error && clientData) {
        setClient(clientData);
        setPatient(patientData);
      }
    } catch (error) {
      console.error('Session validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { client: clientData, error } = await clientAuthService.signIn(email, password);
    
    if (!error && clientData) {
      setClient(clientData);
      // Recharger les données du patient
      await validateSession();
    }
    
    return { error };
  };

  const signOut = async () => {
    await clientAuthService.signOut();
    setClient(null);
    setPatient(null);
  };

  const value = {
    client,
    patient,
    loading,
    isAuthenticated: !!client,
    signIn,
    signOut,
  };

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
};

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (context === undefined) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
};
