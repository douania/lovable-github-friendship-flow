
import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react';

interface PricingItem {
  id: string;
  type: 'soin' | 'forfait';
  name: string;
  description: string;
  consumables: Array<{ productId: string; quantity: number; name: string; unitPrice: number; }>;
  consumablesCost: number;
  sellingPrice: number;
  margin: number;
  marginPercentage: number;
  isActive: boolean;
  data: any;
}

interface PriceSimulatorProps {
  selectedItem: PricingItem | null;
  onPriceUpdate?: (item: PricingItem, newPrice: number) => void;
}

const PriceSimulator: React.FC<PriceSimulatorProps> = ({ 
  selectedItem, 
  onPriceUpdate 
}) => {
  const [simulatedPrice, setSimulatedPrice] = useState(0);
  const [targetMargin, setTargetMargin] = useState(25);

  useEffect(() => {
    if (selectedItem) {
      setSimulatedPrice(selectedItem.sellingPrice);
    }
  }, [selectedItem]);

  if (!selectedItem) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Simulateur de Prix</h3>
          <p className="text-gray-500 text-sm">
            Sélectionnez un service pour simuler différents prix et voir l'impact sur la rentabilité
          </p>
        </div>
      </div>
    );
  }

  const calculateMargin = (price: number) => {
    const margin = price - selectedItem.consumablesCost;
    const percentage = price > 0 ? Math.round((margin / price) * 100) : 0;
    return { margin, percentage };
  };

  const calculatePriceForMargin = (targetPercentage: number) => {
    // Prix = Coût / (1 - Marge%)
    const targetPrice = Math.ceil(selectedItem.consumablesCost / (1 - targetPercentage / 100));
    return targetPrice;
  };

  const currentMargin = calculateMargin(simulatedPrice);
  const recommendedPrice = calculatePriceForMargin(targetMargin);
  const recommendedMargin = calculateMargin(recommendedPrice);

  const getMarginColor = (percentage: number) => {
    if (percentage >= 30) return 'text-green-600';
    if (percentage >= 15) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMarginBg = (percentage: number) => {
    if (percentage >= 30) return 'bg-green-50 border-green-200';
    if (percentage >= 15) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Simulateur de Prix</h3>
      </div>

      {/* Selected Item Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-1">{selectedItem.name}</h4>
        <p className="text-sm text-gray-600 mb-2">
          Coût consommables: {selectedItem.consumablesCost.toLocaleString()} FCFA
        </p>
        <p className="text-sm text-gray-600">
          Prix actuel: {selectedItem.sellingPrice.toLocaleString()} FCFA
        </p>
      </div>

      {/* Price Simulation */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix simulé (FCFA)
          </label>
          <input
            type="number"
            value={simulatedPrice}
            onChange={(e) => setSimulatedPrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={selectedItem.consumablesCost}
          />
        </div>

        {/* Current Simulation Results */}
        <div className={`p-4 rounded-lg border-2 ${getMarginBg(currentMargin.percentage)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Résultat de simulation:</span>
            {currentMargin.percentage >= 0 ? (
              <TrendingUp className={`w-4 h-4 ${getMarginColor(currentMargin.percentage)}`} />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Marge:</span>
              <span className={`font-bold ${getMarginColor(currentMargin.percentage)}`}>
                {currentMargin.margin.toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pourcentage:</span>
              <span className={`font-bold ${getMarginColor(currentMargin.percentage)}`}>
                {currentMargin.percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Target Margin Calculator */}
        <div className="border-t pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Marge cible</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Marge souhaitée (%)
              </label>
              <input
                type="number"
                value={targetMargin}
                onChange={(e) => setTargetMargin(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min={0}
                max={80}
              />
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-purple-700">Prix recommandé:</span>
                <span className="font-bold text-purple-800">
                  {recommendedPrice.toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-700">Marge obtenue:</span>
                <span className="font-bold text-purple-800">
                  {recommendedMargin.margin.toLocaleString()} FCFA ({recommendedMargin.percentage}%)
                </span>
              </div>
            </div>

            <button
              onClick={() => setSimulatedPrice(recommendedPrice)}
              className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
            >
              Utiliser le prix recommandé
            </button>
          </div>
        </div>

        {/* Apply Changes */}
        {onPriceUpdate && simulatedPrice !== selectedItem.sellingPrice && (
          <div className="border-t pt-4">
            <button
              onClick={() => onPriceUpdate(selectedItem, simulatedPrice)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Appliquer ce prix
            </button>
          </div>
        )}

        {/* Warnings */}
        {currentMargin.percentage < 15 && (
          <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Attention:</strong> Marge faible. Considérez augmenter le prix ou optimiser les coûts.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceSimulator;
