/**
 * Phase 3D - Service pour la gestion des forfaits patients
 * 
 * Gère le cycle de vie complet d'un forfait acheté par un patient :
 * - Vente d'un forfait (création patient_forfaits)
 * - Décrémentation des séances utilisées
 * - Récupération des forfaits actifs d'un patient
 * - Historique et expiration
 */

import { supabase } from '../integrations/supabase/client';
import { logger } from '../lib/logger';

// Types pour le service
export interface PatientForfait {
  id: string;
  patientId: string;
  forfaitId: string;
  totalSessions: number;
  remainingSessions: number;
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  // Relations enrichies (optionnelles, pour affichage)
  forfait?: {
    nom: string;
    description?: string;
    prixReduit: number;
  };
}

export interface SellForfaitInput {
  patientId: string;
  forfaitId: string;
  notes?: string;
}

// Mapper DB → TS
const mapDbToPatientForfait = (db: any): PatientForfait => ({
  id: db.id,
  patientId: db.patient_id,
  forfaitId: db.forfait_id,
  totalSessions: db.total_sessions,
  remainingSessions: db.remaining_sessions,
  purchaseDate: db.purchase_date,
  expiryDate: db.expiry_date,
  status: db.status,
  notes: db.notes || undefined,
  createdAt: db.created_at,
  updatedAt: db.updated_at || undefined,
  forfait: db.forfaits ? {
    nom: db.forfaits.nom,
    description: db.forfaits.description,
    prixReduit: db.forfaits.prix_reduit,
  } : undefined,
});

export const patientForfaitService = {
  /**
   * Vendre un forfait à un patient
   * Crée une entrée patient_forfaits avec les séances initiales et la date d'expiration
   */
  async sellForfait(input: SellForfaitInput): Promise<PatientForfait> {
    try {
      // 1. Récupérer les détails du forfait pour nb_seances et validite_mois
      const { data: forfait, error: forfaitError } = await supabase
        .from('forfaits')
        .select('nb_seances, validite_mois')
        .eq('id', input.forfaitId)
        .single();

      if (forfaitError || !forfait) {
        throw new Error(`Forfait introuvable: ${input.forfaitId}`);
      }

      // 2. Calculer la date d'expiration
      const purchaseDate = new Date();
      const expiryDate = new Date(purchaseDate);
      expiryDate.setMonth(expiryDate.getMonth() + forfait.validite_mois);

      // 3. Créer l'entrée patient_forfaits
      const { data, error } = await supabase
        .from('patient_forfaits')
        .insert({
          patient_id: input.patientId,
          forfait_id: input.forfaitId,
          total_sessions: forfait.nb_seances,
          remaining_sessions: forfait.nb_seances,
          purchase_date: purchaseDate.toISOString().split('T')[0],
          expiry_date: expiryDate.toISOString().split('T')[0],
          status: 'active',
          notes: input.notes || null,
        })
        .select(`
          *,
          forfaits (nom, description, prix_reduit)
        `)
        .single();

      if (error) {
        logger.error('Erreur lors de la vente du forfait', { error, input });
        throw error;
      }

      logger.info('Forfait vendu avec succès', { 
        patientForfaitId: data.id, 
        patientId: input.patientId,
        forfaitId: input.forfaitId 
      });

      return mapDbToPatientForfait(data);
    } catch (error) {
      logger.error('Erreur dans sellForfait', error);
      throw error;
    }
  },

  /**
   * Décrémenter une séance d'un forfait patient
   * Met à jour remaining_sessions et passe en "completed" si 0
   */
  async decrementSession(patientForfaitId: string): Promise<PatientForfait> {
    try {
      // 1. Récupérer le forfait patient actuel
      const { data: current, error: fetchError } = await supabase
        .from('patient_forfaits')
        .select('*')
        .eq('id', patientForfaitId)
        .single();

      if (fetchError || !current) {
        throw new Error(`Forfait patient introuvable: ${patientForfaitId}`);
      }

      if (current.status !== 'active') {
        throw new Error(`Ce forfait n'est plus actif (statut: ${current.status})`);
      }

      if (current.remaining_sessions <= 0) {
        throw new Error('Ce forfait n\'a plus de séances disponibles');
      }

      // 2. Calculer le nouveau nombre de séances
      const newRemaining = current.remaining_sessions - 1;
      const newStatus = newRemaining === 0 ? 'completed' : 'active';

      // 3. Mettre à jour
      const { data, error } = await supabase
        .from('patient_forfaits')
        .update({
          remaining_sessions: newRemaining,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', patientForfaitId)
        .select(`
          *,
          forfaits (nom, description, prix_reduit)
        `)
        .single();

      if (error) {
        logger.error('Erreur lors de la décrémentation', { error, patientForfaitId });
        throw error;
      }

      logger.info('Séance décrémentée', { 
        patientForfaitId, 
        newRemaining, 
        newStatus 
      });

      return mapDbToPatientForfait(data);
    } catch (error) {
      logger.error('Erreur dans decrementSession', error);
      throw error;
    }
  },

  /**
   * Récupérer tous les forfaits d'un patient (avec enrichissement forfait)
   */
  async getByPatientId(patientId: string): Promise<PatientForfait[]> {
    try {
      const { data, error } = await supabase
        .from('patient_forfaits')
        .select(`
          *,
          forfaits (nom, description, prix_reduit)
        `)
        .eq('patient_id', patientId)
        .order('purchase_date', { ascending: false });

      if (error) {
        logger.error('Erreur lors de la récupération des forfaits patient', { error, patientId });
        throw error;
      }

      return (data || []).map(mapDbToPatientForfait);
    } catch (error) {
      logger.error('Erreur dans getByPatientId', error);
      throw error;
    }
  },

  /**
   * Récupérer uniquement les forfaits actifs d'un patient (non expirés, séances restantes)
   */
  async getActiveByPatientId(patientId: string): Promise<PatientForfait[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('patient_forfaits')
        .select(`
          *,
          forfaits (nom, description, prix_reduit)
        `)
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .gte('expiry_date', today)
        .gt('remaining_sessions', 0)
        .order('expiry_date', { ascending: true }); // Les plus proches de l'expiration en premier

      if (error) {
        logger.error('Erreur lors de la récupération des forfaits actifs', { error, patientId });
        throw error;
      }

      return (data || []).map(mapDbToPatientForfait);
    } catch (error) {
      logger.error('Erreur dans getActiveByPatientId', error);
      throw error;
    }
  },

  /**
   * Récupérer un forfait patient par son ID
   */
  async getById(id: string): Promise<PatientForfait | null> {
    try {
      const { data, error } = await supabase
        .from('patient_forfaits')
        .select(`
          *,
          forfaits (nom, description, prix_reduit)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return mapDbToPatientForfait(data);
    } catch (error) {
      logger.error('Erreur dans getById', error);
      throw error;
    }
  },

  /**
   * Annuler un forfait patient (changement de statut)
   */
  async cancel(patientForfaitId: string, reason?: string): Promise<PatientForfait> {
    try {
      const { data, error } = await supabase
        .from('patient_forfaits')
        .update({
          status: 'cancelled',
          notes: reason || 'Annulé',
          updated_at: new Date().toISOString(),
        })
        .eq('id', patientForfaitId)
        .select(`
          *,
          forfaits (nom, description, prix_reduit)
        `)
        .single();

      if (error) {
        logger.error('Erreur lors de l\'annulation du forfait', { error, patientForfaitId });
        throw error;
      }

      return mapDbToPatientForfait(data);
    } catch (error) {
      logger.error('Erreur dans cancel', error);
      throw error;
    }
  },

  /**
   * Vérifier et mettre à jour les forfaits expirés
   * À appeler périodiquement ou au chargement
   */
  async updateExpiredForfaits(): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('patient_forfaits')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('status', 'active')
        .lt('expiry_date', today)
        .select('id');

      if (error) {
        logger.error('Erreur lors de la mise à jour des forfaits expirés', error);
        throw error;
      }

      const count = data?.length || 0;
      if (count > 0) {
        logger.info(`${count} forfait(s) marqué(s) comme expiré(s)`);
      }

      return count;
    } catch (error) {
      logger.error('Erreur dans updateExpiredForfaits', error);
      throw error;
    }
  },
};
