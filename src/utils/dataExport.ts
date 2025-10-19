import { Patient, Appointment, Invoice, Product } from '../types';

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle arrays and objects
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        }
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value)}"`;
        }
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportPatientsToCSV = (patients: Patient[]) => {
  const exportData = patients.map(p => ({
    'Prénom': p.firstName,
    'Nom': p.lastName,
    'Email': p.email,
    'Téléphone': p.phone,
    'Date de naissance': p.dateOfBirth,
    'Type de peau': p.skinType,
    'Dernière visite': p.lastVisit || 'Jamais',
    'Date de création': p.createdAt
  }));
  
  exportToCSV(exportData, 'patients');
};

export const exportAppointmentsToCSV = (appointments: Appointment[], patients: Patient[]) => {
  const exportData = appointments.map(a => {
    const patient = patients.find(p => p.id === a.patientId);
    return {
      'Date': a.date,
      'Heure': a.time,
      'Patient': patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
      'Statut': a.status,
      'Notes': a.notes || '',
      'Créé le': a.createdAt
    };
  });
  
  exportToCSV(exportData, 'rendez-vous');
};

export const exportInvoicesToCSV = (invoices: Invoice[], patients: Patient[]) => {
  const exportData = invoices.map(i => {
    const patient = patients.find(p => p.id === i.patientId);
    return {
      'Numéro': i.id,
      'Patient': patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
      'Montant': i.amount,
      'Statut': i.status,
      'Méthode de paiement': i.paymentMethod,
      'Date de création': i.createdAt,
      'Date de paiement': i.paidAt || 'Non payé'
    };
  });
  
  exportToCSV(exportData, 'factures');
};

export const exportProductsToCSV = (products: Product[]) => {
  const exportData = products.map(p => ({
    'Nom': p.name,
    'Catégorie': p.category,
    'Quantité': p.quantity,
    'Quantité minimale': p.minQuantity,
    'Prix unitaire': p.unitPrice,
    'Prix de vente': p.sellingPrice || '',
    'Unité': p.unit || 'unité',
    'Fournisseur': p.supplier || '',
    'Date d\'expiration': p.expiryDate || '',
    'Dernier réapprovisionnement': p.lastRestocked
  }));
  
  exportToCSV(exportData, 'produits');
};

export const generatePDFReport = async (
  title: string,
  data: any[],
  columns: { key: string; label: string }[]
) => {
  // This is a placeholder for PDF generation
  // In a real implementation, you would use a library like jsPDF or pdfmake
  console.log('PDF Report:', { title, data, columns });
  alert('Fonctionnalité PDF en cours de développement');
};
