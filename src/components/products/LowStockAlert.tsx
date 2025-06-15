
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Product } from '../../types';

interface LowStockAlertProps {
  products: Product[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ products }) => {
  if (products.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-6 rounded-2xl">
      <div className="flex items-center space-x-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-orange-600" />
        <div>
          <h3 className="font-semibold text-orange-800">Alerte Stock Faible</h3>
          <p className="text-orange-700">{products.length} produit(s) nécessitent un réapprovisionnement</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {products.map(product => (
          <span key={product.id} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
            {product.name} ({product.quantity}/{product.minQuantity})
          </span>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlert;
