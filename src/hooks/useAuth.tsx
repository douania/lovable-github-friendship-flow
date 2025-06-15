
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { userService } from '../services/userService';

// Ajout : expose l'état "criticalError" et la cause précise
interface UserWithRole extends User {
  role?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [criticalError, setCriticalError] = useState<string | null>(null);

  // Ajout : tester l'accès à localStorage
  const testLocalStorage = () => {
    try {
      const testKey = '__lovable_test__';
      window.localStorage.setItem(testKey, 'ok');
      const val = window.localStorage.getItem(testKey);
      window.localStorage.removeItem(testKey);
      if (val !== 'ok') {
        throw new Error('Valeur de test incorrecte');
      }
      return true;
    } catch (e: any) {
      setCriticalError(
        "Erreur d'accès localStorage.\n"
        + (typeof e?.message === 'string' ? e.message : '')
        + "\nLe navigateur semble bloquer le stockage local : essayez en navigation normale, sur Chrome ou Safari, ou débloquez \"Cookies et Stockage\"."
      );
      setLoading(false);
      return false;
    }
  };

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

    // D'abord, tester localStorage
    if (!testLocalStorage()) {
      // criticalError déjà défini
      return;
    }

    // Timeout de sécurité pour sortir du loading au bout de 10s
    timeoutId = setTimeout(() => {
      if (!cancelled && loading) {
        setCriticalError(
          "Impossible de récupérer l'état utilisateur (timeout). Problème Supabase ou localStorage."
        );
        setLoading(false);
      }
    }, 10000);

    // (1) Auth listener
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
          setCriticalError('Erreur Supabase lors de onAuthStateChange : ' + String(err));
        }
        setLoading(false);
      }
    );

    // (2) Récupération session courante (race avec timeout 9s)
    const getSession = async () => {
      try {
        console.log('[useAuth] getSession SUPABASE...');
        await Promise.race([
          (async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
              console.error('[useAuth] Erreur Supabase:', error);
              setCriticalError('Erreur Supabase lors de getSession: ' + error.message);
              setUser(null);
              setLoading(false);
              return;
            }
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
            setLoading(false);
          })(),
          new Promise<void>((_, reject) => setTimeout(() => {
            reject(new Error('getSession timeout (aucune réponse Supabase dans les 9s)'))
          }, 9000))
        ]);
      } catch (error: any) {
        console.error('Error getting session:', error);
        setCriticalError('Erreur critique lors de la récupération de la session Supabase : ' + String(error));
        setUser(null);
        setLoading(false);
      }
    };

    getSession();

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
