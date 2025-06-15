
export interface ClientAccess {
  id: string;
  patientId: string;
  email: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientSession {
  id: string;
  clientId: string;
  sessionToken: string;
  expiresAt: string;
  createdAt: string;
}

export interface ClientActivityLog {
  id: string;
  clientId: string;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ClientAuthContext {
  client: ClientAccess | null;
  patient: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}
