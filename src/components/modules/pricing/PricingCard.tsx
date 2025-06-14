
import React, { useState } from 'react';
import { Edit2, TrendingUp, TrendingDown, Package, DollarSign } from 'lucide-react';

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

interface PricingCardProps {
  item: PricingItem;
  onSelect: () => void;
  onPriceUpdate?: (item: PricingItem, newPrice: number) => void;
  isAdmin: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  item, 
  onSelect, 
  onPriceUpdate, 
  isAdmin 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newPrice, setNewPrice] = useState(item.sellingPrice);

  const getProfitabilityColor = (percentage: number) => {
    if (percentage >= 30) return 'green';
    if (percentage >= 15) return 'orange';
    return 'red';
  };

  const getProfitabilityBg = (percentage: number) => {
    if (percentage >= 30) return 'from-green-50 to-emerald-50 border-green-200';
    if (percentage >= 15) return 'from-orange-50 to-yellow-50 border-orange-200';
    return 'from-red-50 to-pink-50 border-red-200';
  };

  const handlePriceSubmit = () => {
    if (onPriceUpdate && newPrice !== item.sellingPrice) {
      onPriceUpdate(item, newPrice);
    }
    setIsEditing(false);
  };

  const calculateNewMargin = (price: number) => {
    const margin = price - item.consumablesCost;
    const percentage = price > 0 ? Math.round((margin / price) * 100) : 0;
    return { margin, percentage };
  };

  const newMarginData = calculateNewMargin(newPrice);
  const color = getProfitabilityColor(item.marginPercentage);

  return (
    <div 
      className={`bg-gradient-to-r ${getProfitabilityBg(item.marginPercentage)} p-6 rounded-2xl border cursor-pointer hover:shadow-lg transition-all duration-300`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              item.type === 'soin' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {item.type === 'soin' ? 'Soin' : 'Forfait'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              item.isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {item.isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
        </div>
        
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Consumables */}
      <div className="mb-4">
        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
          <Package className="w-4 h-4" />
          <span>Consommables ({item.consumables.length})</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-800">
            Coût: {item.consumablesCost.toLocaleString()} FCFA
          </span>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-3">
        {/* Current/New Price */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Prix de vente:</span>
          {isEditing && isAdmin ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePriceSubmit();
                }}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                OK
              </button>
            </div>
          ) : (
            <span className="font-bold text-gray-800">
              {item.sellingPrice.toLocaleString()} FCFA
            </span>
          )}
        </div>

        {/* Margin */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Marge:</span>
          <div className="text-right">
            <div className={`font-bold text-${color}-600`}>
              {(isEditing ? newMarginData.margin : item.margin).toLocaleString()} FCFA
            </div>
            <div className={`flex items-center space-x-1 text-sm text-${color}-600`}>
              {(isEditing ? newMarginData.percentage : item.marginPercentage) >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="font-medium">
                {isEditing ? newMarginData.percentage : item.marginPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Preview New Margin */}
        {isEditing && newPrice !== item.sellingPrice && (
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Nouvelle marge: {newMarginData.margin.toLocaleString()} FCFA ({newMarginData.percentage}%)
            </div>
          </div>
        )}
      </div>

      {/* Profitability Indicator */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Rentabilité:</span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${color}-100 text-${color}-700`}>
            {item.marginPercentage >= 30 ? 'Excellente' : 
             item.marginPercentage >= 15 ? 'Modérée' : 'Faible'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
