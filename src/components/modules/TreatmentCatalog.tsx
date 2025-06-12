import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, DollarSign, AlertTriangle, Heart, Sparkles, Plus, Edit, Trash2 } from 'lucide-react';
import { appareilService } from '../../services/appareilService';
import { soinService } from '../../services/soinService';
import { forfaitService } from '../../services/forfaitService';
import type { Appareil, Zone, Soin, Forfait } from '../../types';
import SoinForm from '../forms/SoinForm';

interface TreatmentCatalogProps {
  onForfaitSelect?: (forfait: Forfait) => void;
}

const TreatmentCatalog: React.FC<TreatmentCatalogProps> = ({ onForfaitSelect }) => {
  const [appareils, setAppareils] = useState<Appareil[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [soins, setSoins] = useState<Soin[]>([]);
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [selectedAppareil, setSelectedAppareil] = useState<Appareil | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedSoin, setSelectedSoin] = useState<Soin | null>(null);
  const [viewMode, setViewMode] = useState<'appareils' | 'zones' | 'details'>('appareils');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSoin, setEditingSoin] = useState<Soin | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppareils();
  }, []);

  const loadAppareils = async () => {
    try {
      setLoading(true);
      const data = await appareilService.getActive();
      setAppareils(data);
    } catch (error) {
      console.error('Erreur lors du chargement des appareils:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadZones = async (appareilId: string) => {
    try {
      setLoading(true);
      const zonesData = await soinService.getZonesByAppareil(appareilId);
      setZones(zonesData);
    } catch (error) {
      console.error('Erreur lors du chargement des zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSoinDetails = async (appareilId: string, zoneId: string) => {
    try {
      setLoading(true);
      const soinData = await soinService.getByAppareilAndZone(appareilId, zoneId);
      
      if (soinData) {
        setSoins([soinData]);
        setSelectedSoin(soinData);
        // Load forfaits that include this soin
        const forfaitsData = await forfaitService.getBySoinId(soinData.id);
        setForfaits(forfaitsData.filter(f => f.isActive));
      } else {
        setSoins([]);
        setSelectedSoin(null);
        setForfaits([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des soins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppareilSelect = (appareil: Appareil) => {
    setSelectedAppareil(appareil);
    setViewMode('zones');
    loadZones(appareil.id);
  };

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
    setViewMode('details');
    if (selectedAppareil) {
      loadSoinDetails(selectedAppareil.id, zone.id);
    }
  };

  const handleBack = () => {
    if (viewMode === 'details') {
      setViewMode('zones');
      setSelectedZone(null);
      setSelectedSoin(null);
      setSoins([]);
      setForfaits([]);
    } else if (viewMode === 'zones') {
      setViewMode('appareils');
      setSelectedAppareil(null);
      setZones([]);
    }
  };

  const handleCreateSoin = () => {
    setEditingSoin(null);
    setShowAddModal(true);
  };

  const handleSaveSoin = async (soinData: Omit<Soin, 'id'>) => {
    try {
      setError(null);
      
      if (editingSoin) {
        // Mise à jour d'un soin existant
        const updatedSoin = await soinService.update(editingSoin.id, soinData);
        setSoins(prev => prev.map(s => s.id === editingSoin.id ? updatedSoin : s));
        setSelectedSoin(updatedSoin);
      } else {
        // Création d'un nouveau soin
        const newSoin = await soinService.create(soinData);
        setSoins(prev => [...prev, newSoin]);
        setSelectedSoin(newSoin);
      }
      
      setShowAddModal(false);
      setEditingSoin(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du soin:', err);
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const handleEditSoin = (soin: Soin) => {
    setEditingSoin(soin);
    setShowAddModal(true);
  };

  const handleDeleteSoin = async (soinId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce soin ?')) {
      return;
    }

    try {
      setError(null);
      await soinService.delete(soinId);
      setSoins(prev => prev.filter(s => s.id !== soinId));
      setSelectedSoin(null);
    } catch (err) {
      console.error('Erreur lors de la suppression du soin:', err);
      setError('Erreur lors de la suppression. Veuillez réessayer.');
    }
  };

  const handleForfaitSelect = (forfait: Forfait) => {
    if (onForfaitSelect) {
      onForfaitSelect(forfait);
    }
  };

  const AppareilsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Nos Appareils</h2>
          <p className="text-gray-600">Sélectionnez un appareil pour voir les soins disponibles</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appareils.map((appareil) => (
          <div
            key={appareil.id}
            onClick={() => handleAppareilSelect(appareil)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
          >
            <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              {appareil.imageUrl ? (
                <img
                  src={appareil.imageUrl}
                  alt={appareil.nom}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-6xl text-pink-400 group-hover:scale-110 transition-transform">
                  {appareil.icone || '🔬'}
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{appareil.nom}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{appareil.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-pink-600 font-medium text-sm">Voir les soins</span>
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-pink-600 rotate-180" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ZonesView = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Retour aux appareils</span>
        </button>
      </div>
      
      {selectedAppareil && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-4xl">{selectedAppareil.icone || '🔬'}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedAppareil.nom}</h2>
              <p className="text-gray-600">{selectedAppareil.description}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Zones de traitement</h2>
          <p className="text-gray-600">Sélectionnez une zone pour voir les soins disponibles</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => (
            <div
              key={zone.id}
              onClick={() => handleZoneSelect(zone)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{zone.nom}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{zone.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-purple-600 font-medium text-sm">Voir les soins</span>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-purple-600 rotate-180" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DetailsView = () => {
    // If no soin exists for this appareil/zone combination, show create option
    if (!selectedSoin && soins.length === 0) {
      return (
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Retour aux zones</span>
            </button>
          </div>

          {/* Breadcrumb */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{selectedAppareil?.nom}</span>
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span>{selectedZone?.nom}</span>
            </div>
          </div>

          {/* No Soin Found - Create Option */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-10 h-10 text-pink-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucun soin configuré</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Il n'y a pas encore de soin configuré pour la combinaison {selectedAppareil?.nom} - {selectedZone?.nom}.
                </p>
              </div>
              <button
                onClick={handleCreateSoin}
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Créer un soin</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!selectedSoin) return null;

    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Retour aux zones</span>
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{selectedAppareil?.nom}</span>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>{selectedZone?.nom}</span>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span className="text-gray-800 font-medium">{selectedSoin.nom}</span>
          </div>
        </div>

        {/* Soin Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{selectedSoin.nom}</h1>
            <p className="text-pink-100 text-lg">{selectedSoin.description}</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-800">{selectedSoin.duree}</div>
                <div className="text-sm text-gray-600">minutes</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-800">{selectedSoin.prix.toLocaleString()}</div>
                <div className="text-sm text-gray-600">FCFA</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <Heart className="w-8 h-8 text-pink-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-800">Premium</div>
                <div className="text-sm text-gray-600">Qualité</div>
              </div>
            </div>

            {/* Contre-indications */}
            {selectedSoin.contreIndications && selectedSoin.contreIndications.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                  Contre-indications
                </h3>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <ul className="space-y-2">
                    {selectedSoin.contreIndications.map((ci, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-amber-800">{ci}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Conseils post-traitement */}
            {selectedSoin.conseilsPostTraitement && selectedSoin.conseilsPostTraitement.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Heart className="w-5 h-5 text-green-500 mr-2" />
                  Conseils post-traitement
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <ul className="space-y-2">
                    {selectedSoin.conseilsPostTraitement.map((conseil, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-green-800">{conseil}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Consommables attendus */}
            {selectedSoin.expectedConsumables && selectedSoin.expectedConsumables.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Package className="w-5 h-5 text-blue-500 mr-2" />
                  Consommables prévus par séance
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSoin.expectedConsumables.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                        <div>
                          <p className="font-medium text-blue-800">Produit requis</p>
                          <p className="text-sm text-blue-600">ID: {item.productId.slice(0, 8)}...</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-700">{item.quantity}</p>
                          <p className="text-xs text-blue-600">unité(s)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Forfaits */}
        {forfaits.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Forfaits disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forfaits.map((forfait) => (
                <div key={forfait.id} className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-purple-800">{forfait.nom}</h4>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {forfait.validiteMois} mois
                      </span>
                    </div>
                    <p className="text-sm text-purple-700">{forfait.description}</p>
                    <div className="text-center space-y-2">
                      <div className="text-xl font-bold text-purple-600">
                        {forfait.nbSeances} séances
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 line-through">
                          {forfait.prixTotal.toLocaleString()} FCFA
                        </p>
                        <p className="text-xl font-bold text-purple-700">
                          {forfait.prixReduit.toLocaleString()} FCFA
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          Économie: {Math.round(((forfait.prixTotal - forfait.prixReduit) / forfait.prixTotal) * 100)}%
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleForfaitSelect(forfait)}
                      className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Choisir ce forfait
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => handleEditSoin(selectedSoin)}
              className="flex items-center justify-center space-x-2 flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <Edit className="w-5 h-5" />
              <span>Modifier ce soin</span>
            </button>
            <button 
              onClick={() => handleDeleteSoin(selectedSoin.id)}
              className="flex items-center justify-center space-x-2 flex-1 bg-white border-2 border-red-200 text-red-600 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              <span>Supprimer ce soin</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF6F3' }}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Catalogue des Soins
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Découvrez notre gamme complète de soins esthétiques avec nos équipements de pointe
          </p>
          {error && (
            <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 text-sm">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-sm underline mt-1"
              >
                Fermer
              </button>
            </div>
          )}
        </div>

        {/* Navigation Breadcrumb */}
        {(viewMode === 'zones' || viewMode === 'details') && (
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => setViewMode('appareils')}
              className="text-pink-600 hover:text-pink-700 transition-colors"
            >
              Appareils
            </button>
            {viewMode === 'zones' && selectedAppareil && (
              <>
                <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                <span className="text-gray-600">{selectedAppareil.nom}</span>
              </>
            )}
            {viewMode === 'details' && selectedAppareil && selectedZone && (
              <>
                <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                <button
                  onClick={() => setViewMode('zones')}
                  className="text-pink-600 hover:text-pink-700 transition-colors"
                >
                  {selectedAppareil.nom}
                </button>
                <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                <span className="text-gray-600">{selectedZone.nom}</span>
              </>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : (
          <>
            {viewMode === 'appareils' && <AppareilsView />}
            {viewMode === 'zones' && <ZonesView />}
            {viewMode === 'details' && <DetailsView />}
          </>
        )}
      </div>

      {/* Modal de formulaire */}
      {(showAddModal || editingSoin) && (
        <SoinForm
          soin={editingSoin || undefined}
          appareilId={selectedAppareil?.id}
          zoneId={selectedZone?.id}
          onSave={handleSaveSoin}
          onCancel={() => {
            setShowAddModal(false);
            setEditingSoin(null);
          }}
        />
      )}
    </div>
  );
};

export default TreatmentCatalog;