import { Invoice, Patient, Treatment } from '../types';
import { Quote, QuoteItem } from '../types/consultation';

interface PDFOptions {
  logo?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  doctorName?: string;
  watermark?: boolean;
}

const defaultOptions: PDFOptions = {
  clinicName: 'Skin 101',
  clinicAddress: 'Dakar, Sénégal',
  clinicPhone: '+221 XX XXX XX XX',
  clinicEmail: 'contact@skin101.sn',
  doctorName: 'Dr. Aïcha Mbaye',
  watermark: true
};

export const generateAdvancedInvoicePDF = (
  invoice: Invoice,
  patient: Patient,
  treatments: Treatment[],
  options: Partial<PDFOptions> = {}
) => {
  const opts = { ...defaultOptions, ...options };
  
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Facture ${invoice.id}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: 'Inter', Arial, sans-serif; 
          line-height: 1.6; 
          color: #1f2937;
          background: #ffffff;
        }
        
        .document {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20mm;
          background: white;
          ${opts.watermark ? `
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" opacity="0.1"><text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="20" fill="%23ec4899">SKIN 101</text></svg>');
            background-repeat: no-repeat;
            background-position: center;
            background-size: 300px;
          ` : ''}
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #ec4899;
        }
        
        .logo-section {
          flex: 1;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 700;
          color: #ec4899;
          margin-bottom: 8px;
        }
        
        .clinic-info {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .invoice-badge {
          background: linear-gradient(135deg, #ec4899, #be185d);
          color: white;
          padding: 15px 25px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
        }
        
        .invoice-badge h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .invoice-badge .number {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .details-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin: 40px 0;
        }
        
        .detail-card {
          background: #f9fafb;
          padding: 25px;
          border-radius: 12px;
          border-left: 4px solid #ec4899;
        }
        
        .detail-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .detail-card p {
          margin-bottom: 8px;
          color: #6b7280;
        }
        
        .detail-card strong {
          color: #1f2937;
          font-weight: 600;
        }
        
        .services-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .services-table thead {
          background: linear-gradient(135deg, #ec4899, #be185d);
          color: white;
        }
        
        .services-table th {
          padding: 18px 15px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .services-table td {
          padding: 15px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .services-table tbody tr:hover {
          background: #fdf2f8;
        }
        
        .amount {
          font-weight: 600;
          color: #1f2937;
        }
        
        .total-section {
          margin-top: 30px;
          text-align: right;
        }
        
        .total-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 8px;
        }
        
        .total-label {
          width: 150px;
          text-align: right;
          padding-right: 20px;
          color: #6b7280;
        }
        
        .total-amount {
          width: 120px;
          text-align: right;
          font-weight: 600;
        }
        
        .final-total {
          border-top: 2px solid #ec4899;
          padding-top: 12px;
          margin-top: 12px;
        }
        
        .final-total .total-label,
        .final-total .total-amount {
          font-size: 20px;
          font-weight: 700;
          color: #ec4899;
        }
        
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-paid {
          background: #d1fae5;
          color: #059669;
        }
        
        .status-unpaid {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .status-partial {
          background: #fef3c7;
          color: #d97706;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        
        .footer-logo {
          font-size: 16px;
          font-weight: 600;
          color: #ec4899;
          margin-bottom: 8px;
        }
        
        .thank-you {
          font-size: 14px;
          color: #374151;
          margin-bottom: 20px;
          font-style: italic;
        }
        
        @media print {
          .document { 
            margin: 0; 
            padding: 15mm;
            box-shadow: none;
          }
          body { background: white; }
        }
      </style>
    </head>
    <body>
      <div class="document">
        <div class="header">
          <div class="logo-section">
            <div class="logo">${opts.clinicName}</div>
            <div class="clinic-info">
              ${opts.clinicAddress}<br>
              Tél: ${opts.clinicPhone}<br>
              Email: ${opts.clinicEmail}
            </div>
          </div>
          <div class="invoice-badge">
            <h2>FACTURE</h2>
            <div class="number">N° ${invoice.id}</div>
          </div>
        </div>
        
        <div class="details-section">
          <div class="detail-card">
            <h3>Facturé à</h3>
            <p><strong>${patient.firstName} ${patient.lastName}</strong></p>
            <p>Email: ${patient.email}</p>
            <p>Téléphone: ${patient.phone}</p>
            ${patient.date_of_birth ? `<p>Né(e) le: ${new Date(patient.date_of_birth).toLocaleDateString('fr-FR')}</p>` : ''}
          </div>
          
          <div class="detail-card">
            <h3>Informations facture</h3>
            <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString('fr-FR')}</p>
            <p><strong>Praticien:</strong> ${opts.doctorName}</p>
            <p><strong>Statut:</strong> <span class="status-badge status-${invoice.status}">${getStatusText(invoice.status)}</span></p>
            ${invoice.paid_at ? `<p><strong>Payé le:</strong> ${new Date(invoice.paid_at).toLocaleDateString('fr-FR')}</p>` : ''}
          </div>
        </div>
        
        <table class="services-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Description</th>
              <th style="text-align: center;">Quantité</th>
              <th style="text-align: right;">Prix unitaire</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${treatments.map(treatment => `
              <tr>
                <td><strong>${treatment.name}</strong></td>
                <td>${treatment.description || 'Soin esthétique professionnel'}</td>
                <td style="text-align: center;">1</td>
                <td style="text-align: right;" class="amount">${treatment.price.toLocaleString()} FCFA</td>
                <td style="text-align: right;" class="amount">${treatment.price.toLocaleString()} FCFA</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <div class="total-label">Sous-total:</div>
            <div class="total-amount">${invoice.amount.toLocaleString()} FCFA</div>
          </div>
          <div class="total-row">
            <div class="total-label">TVA (0%):</div>
            <div class="total-amount">0 FCFA</div>
          </div>
          <div class="total-row final-total">
            <div class="total-label">TOTAL À PAYER:</div>
            <div class="total-amount">${invoice.amount.toLocaleString()} FCFA</div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-logo">${opts.clinicName}</div>
          <div class="thank-you">Merci de votre confiance</div>
          <p>Cette facture a été générée automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p>Pour toute question concernant cette facture, contactez-nous à ${opts.clinicEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Créer et télécharger le fichier
  const blob = new Blob([invoiceHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Facture_${invoice.id}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateAdvancedQuotePDF = (
  quote: Quote,
  patient: Patient,
  quoteItems: QuoteItem[],
  options: Partial<PDFOptions> = {}
) => {
  const opts = { ...defaultOptions, ...options };
  
  const quoteHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Devis ${quote.quote_number}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: 'Inter', Arial, sans-serif; 
          line-height: 1.6; 
          color: #1f2937;
          background: #ffffff;
        }
        
        .document {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20mm;
          background: white;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #3b82f6;
        }
        
        .logo-section {
          flex: 1;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 8px;
        }
        
        .clinic-info {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .quote-badge {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          padding: 15px 25px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .quote-badge h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .quote-badge .number {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .details-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin: 40px 0;
        }
        
        .detail-card {
          background: #f8fafc;
          padding: 25px;
          border-radius: 12px;
          border-left: 4px solid #3b82f6;
        }
        
        .detail-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .services-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .services-table thead {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
        }
        
        .services-table th {
          padding: 18px 15px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .services-table td {
          padding: 15px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .total-section {
          margin-top: 30px;
          text-align: right;
        }
        
        .total-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 8px;
        }
        
        .total-label {
          width: 150px;
          text-align: right;
          padding-right: 20px;
          color: #6b7280;
        }
        
        .total-amount {
          width: 120px;
          text-align: right;
          font-weight: 600;
        }
        
        .final-total {
          border-top: 2px solid #3b82f6;
          padding-top: 12px;
          margin-top: 12px;
        }
        
        .final-total .total-label,
        .final-total .total-amount {
          font-size: 20px;
          font-weight: 700;
          color: #3b82f6;
        }
        
        .validity-notice {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin: 30px 0;
          text-align: center;
        }
        
        .validity-notice strong {
          color: #92400e;
        }
        
        .notes-section {
          margin: 30px 0;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="document">
        <div class="header">
          <div class="logo-section">
            <div class="logo">${opts.clinicName}</div>
            <div class="clinic-info">
              ${opts.clinicAddress}<br>
              Tél: ${opts.clinicPhone}<br>
              Email: ${opts.clinicEmail}
            </div>
          </div>
          <div class="quote-badge">
            <h2>DEVIS</h2>
            <div class="number">N° ${quote.quote_number}</div>
          </div>
        </div>
        
        <div class="details-section">
          <div class="detail-card">
            <h3>Client</h3>
            <p><strong>${patient.first_name} ${patient.last_name}</strong></p>
            <p>Email: ${patient.email}</p>
            <p>Téléphone: ${patient.phone}</p>
          </div>
          
          <div class="detail-card">
            <h3>Informations devis</h3>
            <p><strong>Date:</strong> ${new Date(quote.created_at).toLocaleDateString('fr-FR')}</p>
            <p><strong>Praticien:</strong> ${opts.doctorName}</p>
            <p><strong>Statut:</strong> ${getQuoteStatusText(quote.status)}</p>
            ${quote.valid_until ? `<p><strong>Valide jusqu'au:</strong> ${new Date(quote.valid_until).toLocaleDateString('fr-FR')}</p>` : ''}
          </div>
        </div>
        
        <table class="services-table">
          <thead>
            <tr>
              <th>Service proposé</th>
              <th style="text-align: center;">Quantité</th>
              <th style="text-align: right;">Prix unitaire</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${quoteItems.map(item => `
              <tr>
                <td><strong>Service ${item.soin_id}</strong></td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${item.unit_price.toLocaleString()} FCFA</td>
                <td style="text-align: right;">${item.total.toLocaleString()} FCFA</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <div class="total-label">Sous-total:</div>
            <div class="total-amount">${quote.subtotal.toLocaleString()} FCFA</div>
          </div>
          ${quote.discount_amount > 0 ? `
            <div class="total-row">
              <div class="total-label">Remise:</div>
              <div class="total-amount">-${quote.discount_amount.toLocaleString()} FCFA</div>
            </div>
          ` : ''}
          <div class="total-row">
            <div class="total-label">TVA:</div>
            <div class="total-amount">${quote.tax_amount.toLocaleString()} FCFA</div>
          </div>
          <div class="total-row final-total">
            <div class="total-label">TOTAL:</div>
            <div class="total-amount">${quote.total_amount.toLocaleString()} FCFA</div>
          </div>
        </div>
        
        ${quote.valid_until ? `
          <div class="validity-notice">
            <strong>Ce devis est valable jusqu'au ${new Date(quote.valid_until).toLocaleDateString('fr-FR')}</strong>
          </div>
        ` : ''}
        
        ${quote.notes ? `
          <div class="notes-section">
            <h3>Notes et conditions:</h3>
            <p>${quote.notes}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <div class="footer-logo">${opts.clinicName}</div>
          <p>Devis généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          <p>Pour accepter ce devis ou pour toute question, contactez-nous à ${opts.clinicEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Créer et télécharger le fichier
  const blob = new Blob([quoteHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Devis_${quote.quote_number}_${new Date().toISOString().split('T')[0]}.html`;
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

const getQuoteStatusText = (status: string) => {
  switch (status) {
    case 'draft': return 'Brouillon';
    case 'sent': return 'Envoyé';
    case 'accepted': return 'Accepté';
    case 'rejected': return 'Refusé';
    case 'expired': return 'Expiré';
    default: return status;
  }
};