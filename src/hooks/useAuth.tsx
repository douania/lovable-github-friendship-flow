
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { userService } from '../services/userService';

interface UserWithRole extends User {
  role?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          try {
            const role = await userService.getCurrentUserRole();
            setUser({
              ...session.user,
              role: role
            });
          } catch (roleError) {
            console.error('Erreur lors de la récupération du rôle:', roleError);
            setUser({
              ...session.user,
              role: 'praticien'
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            const role = await userService.getCurrentUserRole();
            setUser({
              ...session.user,
              role: role
            });
          } catch (error) {
            console.error('Erreur lors de la récupération du rôle:', error);
            setUser({
              ...session.user,
              role: 'praticien'
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
};
