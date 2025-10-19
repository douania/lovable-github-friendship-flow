import React, { useState } from 'react';
import { FileSpreadsheet, Download, Calendar, Users, TrendingUp, Package } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';
import { useAppointments } from '../../hooks/useAppointments';
import { useInventory } from '../../hooks/useInventory';

const ExcelReporting: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const { patients } = usePatients();
  const { appointments } = useAppointments();
  const { products } = useInventory();

  const reportTypes = [
    {
      id: 'patients',
      name: 'Rapport Patients',
      description: 'Liste complète des patients avec leurs informations',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'appointments',
      name: 'Rapport Rendez-vous',
      description: 'Historique des rendez-vous par période',
      icon: Calendar,
      color: 'green'
    },
    {
      id: 'revenue',
      name: 'Rapport Revenus',
      description: 'Analyse des revenus et rentabilité',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      id: 'inventory',
      name: 'Rapport Stock',
      description: 'État des stocks et consommations',
      icon: Package,
      color: 'orange'
    }
  ];

  const generateCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePatientsReport = () => {
    const data = patients.map(patient => ({
      'Nom': patient.lastName,
      'Prénom': patient.firstName,
      'Email': patient.email,
      'Téléphone': patient.phone,
      'Date de naissance': patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('fr-FR') : '',
      'Type de peau': patient.skinType || '',
      'Date création': new Date(patient.createdAt).toLocaleDateString('fr-FR'),
      'Dernière visite': patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('fr-FR') : 'Aucune'
    }));
    
    generateCSV(data, 'rapport_patients');
  };

  const generateAppointmentsReport = () => {
    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return aptDate >= startDate && aptDate <= endDate;
    });

    const data = filteredAppointments.map(appointment => ({
      'Date': new Date(appointment.date).toLocaleDateString('fr-FR'),
      'Heure': appointment.time,
      'Patient ID': appointment.patientId,
      'Traitement ID': appointment.treatmentId,
      'Statut': appointment.status,
      'Notes': appointment.notes || '',
      'Date création': new Date(appointment.createdAt).toLocaleDateString('fr-FR')
    }));
    
    generateCSV(data, `rapport_rdv_${dateRange.start}_${dateRange.end}`);
  };

  const generateRevenueReport = () => {
    // Simuler des données de revenus basées sur les rendez-vous
    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return aptDate >= startDate && aptDate <= endDate && apt.status === 'completed';
    });

    const revenueData = filteredAppointments.map(appointment => ({
      'Date': new Date(appointment.date).toLocaleDateString('fr-FR'),
      'Patient ID': appointment.patientId,
      'Traitement ID': appointment.treatmentId,
      'Montant estimé': '0', // À calculer depuis la base de données
      'Mode paiement': 'N/A',
      'Statut': appointment.status
    }));
    
    generateCSV(revenueData, `rapport_revenus_${dateRange.start}_${dateRange.end}`);
  };

  const generateInventoryReport = () => {
    const data = products.map(product => ({
      'Nom produit': product.name,
      'Catégorie': product.category,
      'Stock actuel': product.quantity,
      'Stock minimum': product.minQuantity,
      'Prix unitaire': product.unitPrice,
      'Unité': product.unit || 'unité',
      'Fournisseur': product.supplier || '',
      'Date expiration': product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('fr-FR') : '',
      'Dernier réapprovisionnement': new Date(product.lastRestocked).toLocaleDateString('fr-FR'),
      'Statut stock': product.quantity <= product.minQuantity ? 'Stock faible' : 'Stock OK',
      'Valeur stock': (product.quantity * product.unitPrice).toLocaleString() + ' FCFA'
    }));
    
    
    generateCSV(data, 'rapport_stock');
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) return;
    
    setIsGenerating(true);
    
    try {
      switch (selectedReport) {
        case 'patients':
          generatePatientsReport();
          break;
        case 'appointments':
          generateAppointmentsReport();
          break;
        case 'revenue':
          generateRevenueReport();
          break;
        case 'inventory':
          generateInventoryReport();
          break;
      }
    } catch (error) {
      console.error('Erreur génération rapport:', error);
      alert('Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Rapports Excel</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export au format CSV (compatible Excel)</span>
        </div>
      </div>

      {/* Sélection du type de rapport */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Type de rapport</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((report) => {
            const IconComponent = report.icon;
            return (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedReport === report.id
                    ? `border-${report.color}-500 bg-${report.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <IconComponent className={`w-6 h-6 text-${report.color}-600 mt-1`} />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration de la période */}
      {(selectedReport === 'appointments' || selectedReport === 'revenue') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Période</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Aperçu et génération */}
      {selectedReport && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Génération du rapport</h2>
              <p className="text-sm text-gray-600 mt-1">
                {reportTypes.find(r => r.id === selectedReport)?.description}
              </p>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Génération...' : 'Télécharger CSV'}</span>
            </button>
          </div>

          {/* Statistiques d'aperçu */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Aperçu des données</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {selectedReport === 'patients' && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
                    <div className="text-gray-600">Patients total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {patients.filter(p => p.lastVisit).length}
                    </div>
                    <div className="text-gray-600">Avec visites</div>
                  </div>
                </>
              )}
              
              {selectedReport === 'appointments' && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {appointments.filter(apt => {
                        const startDate = new Date(dateRange.start);
                        const endDate = new Date(dateRange.end);
                        const aptDate = new Date(apt.date);
                        return aptDate >= startDate && aptDate <= endDate;
                      }).length}
                    </div>
                    <div className="text-gray-600">RDV période</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {appointments.filter(apt => apt.status === 'completed').length}
                    </div>
                    <div className="text-gray-600">Terminés</div>
                  </div>
                </>
              )}
              
              {selectedReport === 'inventory' && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                    <div className="text-gray-600">Produits total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {products.filter(p => p.quantity <= p.minQuantity).length}
                    </div>
                    <div className="text-gray-600">Stock faible</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelReporting;