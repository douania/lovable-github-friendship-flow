
import React from 'react';
import { Quote, QuoteItem } from '../../types/consultation';
import { Patient, Soin } from '../../types';

interface PrintableQuoteProps {
  quote: Quote;
  patient: Patient;
  soins: Soin[];
}

const PrintableQuote: React.FC<PrintableQuoteProps> = ({ quote, patient, soins }) => {
  const getSoinName = (soinId: string) => {
    const soin = soins.find(s => s.id === soinId);
    return soin ? soin.nom : 'Soin inconnu';
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white print:shadow-none">
      {/* En-tête */}
      <div className="mb-8 pb-6 border-b-2 border-pink-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">DEVIS</h1>
            <p className="text-lg text-gray-600">N° {quote.quoteNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-pink-600 mb-2">Cabinet Esthétique</h2>
            <p className="text-gray-600">Votre adresse</p>
            <p className="text-gray-600">Téléphone: +33 X XX XX XX XX</p>
            <p className="text-gray-600">Email: contact@cabinet.com</p>
          </div>
        </div>
      </div>

      {/* Informations patient et devis */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Client</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
            <p className="text-gray-600">{patient.email}</p>
            <p className="text-gray-600">{patient.phone}</p>
            {patient.address && <p className="text-gray-600">{patient.address}</p>}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Détails du devis</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><span className="font-medium">Date d'émission:</span> {new Date(quote.createdAt).toLocaleDateString('fr-FR')}</p>
            {quote.validUntil && (
              <p><span className="font-medium">Valide jusqu'au:</span> {new Date(quote.validUntil).toLocaleDateString('fr-FR')}</p>
            )}
            <p><span className="font-medium">Statut:</span> {quote.status === 'draft' ? 'Brouillon' : quote.status === 'sent' ? 'Envoyé' : quote.status === 'accepted' ? 'Accepté' : quote.status === 'rejected' ? 'Refusé' : 'Expiré'}</p>
          </div>
        </div>
      </div>

      {/* Tableau des prestations */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prestations</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Prestation</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Quantité</th>
              <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Prix unitaire</th>
              <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.treatmentItems.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-3">{getSoinName(item.soinId)}</td>
                <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-3 text-right">{item.unitPrice.toLocaleString()} FCFA</td>
                <td className="border border-gray-300 px-4 py-3 text-right font-medium">{item.total.toLocaleString()} FCFA</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span className="font-medium">{quote.subtotal.toLocaleString()} FCFA</span>
              </div>
              {quote.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Remise:</span>
                  <span>-{quote.discountAmount.toLocaleString()} FCFA</span>
                </div>
              )}
              {quote.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Taxes:</span>
                  <span>{quote.taxAmount.toLocaleString()} FCFA</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL:</span>
                  <span className="text-pink-600">{quote.totalAmount.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        </div>
      )}

      {/* Conditions */}
      <div className="border-t border-gray-300 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Conditions générales</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Ce devis est valable 30 jours à compter de la date d'émission.</p>
          <p>• Un acompte de 30% pourra être demandé à la confirmation de la commande.</p>
          <p>• Les prix sont exprimés en FCFA, toutes taxes comprises.</p>
          <p>• Toute prestation annulée moins de 24h avant le rendez-vous sera facturée.</p>
        </div>
      </div>

      {/* Signature */}
      <div className="mt-8 pt-6 border-t border-gray-300">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-4">Signature du client (bon pour accord):</p>
            <div className="border-b border-gray-300 w-48"></div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Le cabinet</p>
            <p className="font-medium mt-2">Dr. [Nom du praticien]</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableQuote;
