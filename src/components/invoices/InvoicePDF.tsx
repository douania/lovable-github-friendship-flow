import React from 'react';
import { Invoice, Patient } from '../../types';

interface InvoicePDFProps {
  invoice: Invoice;
  patient: Patient;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, patient }) => {
  return (
    <div id={`invoice-${invoice.id}`} className="bg-white p-8 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">FACTURE</h1>
          <p className="text-gray-600 mt-2">N° {invoice.id}</p>
          <p className="text-sm text-gray-500">Date: {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>
        <div className="text-right">
          <h2 className="font-bold text-lg">Cabinet Dr. Aïcha Mbaye</h2>
          <p className="text-sm text-gray-600">Médecine Esthétique</p>
          <p className="text-sm text-gray-600">123 Avenue de la Beauté</p>
          <p className="text-sm text-gray-600">75001 Paris</p>
          <p className="text-sm text-gray-600">Tel: 01 23 45 67 89</p>
        </div>
      </div>

      {/* Informations patient */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Facturé à :</h3>
        <p className="text-gray-800">{patient.firstName} {patient.lastName}</p>
        <p className="text-sm text-gray-600">{patient.email}</p>
        <p className="text-sm text-gray-600">{patient.phone}</p>
      </div>

      {/* Détails facture */}
      <table className="w-full mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="py-3 px-4 text-gray-800">Prestations médicales</td>
            <td className="text-right py-3 px-4 text-gray-800">{invoice.amount} €</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-gray-50">
            <td className="py-3 px-4 font-bold text-gray-800">Total TTC</td>
            <td className="text-right py-3 px-4 font-bold text-xl text-gray-800">{invoice.amount} €</td>
          </tr>
        </tfoot>
      </table>

      {/* Statut paiement */}
      <div className="mb-8">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Statut: </span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
            invoice.status === 'partial' ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            {invoice.status === 'paid' ? 'Payé' : 
             invoice.status === 'partial' ? 'Partiellement payé' : 
             'Impayé'}
          </span>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          <span className="font-semibold">Mode de paiement: </span>
          {invoice.paymentMethod === 'cash' ? 'Espèces' :
           invoice.paymentMethod === 'card' ? 'Carte bancaire' :
           invoice.paymentMethod === 'bank_transfer' ? 'Virement' :
           invoice.paymentMethod === 'mobile_money' ? 'Mobile Money' :
           invoice.paymentMethod}
        </p>
      </div>

      {/* Mentions légales */}
      <div className="text-xs text-gray-500 border-t pt-4">
        <p className="mb-1">Cabinet de médecine esthétique - Dr. Aïcha Mbaye</p>
        <p className="mb-1">SIRET: 123 456 789 00012 - APE: 8690A</p>
        <p className="mb-1">TVA non applicable, article 293 B du CGI</p>
        <p>En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.</p>
      </div>
    </div>
  );
};

export const printInvoice = (invoiceId: string) => {
  const printContent = document.getElementById(`invoice-${invoiceId}`);
  if (!printContent) return;

  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) return;

  printWindow.document.write('<html><head><title>Facture</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .bg-white { background-color: white; }
    .p-8 { padding: 2rem; }
    .max-w-4xl { max-width: 56rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .items-start { align-items: flex-start; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .text-3xl { font-size: 1.875rem; }
    .text-lg { font-size: 1.125rem; }
    .font-bold { font-weight: bold; }
    .font-semibold { font-weight: 600; }
    .text-gray-800 { color: #1f2937; }
    .text-gray-700 { color: #374151; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-500 { color: #6b7280; }
    .text-sm { font-size: 0.875rem; }
    .text-xs { font-size: 0.75rem; }
    .text-xl { font-size: 1.25rem; }
    .text-right { text-align: right; }
    .p-4 { padding: 1rem; }
    .bg-gray-50 { background-color: #f9fafb; }
    .bg-gray-100 { background-color: #f3f4f6; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-full { border-radius: 9999px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; }
    .border-b { border-bottom: 1px solid #e5e7eb; }
    .border-t { border-top: 1px solid #e5e7eb; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .pt-4 { padding-top: 1rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .bg-green-100 { background-color: #d1fae5; }
    .text-green-800 { color: #065f46; }
    .bg-orange-100 { background-color: #ffedd5; }
    .text-orange-800 { color: #9a3412; }
    .bg-red-100 { background-color: #fee2e2; }
    .text-red-800 { color: #991b1b; }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none; }
    }
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
