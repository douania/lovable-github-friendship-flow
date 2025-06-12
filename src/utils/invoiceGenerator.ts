import { Invoice, Patient, Treatment } from '../types';

export const generateInvoicePDF = (
  invoice: Invoice,
  patient: Patient,
  treatments: Treatment[]
) => {
  // Créer le contenu HTML de la facture
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Facture ${invoice.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #ec4899; font-size: 24px; font-weight: bold; }
        .clinic-info { color: #6b7280; margin-top: 10px; }
        .invoice-details { display: flex; justify-content: space-between; margin: 30px 0; }
        .patient-info, .invoice-info { width: 45%; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        .table th { background-color: #f9fafb; }
        .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Skin 101</div>
        <div class="clinic-info">Cabinet de Médecine Esthétique<br>Dakar, Sénégal</div>
      </div>
      
      <div class="invoice-details">
        <div class="patient-info">
          <h3>Facturé à:</h3>
          <p><strong>${patient.firstName} ${patient.lastName}</strong><br>
          ${patient.email}<br>
          ${patient.phone}</p>
        </div>
        <div class="invoice-info">
          <h3>Facture:</h3>
          <p><strong>N° ${invoice.id}</strong><br>
          Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}<br>
          Statut: ${getStatusText(invoice.status)}</p>
        </div>
      </div>
      
      <table class="table">
        <thead>
          <tr>
            <th>Soin</th>
            <th>Prix unitaire</th>
            <th>Quantité</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${treatments.map(treatment => `
            <tr>
              <td>${treatment.name}</td>
              <td>${treatment.price.toLocaleString()} FCFA</td>
              <td>1</td>
              <td>${treatment.price.toLocaleString()} FCFA</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total">
        Total: ${invoice.amount.toLocaleString()} FCFA
      </div>
      
      <div class="footer">
        <p>Merci de votre confiance - Dr. Aïcha Mbaye</p>
        <p>Cette facture a été générée automatiquement par le système Skin 101</p>
      </div>
    </body>
    </html>
  `;

  // Créer un blob et télécharger
  const blob = new Blob([invoiceHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Facture_${invoice.id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'paid': return 'Payé';
    case 'partial': return 'Partiel';
    case 'unpaid': return 'Impayé';
    default: return status;
  }
};