
import React from 'react';
import { AlertTriangle, Calendar } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onRestock?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onRestock }) => {
  const isLowStock = product.quantity <= product.minQuantity;
  const isExpiringSoon = product.expiryDate &&
    new Date(product.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${
      isLowStock ? 'border-orange-200 bg-orange-50' : 'border-gray-100'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-800">{product.name}</h3>
            {isLowStock && (
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            )}
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            {product.category}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Stock actuel</p>
          <p className={`text-xl font-bold ${isLowStock ? 'text-orange-600' : 'text-gray-800'}`}>
            {product.quantity}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Stock minimum</p>
          <p className="text-xl font-bold text-gray-800">{product.minQuantity}</p>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Prix unitaire</span>
          <span className="text-sm font-medium text-gray-800">{product.unitPrice.toLocaleString()} FCFA</span>
        </div>
        {product.sellingPrice && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Prix vente conseillé</span>
            <span className="text-sm font-medium text-green-600">{product.sellingPrice.toLocaleString()} FCFA</span>
          </div>
        )}
        {product.unit && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Unité</span>
            <span className="text-sm font-medium text-gray-800">{product.unit}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Valeur totale</span>
          <span className="text-sm font-medium text-gray-800">
            {(product.quantity * product.unitPrice).toLocaleString()} FCFA
          </span>
        </div>
        {product.supplier && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Fournisseur</span>
            <span className="text-sm font-medium text-gray-800">{product.supplier}</span>
          </div>
        )}
      </div>
      {product.expiryDate && (
        <div className={`p-3 rounded-lg ${isExpiringSoon ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
          <div className="flex items-center space-x-2">
            <Calendar className={`w-4 h-4 ${isExpiringSoon ? 'text-red-500' : 'text-gray-500'}`} />
            <div>
              <p className={`text-sm font-medium ${isExpiringSoon ? 'text-red-800' : 'text-gray-700'}`}>
                Expiration: {new Date(product.expiryDate).toLocaleDateString('fr-FR')}
              </p>
              {isExpiringSoon && (
                <p className="text-red-600 text-xs">Expire bientôt!</p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>Maj: {new Date(product.lastRestocked).toLocaleDateString('fr-FR')}</span>
        {isLowStock && onRestock && (
          <button
            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            onClick={() => onRestock(product.id)}
          >
            Réapprovisionner
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
