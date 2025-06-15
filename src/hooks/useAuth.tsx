
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { userService } from '../services/userService';

interface UserWithRole extends User {
  role?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [criticalError, setCriticalError] = useState<string | null>(null);

  const testLocalStorage = () => {
    try {
      const testKey = '__lovable_test__';
      window.localStorage.setItem(testKey, 'ok');
      const val = window.localStorage.getItem(testKey);
      window.localStorage.removeItem(testKey);
      if (val !== 'ok') {
        throw new Error('Valeur de test incorrecte');
      }
      console.log('[useAuth] localStorage test: OK');
      return true;
    } catch (e: any) {
      console.error('[useAuth] localStorage test failed:', e);
      setCriticalError(
        "Erreur d'accès localStorage.\n"
        + (typeof e?.message === 'string' ? e.message : '')
        + "\nLe navigateur semble bloquer le stockage local : essayez en navigation normale, sur Chrome ou Safari, ou débloquez \"Cookies et Stockage\"."
      );
      setLoading(false);
      return false;
    }
  };

  const fetchUserRole = async () => {
    try {
      const role = await userService.getCurrentUserRole();
      console.log('[useAuth] Role récupéré:', role);
      return role;
    } catch (error) {
      console.error('[useAuth] Error fetching user role:', error);
      return 'praticien';
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let cancelled = false;

    console.log('[useAuth] Initialisation du hook...');

    // D'abord, tester localStorage
    if (!testLocalStorage()) {
      return;
    }

    // Timeout de sécurité plus court pour déboguer
    timeoutId = setTimeout(() => {
      if (!cancelled && loading) {
        console.error('[useAuth] Timeout général atteint (15s)');
        setCriticalError(
          "Timeout de connexion Supabase (15s).\n"
          + "Causes possibles:\n"
          + "- Connexion internet lente\n"
          + "- Firewall/antivirus bloquant\n"
          + "- Extensions de navigateur\n"
          + "- Problème réseau d'entreprise"
        );
        setLoading(false);
      }
    }, 15000);

    // Auth listener
    console.log('[useAuth] Configuration du listener auth...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] AuthStateChange:', event, session ? 'session présente' : 'pas de session');
        try {
          if (session?.user) {
            console.log('[useAuth] Utilisateur connecté, récupération du rôle...');
            const role = await fetchUserRole();
            setUser({
              ...session.user,
              role
            });
          } else {
            console.log('[useAuth] Pas d\'utilisateur connecté');
            setUser(null);
          }
        } catch (err) {
          console.error('[useAuth] Erreur authStateChange:', err);
          setCriticalError('Erreur lors de la récupération des données utilisateur: ' + String(err));
        }
        setLoading(false);
      }
    );

    // Récupération session courante avec timeout réduit
    const getSession = async () => {
      try {
        console.log('[useAuth] Récupération de la session courante...');
        
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => {
            reject(new Error('getSession timeout après 5s'))
          }, 5000)
        );

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]);

        if (error) {
          console.error('[useAuth] Erreur Supabase getSession:', error);
          setCriticalError('Erreur Supabase: ' + error.message);
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('[useAuth] Session récupérée:', session ? 'présente' : 'absente');
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

      } catch (error: any) {
        console.error('[useAuth] Erreur lors de getSession:', error);
        
        if (error.message.includes('timeout')) {
          setCriticalError(
            "Connexion Supabase très lente (> 5s).\n"
            + "Solutions à tester:\n"
            + "1. Actualiser la page\n"
            + "2. Mode navigation privée\n"
            + "3. Autre navigateur (Chrome/Firefox)\n"
            + "4. Désactiver VPN/proxy\n"
            + "5. Connexion mobile si sur WiFi"
          );
        } else {
          setCriticalError('Erreur de connexion Supabase: ' + String(error));
        }
        
        setUser(null);
        setLoading(false);
      }
    };

    getSession();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
      console.log('[useAuth] Cleanup effectué');
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('[useAuth] Déconnexion...');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('[useAuth] Error signing out:', error);
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
