
import React, { useState, useEffect } from 'react';
import { Calculator, Package, DollarSign, TrendingUp, Settings, Save } from 'lucide-react';
import { soinService } from '../../services/soinService';
import { forfaitService } from '../../services/forfaitService';
import { productService } from '../../services/productService';

interface ConsumableItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
}

interface ServiceItem {
  id: string;
  type: 'soin' | 'forfait';
  name: string;
  description: string;
  currentPrice: number;
  consumables: ConsumableItem[];
  totalConsumableCost: number;
  suggestedPrice: number;
  margin: number;
  marginPercentage: number;
}

const PricingAndConsumables: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [soinsData, forfaitsData, productsData] = await Promise.all([
        soinService.getAll(),
        forfaitService.getAll(),
        productService.getAll()
      ]);

      setProducts(productsData);

      // Convertir les soins et forfaits en ServiceItem
      const serviceItems: ServiceItem[] = [
        ...soinsData.map(soin => ({
          id: soin.id,
          type: 'soin' as const,
          name: soin.nom,
          description: soin.description,
          currentPrice: soin.prix,
          consumables: [],
          totalConsumableCost: 0,
          suggestedPrice: soin.prix,
          margin: soin.prix,
          marginPercentage: 100
        })),
        ...forfaitsData.map(forfait => ({
          id: forfait.id,
          type: 'forfait' as const,
          name: forfait.nom,
          description: forfait.description,
          currentPrice: forfait.prixReduit,
          consumables: [],
          totalConsumableCost: 0,
          suggestedPrice: forfait.prixReduit,
          margin: forfait.prixReduit,
          marginPercentage: 100
        }))
      ];

      setServices(serviceItems);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = (service: ServiceItem, consumables: ConsumableItem[], newPrice?: number) => {
    const totalCost = consumables.reduce((sum, item) => sum + item.totalCost, 0);
    const price = newPrice || service.currentPrice;
    const margin = price - totalCost;
    const marginPercentage = price > 0 ? Math.round((margin / price) * 100) : 0;

    return {
      totalConsumableCost: totalCost,
      margin,
      marginPercentage,
      suggestedPrice: Math.ceil(totalCost * 1.3) // 30% de marge suggérée
    };
  };

  const updateServicePrice = async (serviceId: string, newPrice: number) => {
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) return;

      if (service.type === 'soin') {
        // Mise à jour du prix du soin
        await soinService.update(serviceId, {
          appareilId: '',
          zoneId: '',
          nom: service.name,
          description: service.description,
          duree: 60,
          prix: newPrice,
          contreIndications: [],
          conseilsPostTraitement: [],
          isActive: true,
          createdAt: ''
        });
      } else {
        // Mise à jour du prix du forfait
        const forfait = await forfaitService.getById(serviceId);
        if (forfait) {
          await forfaitService.update(serviceId, {
            ...forfait,
            prixReduit: newPrice
          });
        }
      }

      // Mettre à jour l'état local
      setServices(prev => prev.map(s => 
        s.id === serviceId ? { ...s, currentPrice: newPrice } : s
      ));

      console.log(`Prix mis à jour pour ${service.name}: ${newPrice} FCFA`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du prix:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Configuration des Tarifs</h1>
        </div>
        <p className="text-gray-600">
          Configurez les prix de vos soins et forfaits en analysant les coûts des consommables pour optimiser votre rentabilité.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des services */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Services disponibles</h2>
          
          {services.map(service => {
            const pricing = calculatePricing(service, service.consumables);
            
            return (
              <div
                key={service.id}
                className={`bg-white p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedService?.id === service.id
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedService(service)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.type === 'soin'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {service.type === 'soin' ? 'Soin' : 'Forfait'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {service.description}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">
                      {service.currentPrice.toLocaleString()} FCFA
                    </div>
                    <div className="text-sm text-gray-500">
                      Prix actuel
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-1">
                      <Package className="w-4 h-4" />
                      <span>Coût</span>
                    </div>
                    <div className="font-semibold text-gray-800">
                      {pricing.totalConsumableCost.toLocaleString()} FCFA
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Marge</span>
                    </div>
                    <div className="font-semibold text-gray-800">
                      {pricing.margin.toLocaleString()} FCFA
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>%</span>
                    </div>
                    <div className={`font-semibold ${
                      pricing.marginPercentage >= 30 ? 'text-green-600' :
                      pricing.marginPercentage >= 15 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {pricing.marginPercentage}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Panneau de configuration */}
        <div className="space-y-6">
          {selectedService ? (
            <ServiceConfigPanel
              service={selectedService}
              products={products}
              onPriceUpdate={updateServicePrice}
            />
          ) : (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-center py-8">
                <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Configuration des prix
                </h3>
                <p className="text-gray-500 text-sm">
                  Sélectionnez un service pour configurer son prix et analyser sa rentabilité
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour la configuration d'un service
const ServiceConfigPanel: React.FC<{
  service: ServiceItem;
  products: any[];
  onPriceUpdate: (serviceId: string, newPrice: number) => void;
}> = ({ service, products, onPriceUpdate }) => {
  const [consumables, setConsumables] = useState<ConsumableItem[]>([]);
  const [newPrice, setNewPrice] = useState(service.currentPrice);

  const addConsumable = () => {
    setConsumables([...consumables, {
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      totalCost: 0
    }]);
  };

  const updateConsumable = (index: number, field: keyof ConsumableItem, value: any) => {
    const updated = [...consumables];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        updated[index].productName = product.name;
        updated[index].unitPrice = product.unitPrice;
        updated[index].totalCost = updated[index].quantity * product.unitPrice;
      }
    } else if (field === 'quantity') {
      updated[index].totalCost = value * updated[index].unitPrice;
    }
    
    setConsumables(updated);
  };

  const removeConsumable = (index: number) => {
    setConsumables(consumables.filter((_, i) => i !== index));
  };

  const totalCost = consumables.reduce((sum, item) => sum + item.totalCost, 0);
  const margin = newPrice - totalCost;
  const marginPercentage = newPrice > 0 ? Math.round((margin / newPrice) * 100) : 0;
  const suggestedPrice = Math.ceil(totalCost * 1.3);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Configuration: {service.name}
      </h3>

      {/* Prix actuel */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prix de vente (FCFA)
        </label>
        <input
          type="number"
          value={newPrice}
          onChange={(e) => setNewPrice(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Consommables */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-700">Consommables</h4>
          <button
            onClick={addConsumable}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {consumables.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <select
                value={item.productId}
                onChange={(e) => updateConsumable(index, 'productId', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Sélectionner un produit</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateConsumable(index, 'quantity', Number(e.target.value))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                min="1"
              />
              <span className="text-sm text-gray-600 w-20">
                {item.totalCost.toLocaleString()} FCFA
              </span>
              <button
                onClick={() => removeConsumable(index)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Analyse de rentabilité */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Coût total:</span>
          <span className="font-semibold">{totalCost.toLocaleString()} FCFA</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Marge:</span>
          <span className={`font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {margin.toLocaleString()} FCFA
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Pourcentage:</span>
          <span className={`font-semibold ${
            marginPercentage >= 30 ? 'text-green-600' :
            marginPercentage >= 15 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {marginPercentage}%
          </span>
        </div>
        
        {totalCost > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Prix suggéré (30%):</span>
              <span className="font-semibold text-blue-600">
                {suggestedPrice.toLocaleString()} FCFA
              </span>
            </div>
            <button
              onClick={() => setNewPrice(suggestedPrice)}
              className="w-full mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200"
            >
              Utiliser le prix suggéré
            </button>
          </div>
        )}
      </div>

      {/* Bouton de sauvegarde */}
      <button
        onClick={() => onPriceUpdate(service.id, newPrice)}
        disabled={newPrice === service.currentPrice}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        <Save className="w-4 h-4" />
        <span>Sauvegarder le prix</span>
      </button>
    </div>
  );
};

export default PricingAndConsumables;
