
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { userService } from '../services/userService';

// Ajout nouveau : expose l'état "criticalError"
interface UserWithRole extends User {
  role?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [criticalError, setCriticalError] = useState<string | null>(null);

  const fetchUserRole = async () => {
    try {
      const role = await userService.getCurrentUserRole();
      return role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'praticien';
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let cancelled = false;

    // Timeout de sécurité pour sortir du loading au bout de 10s
    timeoutId = setTimeout(() => {
      if (!cancelled && loading) {
        setCriticalError(
          "Impossible de récupérer l'état utilisateur (timeout). Problème Supabase ou localStorage."
        );
        setLoading(false);
      }
    }, 10000);

    // Get current session
    const getSession = async () => {
      try {
        console.log('[useAuth] Tentative récupération session Supabase...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[useAuth] Session reçue:', session);
        if (session?.user) {
          const role = await fetchUserRole();
          setUser({
            ...session.user,
            role
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setCriticalError('Erreur critique lors de la récupération de la session :' + String(error));
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        try {
          if (session?.user) {
            const role = await fetchUserRole();
            setUser({
              ...session.user,
              role
            });
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('Erreur authStateChange:', err);
        }
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    criticalError
  };
};
