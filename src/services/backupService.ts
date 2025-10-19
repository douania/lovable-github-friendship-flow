
import { supabase } from '../integrations/supabase/client';

// SECURITY NOTE: BackupData interface kept for backward compatibility
// but all localStorage backup functionality has been disabled
interface BackupMetadata {
  id: string;
  filename: string;
  size: number;
  tables: string[];
  recordCount: number;
  createdAt: string;
  type: 'manual' | 'automatic';
}

export const backupService = {
  // SECURITY: localStorage backup functionality has been disabled
  // Storing sensitive patient data in localStorage is a critical security vulnerability
  async createBackup(_type: 'manual' | 'automatic' = 'manual'): Promise<{ success: boolean; filename?: string; error?: string }> {
    console.warn('SECURITY: Backup functionality disabled - localStorage storage is insecure for sensitive medical data');
    return { 
      success: false, 
      error: 'La fonctionnalité de sauvegarde a été désactivée pour des raisons de sécurité. Veuillez utiliser les sauvegardes natives de Supabase.'
    };
  },

  // SECURITY: Restore functionality has been disabled
  async restoreBackup(_backupId: string): Promise<{ success: boolean; error?: string }> {
    console.warn('SECURITY: Restore functionality disabled - localStorage storage is insecure');
    return { 
      success: false, 
      error: 'La fonctionnalité de restauration a été désactivée pour des raisons de sécurité.'
    };
  },

  // SECURITY: List functionality has been disabled
  async listBackups(): Promise<BackupMetadata[]> {
    console.warn('SECURITY: Backup listing disabled - localStorage storage is insecure');
    return [];
  },

  // SECURITY: Delete functionality has been disabled
  async deleteBackup(_backupId: string): Promise<{ success: boolean; error?: string }> {
    console.warn('SECURITY: Delete functionality disabled - localStorage storage is insecure');
    return { success: false, error: 'Fonctionnalité désactivée' };
  },

  // SECURITY: Export functionality has been disabled
  async exportBackup(_backupId: string): Promise<void> {
    console.warn('SECURITY: Export functionality disabled - localStorage storage is insecure');
    throw new Error('Fonctionnalité désactivée pour des raisons de sécurité');
  },

  // SECURITY: Import functionality has been disabled
  async importBackup(_file: File): Promise<{ success: boolean; error?: string }> {
    console.warn('SECURITY: Import functionality disabled - localStorage storage is insecure');
    return { 
      success: false, 
      error: 'La fonctionnalité d\'importation a été désactivée pour des raisons de sécurité.'
    };
  },

  // SECURITY: Automatic backup scheduling has been disabled
  scheduleAutoBackup(): void {
    console.warn('SECURITY: Automatic backup disabled - localStorage storage is insecure for medical data');
    console.info('Please use Supabase native backup features instead');
  },

  // Créer une notification de sauvegarde
  async createBackupNotification(type: 'success' | 'error', message: string): Promise<void> {
    try {
      await supabase
        .from('system_notifications')
        .insert({
          type: 'system_maintenance',
          title: type === 'success' ? 'Sauvegarde réussie' : 'Erreur de sauvegarde',
          message,
          priority: type === 'success' ? 'low' : 'high',
          metadata: {
            backup_type: 'automatic',
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error creating backup notification:', error);
    }
  },

  // SECURITY: Cleanup functionality has been disabled
  async cleanupOldBackups(): Promise<void> {
    console.warn('SECURITY: Cleanup disabled - localStorage storage is insecure');
  }
};
