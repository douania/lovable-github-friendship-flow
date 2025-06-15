
import { supabase } from '../integrations/supabase/client';
import { ClientAccess } from '../types/client';

export const clientAuthService = {
  // Authentifier un client
  async signIn(email: string, password: string): Promise<{ client?: ClientAccess; error?: any }> {
    try {
      // Récupérer l'accès client avec le hash du mot de passe
      const passwordHash = await this.hashPassword(password);
      
      const { data: clientData, error } = await supabase
        .from('client_access')
        .select(`
          *,
          patients (*)
        `)
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .eq('is_active', true)
        .single();

      if (error) {
        return { error: 'Email ou mot de passe incorrect' };
      }

      // Créer une session
      const sessionToken = await this.generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24h

      const { error: sessionError } = await supabase
        .from('client_sessions')
        .insert({
          client_id: clientData.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      if (sessionError) {
        console.error('Error creating session:', sessionError);
      }

      // Mettre à jour la dernière connexion
      await supabase
        .from('client_access')
        .update({ last_login: new Date().toISOString() })
        .eq('id', clientData.id);

      // Logger l'activité
      await this.logActivity(clientData.id, 'login', { email });

      // Stocker la session dans localStorage
      localStorage.setItem('client_session_token', sessionToken);
      localStorage.setItem('client_data', JSON.stringify(clientData));

      return { 
        client: {
          id: clientData.id,
          patientId: clientData.patient_id,
          email: clientData.email,
          isActive: clientData.is_active ?? true,
          lastLogin: clientData.last_login ?? undefined,
          createdAt: clientData.created_at ?? '',
          updatedAt: clientData.updated_at ?? ''
        }
      };
    } catch (error) {
      console.error('Error signing in client:', error);
      return { error: 'Erreur lors de la connexion' };
    }
  },

  // Vérifier une session existante
  async validateSession(): Promise<{ client?: ClientAccess; patient?: any; error?: any }> {
    try {
      const sessionToken = localStorage.getItem('client_session_token');
      if (!sessionToken) {
        return { error: 'Aucune session' };
      }

      // Vérifier la session
      const { data: sessionData, error } = await supabase
        .from('client_sessions')
        .select(`
          *,
          client_access (
            *,
            patients (*)
          )
        `)
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !sessionData) {
        localStorage.removeItem('client_session_token');
        localStorage.removeItem('client_data');
        return { error: 'Session expirée' };
      }

      return {
        client: {
          id: sessionData.client_access.id,
          patientId: sessionData.client_access.patient_id,
          email: sessionData.client_access.email,
          isActive: sessionData.client_access.is_active ?? true,
          lastLogin: sessionData.client_access.last_login ?? undefined,
          createdAt: sessionData.client_access.created_at ?? '',
          updatedAt: sessionData.client_access.updated_at ?? ''
        },
        patient: sessionData.client_access.patients
      };
    } catch (error) {
      console.error('Error validating session:', error);
      return { error: 'Erreur de validation' };
    }
  },

  // Déconnexion
  async signOut(): Promise<void> {
    try {
      const sessionToken = localStorage.getItem('client_session_token');
      if (sessionToken) {
        // Supprimer la session de la base
        await supabase
          .from('client_sessions')
          .delete()
          .eq('session_token', sessionToken);
      }

      // Nettoyer le localStorage
      localStorage.removeItem('client_session_token');
      localStorage.removeItem('client_data');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  // Logger une activité
  async logActivity(clientId: string, action: string, details: Record<string, any> = {}): Promise<void> {
    try {
      await supabase
        .from('client_activity_logs')
        .insert({
          client_id: clientId,
          action,
          details,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  },

  // Utilitaires
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async generateSessionToken(): Promise<string> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
};
