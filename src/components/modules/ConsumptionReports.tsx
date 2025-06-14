import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Package, Calendar, Download } from 'lucide-react';
import { consumptionService } from '../../services/consumptionService';
import { ConsumptionReport, StockAlert } from '../../types';

const ConsumptionReports: React.FC = () => {
  const [reports, setReports] = useState<ConsumptionReport[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsData, alertsData, statsData] = await Promise.all([
        consumptionService.getConsumptionReports(50),
        consumptionService.getStockAlerts(true),
        consumptionService.getConsumptionStats()
      ]);
      
      setReports(reportsData);
      setAlerts(alertsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await consumptionService.markAlertAsRead(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error) {
      console.error('Erreur lors du marquage de l\'alerte:', error);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await consumptionService.dismissAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Erreur lors de l\'ignorance de l\'alerte:', error);
    }
  };

  const generateNewAlerts = async () => {
    try {
      await consumptionService.generateSmartAlerts();
      loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la génération des alertes:', error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (selectedSeverity === 'all') return true;
    return alert.severity === selectedSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 20) return 'text-red-600';
    if (variance > 10) return 'text-orange-600';
    if (variance > 0) return 'text-yellow-600';
    if (variance < -10) return 'text-blue-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des rapports de consommation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rapports de Consommation</h1>
          <p className="text-gray-600">Analyse des écarts et optimisation des coûts</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generateNewAlerts}
            className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Générer alertes</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total rapports</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalReports}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Variance moyenne</p>
                <p className="text-2xl font-bold text-orange-700">{stats.averageVariance.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Impact coût</p>
                <p className="text-2xl font-bold text-red-700">{stats.costImpact.toLocaleString()} FCFA</p>
              </div>
              <DollarSign className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Alertes actives</p>
                <p className="text-2xl font-bold text-yellow-700">{alerts.filter(a => !a.isRead).length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Alertes Intelligentes</h2>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-sm"
            >
              <option value="all">Toutes les sévérités</option>
              <option value="critical">Critique</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>
          </div>
        </div>
        
        <div className="p-6">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune alerte</h3>
              <p className="text-gray-500">Toutes les alertes ont été traitées ou aucune alerte n'a été générée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    alert.isRead ? 'opacity-60' : ''
                  } ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-1">{alert.title}</h3>
                        <p className="text-gray-700 mb-2">{alert.message}</p>
                        {alert.suggestedAction && (
                          <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-800">
                              💡 Action suggérée: {alert.suggestedAction}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(alert.createdAt).toLocaleDateString('fr-FR')}</span>
                          </span>
                          {alert.currentValue && alert.thresholdValue && (
                            <span>
                              Valeur: {alert.currentValue} / Seuil: {alert.thresholdValue}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="px-3 py-1 bg-white bg-opacity-70 text-gray-700 rounded-lg text-sm hover:bg-opacity-90 transition-colors"
                        >
                          Marquer lu
                        </button>
                      )}
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="px-3 py-1 bg-white bg-opacity-70 text-gray-700 rounded-lg text-sm hover:bg-opacity-90 transition-colors"
                      >
                        Ignorer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Overconsumed Products */}
      {stats?.topOverconsumedProducts?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Produits les plus surconsommés</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.topOverconsumedProducts.map((product: any, index: number) => (
                <div key={product.productId} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{product.productName}</h3>
                      <p className="text-sm text-gray-600">
                        Variance moyenne: <span className={getVarianceColor(product.averageVariance)}>
                          {product.averageVariance.toFixed(1)}%
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-700">{product.totalCostImpact.toLocaleString()} FCFA</p>
                    <p className="text-sm text-red-600">Impact coût total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Rapports récents</h2>
        </div>
        <div className="p-6">
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun rapport</h3>
              <p className="text-gray-500">Les rapports de consommation apparaîtront ici</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Produit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Attendu</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Réel</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Variance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Impact coût</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 20).map((report) => (
                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(report.reportDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800">
                          {report.product?.name || 'Produit inconnu'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{report.expectedQuantity}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{report.actualQuantity}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {report.varianceQuantity > 0 ? (
                            <TrendingUp className="w-4 h-4 text-red-500" />
                          ) : report.varianceQuantity < 0 ? (
                            <TrendingDown className="w-4 h-4 text-green-500" />
                          ) : (
                            <span className="w-4 h-4" />
                          )}
                          <span className={`font-medium ${getVarianceColor(report.variancePercentage)}`}>
                            {report.variancePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          report.costImpact > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {report.costImpact > 0 ? '+' : ''}{report.costImpact.toLocaleString()} FCFA
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsumptionReports;
