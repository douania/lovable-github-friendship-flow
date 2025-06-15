
import { supabase } from '../integrations/supabase/client';

interface BackupData {
  timestamp: string;
  version: string;
  data: {
    patients: any[];
    appointments: any[];
    treatments: any[];
    products: any[];
    invoices: any[];
    soins: any[];
    forfaits: any[];
    consultations: any[];
  };
}

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
  // Créer une sauvegarde complète
  async createBackup(type: 'manual' | 'automatic' = 'manual'): Promise<{ success: boolean; filename?: string; error?: string }> {
    try {
      console.log('Starting backup process...');
      
      // Récupérer toutes les données critiques
      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          patients: [],
          appointments: [],
          treatments: [],
          products: [],
          invoices: [],
          soins: [],
          forfaits: [],
          consultations: []
        }
      };

      // Récupérer les patients
      const { data: patients } = await supabase.from('patients').select('*');
      backupData.data.patients = patients || [];

      // Récupérer les rendez-vous
      const { data: appointments } = await supabase.from('appointments').select('*');
      backupData.data.appointments = appointments || [];

      // Récupérer les traitements
      const { data: treatments } = await supabase.from('treatments').select('*');
      backupData.data.treatments = treatments || [];

      // Récupérer les produits
      const { data: products } = await supabase.from('products').select('*');
      backupData.data.products = products || [];

      // Récupérer les factures
      const { data: invoices } = await supabase.from('invoices').select('*');
      backupData.data.invoices = invoices || [];

      // Récupérer les soins
      const { data: soins } = await supabase.from('soins').select('*');
      backupData.data.soins = soins || [];

      // Récupérer les forfaits
      const { data: forfaits } = await supabase.from('forfaits').select('*');
      backupData.data.forfaits = forfaits || [];

      // Récupérer les consultations
      const { data: consultations } = await supabase.from('consultations').select('*');
      backupData.data.consultations = consultations || [];

      // Générer le nom du fichier
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.json`;

      // Calculer les statistiques
      const totalRecords = Object.values(backupData.data).reduce((sum, table) => sum + table.length, 0);
      const backupSize = JSON.stringify(backupData).length;

      // Sauvegarder dans localStorage pour l'accès local
      const backupMetadata: BackupMetadata = {
        id: crypto.randomUUID(),
        filename,
        size: backupSize,
        tables: Object.keys(backupData.data),
        recordCount: totalRecords,
        createdAt: new Date().toISOString(),
        type
      };

      // Stocker la sauvegarde dans localStorage
      localStorage.setItem(`backup_${backupMetadata.id}`, JSON.stringify(backupData));
      
      // Stocker les métadonnées
      const existingBackups = JSON.parse(localStorage.getItem('backup_metadata') || '[]');
      existingBackups.push(backupMetadata);
      localStorage.setItem('backup_metadata', JSON.stringify(existingBackups));

      console.log(`Backup created successfully: ${filename} (${totalRecords} records, ${(backupSize / 1024).toFixed(2)} KB)`);

      return { success: true, filename };
    } catch (error) {
      console.error('Error creating backup:', error);
      return { success: false, error: 'Erreur lors de la création de la sauvegarde' };
    }
  },

  // Restaurer une sauvegarde
  async restoreBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Starting restore process for backup:', backupId);

      // Récupérer les données de sauvegarde
      const backupDataString = localStorage.getItem(`backup_${backupId}`);
      if (!backupDataString) {
        return { success: false, error: 'Sauvegarde non trouvée' };
      }

      const backupData: BackupData = JSON.parse(backupDataString);

      // Confirmation de sécurité (dans un vrai environnement, ceci devrait être géré par l'UI)
      if (!confirm('Attention: Cette opération va remplacer toutes les données actuelles. Continuer ?')) {
        return { success: false, error: 'Restauration annulée par l\'utilisateur' };
      }

      // Restaurer chaque table
      const tables = Object.keys(backupData.data) as (keyof typeof backupData.data)[];
      
      for (const tableName of tables) {
        const tableData = backupData.data[tableName];
        
        if (tableData && tableData.length > 0) {
          // Supprimer les données existantes
          const { error: deleteError } = await supabase
            .from(tableName as any)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
          
          if (deleteError) {
            console.error(`Error deleting ${tableName}:`, deleteError);
          }

          // Insérer les nouvelles données
          const { error: insertError } = await supabase
            .from(tableName as any)
            .insert(tableData);
          
          if (insertError) {
            console.error(`Error inserting ${tableName}:`, insertError);
            return { success: false, error: `Erreur lors de la restauration de ${tableName}` };
          }
        }
      }

      console.log('Restore completed successfully');
      return { success: true };
    } catch (error) {
      console.error('Error restoring backup:', error);
      return { success: false, error: 'Erreur lors de la restauration' };
    }
  },

  // Lister les sauvegardes disponibles
  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const backupsString = localStorage.getItem('backup_metadata');
      if (!backupsString) return [];

      const backups: BackupMetadata[] = JSON.parse(backupsString);
      return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  },

  // Supprimer une sauvegarde
  async deleteBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Supprimer les données de sauvegarde
      localStorage.removeItem(`backup_${backupId}`);
      
      // Supprimer des métadonnées
      const existingBackups = JSON.parse(localStorage.getItem('backup_metadata') || '[]');
      const updatedBackups = existingBackups.filter((backup: BackupMetadata) => backup.id !== backupId);
      localStorage.setItem('backup_metadata', JSON.stringify(updatedBackups));

      return { success: true };
    } catch (error) {
      console.error('Error deleting backup:', error);
      return { success: false, error: 'Erreur lors de la suppression' };
    }
  },

  // Exporter une sauvegarde vers un fichier
  async exportBackup(backupId: string): Promise<void> {
    try {
      const backupDataString = localStorage.getItem(`backup_${backupId}`);
      if (!backupDataString) {
        throw new Error('Sauvegarde non trouvée');
      }

      const backupData = JSON.parse(backupDataString);
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting backup:', error);
      throw error;
    }
  },

  // Importer une sauvegarde depuis un fichier
  async importBackup(file: File): Promise<{ success: boolean; error?: string }> {
    try {
      const fileContent = await file.text();
      const backupData: BackupData = JSON.parse(fileContent);

      // Valider la structure de la sauvegarde
      if (!backupData.data || !backupData.timestamp) {
        return { success: false, error: 'Format de sauvegarde invalide' };
      }

      // Créer les métadonnées
      const backupId = crypto.randomUUID();
      const backupMetadata: BackupMetadata = {
        id: backupId,
        filename: file.name,
        size: fileContent.length,
        tables: Object.keys(backupData.data),
        recordCount: Object.values(backupData.data).reduce((sum, table) => sum + (table?.length || 0), 0),
        createdAt: new Date().toISOString(),
        type: 'manual'
      };

      // Stocker la sauvegarde
      localStorage.setItem(`backup_${backupId}`, JSON.stringify(backupData));
      
      const existingBackups = JSON.parse(localStorage.getItem('backup_metadata') || '[]');
      existingBackups.push(backupMetadata);
      localStorage.setItem('backup_metadata', JSON.stringify(existingBackups));

      return { success: true };
    } catch (error) {
      console.error('Error importing backup:', error);
      return { success: false, error: 'Erreur lors de l\'importation' };
    }
  },

  // Programmer une sauvegarde automatique
  scheduleAutoBackup(): void {
    // Sauvegarde automatique toutes les 24h
    const scheduleBackup = () => {
      this.createBackup('automatic').then(result => {
        if (result.success) {
          console.log('Automatic backup created successfully');
          
          // Créer une notification de succès
          this.createBackupNotification('success', `Sauvegarde automatique créée: ${result.filename}`);
        } else {
          console.error('Automatic backup failed:', result.error);
          this.createBackupNotification('error', `Échec de la sauvegarde automatique: ${result.error}`);
        }
      });
    };

    // Programmer la première sauvegarde dans 1 heure
    setTimeout(() => {
      scheduleBackup();
      // Puis répéter toutes les 24h
      setInterval(scheduleBackup, 24 * 60 * 60 * 1000);
    }, 60 * 60 * 1000);

    console.log('Automatic backup scheduled (every 24 hours)');
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

  // Nettoyer les anciennes sauvegardes (garder seulement les 10 plus récentes)
  async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length > 10) {
        const backupsToDelete = backups.slice(10);
        
        for (const backup of backupsToDelete) {
          await this.deleteBackup(backup.id);
        }
        
        console.log(`Cleaned up ${backupsToDelete.length} old backups`);
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }
};
