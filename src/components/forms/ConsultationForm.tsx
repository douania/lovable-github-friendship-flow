
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, Stethoscope } from 'lucide-react';
import { Consultation } from '../../types/consultation';
import { patientService } from '../../services/patientService';
import { soinService } from '../../services/soinService';
import { Patient, Soin } from '../../types';
import PhotoUpload from './PhotoUpload';

interface ConsultationFormProps {
  consultation?: Consultation;
  onSave: (consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ 
  consultation, 
  onSave, 
  onCancel 
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [soins, setSoins] = useState<Soin[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    patientId: consultation?.patientId || '',
    appointmentId: consultation?.appointmentId || '',
    soinId: consultation?.soinId || '',
    practitionerId: consultation?.practitionerId || '',
    consultationDate: consultation?.consultationDate || new Date().toISOString().split('T')[0],
    notesPreTreatment: consultation?.notesPreTreatment || '',
    notesPostTreatment: consultation?.notesPostTreatment || '',
    photosBefore: consultation?.photosBefore || [],
    photosAfter: consultation?.photosAfter || [],
    sideEffects: consultation?.sideEffects || '',
    nextAppointmentRecommended: consultation?.nextAppointmentRecommended || '',
    consentSigned: consultation?.consentSigned || false,
    satisfactionRating: consultation?.satisfactionRating || 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [patientsData, soinsData] = await Promise.all([
        patientService.getAll(),
        soinService.getAllSoins()
      ]);
      setPatients(patientsData);
      setSoins(soinsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.patientId) {
      alert('Veuillez sélectionner un patient');
      return;
    }
    
    if (!formData.soinId) {
      alert('Veuillez sélectionner un soin');
      return;
    }

    // Clean data before sending - ensure proper types
    const cleanedData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'> = {
      patientId: formData.patientId,
      appointmentId: formData.appointmentId || undefined,
      soinId: formData.soinId,
      practitionerId: formData.practitionerId || '',
      consultationDate: formData.consultationDate,
      notesPreTreatment: formData.notesPreTreatment,
      notesPostTreatment: formData.notesPostTreatment,
      photosBefore: formData.photosBefore,
      photosAfter: formData.photosAfter,
      sideEffects: formData.sideEffects,
      nextAppointmentRecommended: formData.nextAppointmentRecommended || undefined,
      consentSigned: formData.consentSigned,
      satisfactionRating: formData.satisfactionRating || undefined
    };

    console.log('Données nettoyées:', cleanedData);
    onSave(cleanedData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, satisfactionRating: rating }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-pink-500" />
            {consultation ? 'Modifier la consultation' : 'Nouvelle consultation'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Informations générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient *
                </label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Soin *
                </label>
                <select
                  name="soinId"
                  value={formData.soinId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                >
                  <option value="">Sélectionner un soin</option>
                  {soins.map(soin => (
                    <option key={soin.id} value={soin.id}>
                      {soin.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de consultation *
                </label>
                <input
                  type="date"
                  name="consultationDate"
                  value={formData.consultationDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Praticien
                </label>
                <input
                  type="text"
                  name="practitionerId"
                  value={formData.practitionerId}
                  onChange={handleInputChange}
                  placeholder="ID du praticien"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Notes médicales */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Notes médicales
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes pré-traitement
              </label>
              <textarea
                name="notesPreTreatment"
                value={formData.notesPreTreatment}
                onChange={handleInputChange}
                rows={4}
                placeholder="État de la peau, attentes du patient, contre-indications observées..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes post-traitement
              </label>
              <textarea
                name="notesPostTreatment"
                value={formData.notesPostTreatment}
                onChange={handleInputChange}
                rows={4}
                placeholder="Réaction de la peau, paramètres utilisés, conseils donnés..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effets secondaires observés
              </label>
              <textarea
                name="sideEffects"
                value={formData.sideEffects}
                onChange={handleInputChange}
                rows={3}
                placeholder="Rougeurs, gonflement, sensibilité..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Photos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PhotoUpload
              photos={formData.photosBefore}
              onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photosBefore: photos }))}
              label="Photos avant traitement"
              maxPhotos={3}
            />
            <PhotoUpload
              photos={formData.photosAfter}
              onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photosAfter: photos }))}
              label="Photos après traitement"
              maxPhotos={3}
            />
          </div>

          {/* Suivi */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-gray-900">Suivi et évaluation</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prochain rendez-vous recommandé
              </label>
              <input
                type="date"
                name="nextAppointmentRecommended"
                value={formData.nextAppointmentRecommended}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="consentSigned"
                name="consentSigned"
                checked={formData.consentSigned}
                onChange={handleInputChange}
                className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="consentSigned" className="text-sm font-medium text-gray-700">
                Consentement éclairé signé
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Évaluation de satisfaction (0-5 étoiles)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`text-2xl ${
                      star <= formData.satisfactionRating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {consultation ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationForm;
