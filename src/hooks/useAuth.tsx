
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

  console.log('useAuth hook initialized');

  const fetchUserRole = async () => {
    try {
      console.log('Fetching user role...');
      const role = await userService.getCurrentUserRole();
      console.log('User role fetched:', role);
      return role;
    } catch (error) {
      console.error('Error fetching user role:', error);
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
          const role = await fetchUserRole();
          setUser({
            ...session.user,
            role
          });
          console.log('User set with role:', role);
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
          const role = await fetchUserRole();
          setUser({
            ...session.user,
            role
          });
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
