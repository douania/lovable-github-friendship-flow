import React from 'react';
import { Consultation } from '../../types/consultation';
import { Patient, Soin } from '../../types';

interface ConsultationPDFProps {
  consultation: Consultation;
  patient: Patient;
  soin: Soin;
  signature?: string;
}

export const ConsultationPDF: React.FC<ConsultationPDFProps> = ({
  consultation,
  patient,
  soin,
  signature
}) => {
  return (
    <div id={`consultation-pdf-${consultation.id}`} className="bg-white p-8 max-w-4xl mx-auto print:p-0">
      {/* En-tête */}
      <div className="border-b-2 border-pink-500 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DOSSIER MÉDICAL</h1>
            <p className="text-sm text-gray-600 mt-1">Institut de Beauté</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Date: {new Date(consultation.consultationDate).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Référence: {consultation.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Informations patient */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
          Informations Patient
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Nom complet:</span>
            <p className="font-medium">{patient.firstName} {patient.lastName}</p>
          </div>
          <div>
            <span className="text-gray-600">Date de naissance:</span>
            <p className="font-medium">
              {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>
            <p className="font-medium">{patient.email}</p>
          </div>
          <div>
            <span className="text-gray-600">Téléphone:</span>
            <p className="font-medium">{patient.phone}</p>
          </div>
        </div>
      </div>

      {/* Informations traitement */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
          Traitement Réalisé
        </h2>
        <div className="bg-pink-50 p-4 rounded-lg">
          <p className="font-semibold text-gray-900">{soin.nom}</p>
          {soin.description && (
            <p className="text-sm text-gray-600 mt-1">{soin.description}</p>
          )}
        </div>
      </div>

      {/* Notes médicales */}
      {(consultation.notesPreTreatment || consultation.notesPostTreatment) && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            Notes Médicales
          </h2>
          
          {consultation.notesPreTreatment && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Observations pré-traitement:
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {consultation.notesPreTreatment}
              </p>
            </div>
          )}

          {consultation.notesPostTreatment && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Observations post-traitement:
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {consultation.notesPostTreatment}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Effets secondaires */}
      {consultation.sideEffects && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            Effets Secondaires Observés
          </h2>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {consultation.sideEffects}
          </p>
        </div>
      )}

      {/* Photos */}
      {(consultation.photosBefore.length > 0 || consultation.photosAfter.length > 0) && (
        <div className="mb-6 page-break-before">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            Documentation Photographique
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {consultation.photosBefore.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Avant traitement
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {consultation.photosBefore.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Avant ${index + 1}`}
                      className="w-full h-auto rounded border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {consultation.photosAfter.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Après traitement
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {consultation.photosAfter.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Après ${index + 1}`}
                      className="w-full h-auto rounded border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suivi */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
          Suivi et Recommandations
        </h2>
        <div className="space-y-2 text-sm">
          {consultation.nextAppointmentRecommended && (
            <p>
              <span className="text-gray-600">Prochain rendez-vous recommandé:</span>
              <span className="ml-2 font-medium">
                {new Date(consultation.nextAppointmentRecommended).toLocaleDateString('fr-FR')}
              </span>
            </p>
          )}
          
          {consultation.satisfactionRating && (
            <p>
              <span className="text-gray-600">Satisfaction patient:</span>
              <span className="ml-2">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i}
                    className={i < consultation.satisfactionRating! ? 'text-yellow-400' : 'text-gray-300'}
                  >
                    ★
                  </span>
                ))}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Consentement et signature */}
      <div className="border-t-2 border-gray-200 pt-6 mt-8">
        <div className="flex items-start gap-2 mb-4">
          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
            consultation.consentSigned ? 'bg-green-500 border-green-500' : 'border-gray-300'
          }`}>
            {consultation.consentSigned && (
              <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 font-medium">
              Consentement éclairé {consultation.consentSigned ? 'signé' : 'non signé'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Le patient certifie avoir été informé des bénéfices et risques du traitement
            </p>
          </div>
        </div>

        {signature && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Signature du patient:</p>
            <img src={signature} alt="Signature" className="border border-gray-300 rounded max-w-xs" />
          </div>
        )}
      </div>

      {/* Pied de page */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
        <p>Ce document est confidentiel et destiné uniquement au patient concerné</p>
        <p className="mt-1">
          Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
        </p>
      </div>
    </div>
  );
};

export const printConsultation = (consultationId: string) => {
  const printContent = document.getElementById(`consultation-pdf-${consultationId}`);
  if (!printContent) return;

  const printWindow = window.open('', '', 'height=800,width=800');
  if (!printWindow) return;

  printWindow.document.write('<html><head><title>Dossier Médical</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    @media print {
      @page { margin: 1cm; }
      body { font-family: Arial, sans-serif; }
      .page-break-before { page-break-before: always; }
      .print\\:p-0 { padding: 0; }
    }
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
  `);
  printWindow.document.write('</style></head><body>');
  printWindow.document.write(printContent.innerHTML);
  printWindow.document.write('</body></html>');

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
