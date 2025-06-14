
import React from 'react';
import { X, Calendar, User, Stethoscope, Camera, FileText, Clock } from 'lucide-react';
import { Consultation } from '../../types/consultation';

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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-pink-500" />
            Détails de la consultation
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
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
                <p className="text-gray-900">{consultation.patientName || 'Non spécifié'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Soin</span>
                <p className="text-gray-900">{consultation.soinName || 'Non spécifié'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Date</span>
                <p className="text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(consultation.consultationDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Consentement</span>
                <p className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  consultation.consentSigned 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {consultation.consentSigned ? 'Signé' : 'Non signé'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes médicales */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes médicales
            </h3>
            
            {consultation.notesPreTreatment && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Notes pré-traitement</h4>
                <p className="text-blue-800 whitespace-pre-wrap">{consultation.notesPreTreatment}</p>
              </div>
            )}

            {consultation.notesPostTreatment && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Notes post-traitement</h4>
                <p className="text-green-800 whitespace-pre-wrap">{consultation.notesPostTreatment}</p>
              </div>
            )}

            {consultation.sideEffects && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">Effets secondaires</h4>
                <p className="text-orange-800 whitespace-pre-wrap">{consultation.sideEffects}</p>
              </div>
            )}
          </div>

          {/* Photos */}
          {(consultation.photosBefore.length > 0 || consultation.photosAfter.length > 0) && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {consultation.photosBefore.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Avant traitement</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {consultation.photosBefore.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Avant ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {consultation.photosAfter.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Après traitement</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {consultation.photosAfter.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Après ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suivi */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Suivi et évaluation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultation.nextAppointmentRecommended && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Prochain RDV recommandé</span>
                  <p className="text-gray-900">
                    {new Date(consultation.nextAppointmentRecommended).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}

              {consultation.satisfactionRating && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Satisfaction</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i}
                        className={`text-lg ${
                          i < consultation.satisfactionRating! 
                            ? 'text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      ({consultation.satisfactionRating}/5)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Métadonnées */}
          <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
            <p>Créé le : {new Date(consultation.createdAt).toLocaleString('fr-FR')}</p>
            {consultation.updatedAt !== consultation.createdAt && (
              <p>Modifié le : {new Date(consultation.updatedAt).toLocaleString('fr-FR')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetails;
