import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, Star, Filter, Search, Download, Printer as Print } from 'lucide-react';
import { soinService } from '../../services/soinService';
import { appareilService } from '../../services/appareilService';
import { forfaitService } from '../../services/forfaitService';
import type { Soin, Appareil, Forfait } from '../../types';

const PriceList: React.FC = () => {
  const [soins, setSoins] = useState<Soin[]>([]);
  const [appareils, setAppareils] = useState<Appareil[]>([]);
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [selectedAppareil, setSelectedAppareil] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'soins' | 'forfaits'>('soins');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [soinsData, appareilsData, forfaitsData] = await Promise.all([
        soinService.getAllActive(),
        appareilService.getActive(),
        forfaitService.getActive()
      ]);
      
      setSoins(soinsData);
      setAppareils(appareilsData);
      setForfaits(forfaitsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSoins = soins.filter(soin => {
    const matchesSearch = soin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         soin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAppareil = selectedAppareil === 'all' || soin.appareilId === selectedAppareil;
    return matchesSearch && matchesAppareil;
  });

  const filteredForfaits = forfaits.filter(forfait =>
    forfait.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forfait.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedSoins = filteredSoins.reduce((acc, soin) => {
    const appareilNom = soin.appareil?.nom || 'Autre';
    if (!acc[appareilNom]) {
      acc[appareilNom] = [];
    }
    acc[appareilNom].push(soin);
    return acc;
  }, {} as Record<string, Soin[]>);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = generatePriceListContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tarifs-skin101.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePriceListContent = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Tarifs - Skin 101</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #ec4899; font-size: 28px; font-weight: bold; }
          .clinic-info { color: #6b7280; margin-top: 10px; }
          .section { margin: 30px 0; }
          .section h2 { color: #1f2937; border-bottom: 2px solid #ec4899; padding-bottom: 10px; }
          .treatment-group { margin: 20px 0; }
          .treatment-group h3 { color: #374151; background: #f9fafb; padding: 10px; margin: 0; }
          .treatment { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #e5e7eb; }
          .treatment-info { flex: 1; }
          .treatment-name { font-weight: bold; color: #1f2937; }
          .treatment-desc { color: #6b7280; font-size: 14px; margin-top: 5px; }
          .treatment-details { text-align: right; }
          .price { font-weight: bold; color: #059669; font-size: 16px; }
          .duration { color: #6b7280; font-size: 14px; }
          .package { background: #fef3f2; border: 1px solid #fecaca; padding: 15px; margin: 10px 0; border-radius: 8px; }
          .package-name { font-weight: bold; color: #dc2626; }
          .package-savings { color: #059669; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Skin 101</div>
          <div class="clinic-info">Cabinet de Médecine Esthétique<br>Dr. Aïcha Mbaye<br>Dakar, Sénégal</div>
        </div>
        
        <div class="section">
          <h2>Tarifs des Soins</h2>
          ${Object.entries(groupedSoins).map(([appareilNom, soinsGroup]) => `
            <div class="treatment-group">
              <h3>${appareilNom}</h3>
              ${soinsGroup.map(soin => `
                <div class="treatment">
                  <div class="treatment-info">
                    <div class="treatment-name">${soin.nom}</div>
                    <div class="treatment-desc">${soin.description}</div>
                  </div>
                  <div class="treatment-details">
                    <div class="price">${soin.prix.toLocaleString()} FCFA</div>
                    <div class="duration">${soin.duree} min</div>
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
        
        <div class="section">
          <h2>Forfaits Avantageux</h2>
          ${forfaits.map(forfait => `
            <div class="package">
              <div class="package-name">${forfait.nom}</div>
              <div style="margin: 10px 0;">${forfait.description}</div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong>${forfait.nbSeances} séances</strong> - Validité: ${forfait.validiteMois} mois
                </div>
                <div style="text-align: right;">
                  <div style="text-decoration: line-through; color: #6b7280;">${forfait.prixTotal.toLocaleString()} FCFA</div>
                  <div style="font-size: 18px; font-weight: bold; color: #dc2626;">${forfait.prixReduit.toLocaleString()} FCFA</div>
                  <div class="package-savings">Économie: ${Math.round(((forfait.prixTotal - forfait.prixReduit) / forfait.prixTotal) * 100)}%</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Tarifs valables à partir du ${new Date().toLocaleDateString('fr-FR')}</p>
          <p>Consultations sur rendez-vous uniquement - Paiement: Espèces, Mobile Money, Carte bancaire</p>
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des tarifs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Liste des Prix</h1>
          <p className="text-gray-600">Tarifs de tous nos soins et forfaits</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Print className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un soin ou forfait..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('soins')}
              className={`px-4 py-3 rounded-xl transition-colors ${
                viewMode === 'soins' 
                  ? 'bg-pink-100 text-pink-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Soins individuels
            </button>
            <button
              onClick={() => setViewMode('forfaits')}
              className={`px-4 py-3 rounded-xl transition-colors ${
                viewMode === 'forfaits' 
                  ? 'bg-pink-100 text-pink-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Forfaits
            </button>
          </div>

          {viewMode === 'soins' && (
            <select
              value={selectedAppareil}
              onChange={(e) => setSelectedAppareil(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
            >
              <option value="all">Tous les appareils</option>
              {appareils.map(appareil => (
                <option key={appareil.id} value={appareil.id}>{appareil.nom}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'soins' ? (
        <div className="space-y-6">
          {Object.entries(groupedSoins).map(([appareilNom, soinsGroup]) => (
            <div key={appareilNom} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
                <h2 className="text-xl font-bold">{appareilNom}</h2>
                <p className="text-pink-100">{soinsGroup.length} soin(s) disponible(s)</p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {soinsGroup.map((soin) => (
                  <div key={soin.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{soin.nom}</h3>
                        <p className="text-gray-600 text-sm mb-3">{soin.description}</p>
                        {soin.zone && (
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {soin.zone.nom}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-1 text-green-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xl font-bold">{soin.prix.toLocaleString()}</span>
                            <span className="text-sm">FCFA</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{soin.duree} minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredForfaits.map((forfait) => (
              <div key={forfait.id} className="bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{forfait.nom}</h3>
                    <p className="text-gray-600 text-sm mb-4">{forfait.description}</p>
                  </div>
                  <Star className="w-6 h-6 text-orange-500" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nombre de séances:</span>
                    <span className="font-semibold text-gray-800">{forfait.nbSeances}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Validité:</span>
                    <span className="font-semibold text-gray-800">{forfait.validiteMois} mois</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Prix normal:</span>
                    <span className="line-through text-gray-500">{forfait.prixTotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Prix forfait:</span>
                    <span className="text-2xl font-bold text-orange-600">{forfait.prixReduit.toLocaleString()} FCFA</span>
                  </div>
                  <div className="bg-green-100 border border-green-200 rounded-lg p-3 text-center">
                    <span className="text-green-700 font-semibold">
                      Économie: {Math.round(((forfait.prixTotal - forfait.prixReduit) / forfait.prixTotal) * 100)}% 
                      ({(forfait.prixTotal - forfait.prixReduit).toLocaleString()} FCFA)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {((viewMode === 'soins' && filteredSoins.length === 0) || 
        (viewMode === 'forfaits' && filteredForfaits.length === 0)) && (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun résultat trouvé</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Aucun élément ne correspond à votre recherche' : 'Aucun élément disponible'}
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-2xl p-6">
        <h3 className="font-semibold text-pink-800 mb-3">Informations importantes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-pink-700">
          <div>
            <p className="mb-2">• Consultations sur rendez-vous uniquement</p>
            <p className="mb-2">• Paiement: Espèces, Mobile Money, Carte bancaire</p>
            <p>• Devis personnalisé disponible</p>
          </div>
          <div>
            <p className="mb-2">• Forfaits valables selon durée indiquée</p>
            <p className="mb-2">• Tarifs susceptibles de modification</p>
            <p>• Consultation préalable recommandée</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceList;