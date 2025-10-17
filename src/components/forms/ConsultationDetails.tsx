import React, { useState, useEffect } from 'react';
import { X, Edit, Printer, Calendar, User, Star, Stethoscope, Camera, FileText } from 'lucide-react';
import { Consultation } from '../../types/consultation';
import { patientService } from '../../services/patientService';
import { soinService } from '../../services/soinService';
import { Patient, Soin } from '../../types';
import { ConsultationPDF, printConsultation } from '../consultations/ConsultationPDF';

interface ConsultationDetailsProps {
  consultation: Consultation & { patientName?: string; soinName?: string };
  onClose: () => void;
  onEdit: () => void;
}

const ConsultationDetails: React.FC<ConsultationDetailsProps> = ({ 
  consultation, 
  onClose, 
  onEdit 
}) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [soin, setSoin] = useState<Soin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const [patientData, soinData] = await Promise.all([
        patientService.getById(consultation.patientId),
        soinService.getSoinById(consultation.soinId)
      ]);
      setPatient(patientData);
      setSoin(soinData);
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-pink-500" />
            Détails de la consultation
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => printConsultation(consultation.id)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimer PDF
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Informations générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Patient</span>
                <p className="text-gray-900 font-medium">{consultation.patientName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Soin</span>
                <p className="text-gray-900 font-medium">{consultation.soinName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Date</span>
                <p className="text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(consultation.consultationDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Consentement</span>
                <p className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                  consultation.consentSigned 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {consultation.consentSigned ? '✓ Signé' : '✗ Non signé'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes médicales */}
          {(consultation.notesPreTreatment || consultation.notesPostTreatment || consultation.sideEffects) && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes médicales
              </h3>
              
              {consultation.notesPreTreatment && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Observations pré-traitement
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {consultation.notesPreTreatment}
                  </p>
                </div>
              )}

              {consultation.notesPostTreatment && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Observations post-traitement
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {consultation.notesPostTreatment}
                  </p>
                </div>
              )}

              {consultation.sideEffects && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Effets secondaires
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {consultation.sideEffects}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Photos */}
          {(consultation.photosBefore.length > 0 || consultation.photosAfter.length > 0) && (
            <div>
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Documentation photographique
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {consultation.photosBefore.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Photos avant traitement
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {consultation.photosBefore.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Avant ${index + 1}`}
                          className="w-full h-auto rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {consultation.photosAfter.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Photos après traitement
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {consultation.photosAfter.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Après ${index + 1}`}
                          className="w-full h-auto rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suivi et évaluation */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Suivi et évaluation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultation.satisfactionRating && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Satisfaction</span>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < consultation.satisfactionRating!
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {consultation.satisfactionRating}/5
                    </span>
                  </div>
                </div>
              )}

              {consultation.nextAppointmentRecommended && (
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Prochain RDV recommandé
                  </span>
                  <p className="text-gray-900 font-medium mt-1">
                    {new Date(consultation.nextAppointmentRecommended).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dates système */}
          <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
            <p>
              Créé le {new Date(consultation.createdAt).toLocaleDateString('fr-FR')} à{' '}
              {new Date(consultation.createdAt).toLocaleTimeString('fr-FR')}
            </p>
            {consultation.updatedAt && consultation.updatedAt !== consultation.createdAt && (
              <p>
                Modifié le {new Date(consultation.updatedAt).toLocaleDateString('fr-FR')} à{' '}
                {new Date(consultation.updatedAt).toLocaleTimeString('fr-FR')}
              </p>
            )}
          </div>
        </div>

        {/* PDF caché pour impression */}
        <div className="hidden">
          {patient && soin && (
            <ConsultationPDF
              consultation={consultation}
              patient={patient}
              soin={soin}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetails;
