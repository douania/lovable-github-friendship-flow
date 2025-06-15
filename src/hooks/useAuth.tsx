
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface UserWithRole extends User {
  role?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('useAuth hook initialized');

  const fetchUserRole = async (userId: string): Promise<string> => {
    try {
      console.log('Fetching user role for user:', userId);
      
      // Simplified role fetching with timeout
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'praticien';
      }

      const role = data?.role || 'praticien';
      console.log('User role fetched:', role);
      return role;
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return 'praticien';
    }
  };

  useEffect(() => {
    console.log('useAuth useEffect triggered');
    
    // Get current session
    const getSession = async () => {
      try {
        console.log('Getting session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session retrieved:', session ? 'exists' : 'null');
        
        if (session?.user) {
          console.log('User found in session, fetching role...');
          try {
            const role = await fetchUserRole(session.user.id);
            setUser({
              ...session.user,
              role
            });
            console.log('User set with role:', role);
          } catch (roleError) {
            console.error('Error fetching role, setting user without role:', roleError);
            setUser({
              ...session.user,
              role: 'praticien'
            });
          }
        } else {
          console.log('No user in session');
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
        
        if (session?.user) {
          try {
            const role = await fetchUserRole(session.user.id);
            setUser({
              ...session.user,
              role
            });
            console.log('Auth change: User set with role:', role);
          } catch (roleError) {
            console.error('Auth change: Error fetching role, setting user without role:', roleError);
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
      console.error('Error signing out:', error);
    }
  };

  console.log('useAuth returning:', { user: user ? 'exists' : 'null', loading, isAuthenticated: !!user });

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
};
