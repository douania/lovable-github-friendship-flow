/**
 * Utilitaire pour convertir les erreurs Supabase/JS en messages utilisateur
 * Usage limité Phase 2A: Patients.tsx + Appointments.tsx uniquement
 */

interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
}

/**
 * Convertit une erreur en message utilisateur lisible en français
 */
export const getErrorMessage = (error: unknown): string => {
  // Gestion des erreurs nulles ou undefined
  if (!error) {
    return 'Une erreur s\'est produite';
  }

  // Erreur sous forme de string
  if (typeof error === 'string') {
    return error;
  }

  // Erreur Supabase ou JavaScript standard
  if (typeof error === 'object') {
    const err = error as SupabaseError & Error;

    // Codes d'erreur Supabase PostgreSQL
    if (err.code) {
      switch (err.code) {
        case 'PGRST116':
          return 'Aucune donnée trouvée';
        case '23505':
          return 'Cette entrée existe déjà';
        case '23503':
          return 'Impossible de supprimer, données liées existantes';
        case '42501':
          return 'Accès non autorisé';
        case '42P01':
          return 'Table non trouvée';
        case '23502':
          return 'Un champ obligatoire est manquant';
        case 'PGRST301':
          return 'Erreur de connexion à la base de données';
        default:
          break;
      }
    }

    // Erreurs réseau
    if (err.message) {
      const message = err.message.toLowerCase();
      
      if (message.includes('failed to fetch') || message.includes('networkerror')) {
        return 'Problème de connexion réseau';
      }
      
      if (message.includes('timeout')) {
        return 'La requête a expiré, veuillez réessayer';
      }

      if (message.includes('unauthorized') || message.includes('401')) {
        return 'Session expirée, veuillez vous reconnecter';
      }

      if (message.includes('forbidden') || message.includes('403')) {
        return 'Accès non autorisé';
      }

      if (message.includes('not found') || message.includes('404')) {
        return 'Ressource non trouvée';
      }

      if (message.includes('internal server error') || message.includes('500')) {
        return 'Erreur serveur, veuillez réessayer plus tard';
      }
    }

    // TypeError générique
    if (err.name === 'TypeError') {
      return 'Erreur technique inattendue';
    }
  }

  return 'Une erreur s\'est produite';
};
