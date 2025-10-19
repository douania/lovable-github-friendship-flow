
import React, { useState, useEffect } from 'react';
import { Download, Upload, Trash2, RefreshCw, Save, Clock, AlertCircle } from 'lucide-react';
import { backupService } from '../../services/backupService';

interface BackupMetadata {
  id: string;
  filename: string;
  size: number;
  tables: string[];
  recordCount: number;
  createdAt: string;
  type: 'manual' | 'automatic';
}

const BackupManagement: React.FC = () => {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const backupList = await backupService.listBackups();
      setBackups(backupList);
    } catch (error) {
      console.error('Error loading backups:', error);
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      const result = await backupService.createBackup('manual');
      if (result.success) {
        alert(`Sauvegarde créée avec succès: ${result.filename}`);
        await loadBackups();
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      alert('Erreur lors de la création de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportBackup = async (backupId: string) => {
    try {
      await backupService.exportBackup(backupId);
    } catch (error) {
      alert('Erreur lors de l\'exportation');
    }
  };

  const handleImportBackup = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    try {
      const result = await backupService.importBackup(selectedFile);
      if (result.success) {
        alert('Sauvegarde importée avec succès');
        setSelectedFile(null);
        await loadBackups();
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      alert('Erreur lors de l\'importation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (confirm('Attention: Cette action va remplacer toutes les données actuelles. Voulez-vous continuer ?')) {
      setIsLoading(true);
      try {
        const result = await backupService.restoreBackup(backupId);
        if (result.success) {
          alert('Restauration effectuée avec succès');
          window.location.reload(); // Recharger la page pour voir les nouvelles données
        } else {
          alert(`Erreur: ${result.error}`);
        }
      } catch (error) {
        alert('Erreur lors de la restauration');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ?')) {
      try {
        const result = await backupService.deleteBackup(backupId);
        if (result.success) {
          await loadBackups();
        } else {
          alert(`Erreur: ${result.error}`);
        }
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Security Warning */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Fonctionnalité désactivée pour des raisons de sécurité</h3>
            <p className="text-red-800 mt-2">
              La sauvegarde via localStorage a été désactivée car elle expose les données sensibles des patients 
              (informations médicales, photos, factures) sans cryptage. Cette approche viole les normes RGPD/HIPAA.
            </p>
            <p className="text-red-800 mt-2 font-semibold">
              Solution recommandée: Utilisez les sauvegardes natives de Supabase via le tableau de bord Supabase.
            </p>
            <a 
              href="https://supabase.com/dashboard/project/jhxxhwvljsyxdjsnctrg/settings/storage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-red-700 underline hover:text-red-900"
            >
              Accéder aux paramètres de sauvegarde Supabase →
            </a>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des sauvegardes (Désactivé)</h1>
        <div className="flex space-x-4">
          <button
            onClick={loadBackups}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>Créer une sauvegarde</span>
          </button>
        </div>
      </div>

      {/* Section d'importation */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Importer une sauvegarde</h2>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".json"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          />
          <button
            onClick={handleImportBackup}
            disabled={!selectedFile || isLoading}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            <span>Importer</span>
          </button>
        </div>
      </div>

      {/* Informations sur la sauvegarde automatique */}
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Clock className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Sauvegarde automatique</h3>
            <p className="text-blue-800 mt-1">
              Les sauvegardes automatiques sont créées toutes les 24 heures. Les 10 sauvegardes les plus récentes sont conservées.
            </p>
          </div>
        </div>
      </div>

      {/* Liste des sauvegardes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Sauvegardes disponibles</h2>
        </div>
        
        {isLoading && (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Traitement en cours...</p>
          </div>
        )}
        
        <div className="divide-y divide-gray-100">
          {backups.map((backup) => (
            <div key={backup.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {backup.filename}
                    </h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      backup.type === 'automatic' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {backup.type === 'automatic' ? 'Automatique' : 'Manuelle'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Date:</strong> {formatDate(backup.createdAt)}
                    </div>
                    <div>
                      <strong>Taille:</strong> {formatFileSize(backup.size)}
                    </div>
                    <div>
                      <strong>Enregistrements:</strong> {backup.recordCount}
                    </div>
                    <div>
                      <strong>Tables:</strong> {backup.tables.length}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-6">
                  <button
                    onClick={() => handleExportBackup(backup.id)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    title="Télécharger"
                  >
                    <Download className="h-4 w-4" />
                    <span>Exporter</span>
                  </button>
                  
                  <button
                    onClick={() => handleRestoreBackup(backup.id)}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium"
                    title="Restaurer"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Restaurer</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteBackup(backup.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {backups.length === 0 && !isLoading && (
            <div className="p-6 text-center text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune sauvegarde disponible</p>
              <p className="text-sm mt-1">Créez votre première sauvegarde pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupManagement;
