import { ClientAccess } from '../types/client';

// DEPRECATED: This client authentication system has been removed for security reasons
// The system had multiple critical vulnerabilities:
// - Weak password hashing (SHA-256 without salt, vulnerable to rainbow table attacks)
// - Client-side session storage in localStorage (vulnerable to XSS attacks)
// - Insecure session token generation (predictable patterns)
// - No protection against brute force attacks
// - Sessions stored in database without proper encryption
// 
// SECURITY RECOMMENDATION: Use Supabase's built-in authentication system instead
// Supabase Auth provides:
// - Secure password hashing with bcrypt and salt
// - Server-side session management
// - Protection against common attacks (brute force, XSS, CSRF)
// - Built-in email verification and password reset

export const clientAuthService = {
  async signIn(_email: string, _password: string): Promise<{ client?: ClientAccess; error?: any }> {
    return { 
      error: 'SECURITY WARNING: Client authentication system has been deprecated due to critical vulnerabilities. Please use Supabase Auth instead.' 
    };
  },

  async validateSession(): Promise<{ client?: ClientAccess; patient?: any; error?: any }> {
    return { 
      error: 'SECURITY WARNING: Client authentication system has been deprecated due to critical vulnerabilities. Please use Supabase Auth instead.' 
    };
  },

  async signOut(): Promise<void> {
    // Clear any existing localStorage data for security
    localStorage.removeItem('client_session_token');
    localStorage.removeItem('client_data');
    console.warn('SECURITY WARNING: Client authentication system deprecated. Please implement Supabase Auth.');
  },

  async logActivity(_clientId: string, _action: string, _details: Record<string, any> = {}): Promise<void> {
    console.warn('SECURITY WARNING: Client authentication system deprecated. Activity logging disabled.');
  },

  // Deprecated utility functions
  async hashPassword(_password: string): Promise<string> {
    throw new Error('SECURITY WARNING: Weak password hashing deprecated. Use Supabase Auth instead.');
  },

  async generateSessionToken(): Promise<string> {
    throw new Error('SECURITY WARNING: Insecure session token generation deprecated. Use Supabase Auth instead.');
  },

  async getClientIP(): Promise<string> {
    throw new Error('SECURITY WARNING: Client authentication system deprecated. Use Supabase Auth instead.');
  }
};