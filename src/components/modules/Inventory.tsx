import React, { useState } from 'react';
import { Search, Plus, AlertTriangle, Package, TrendingDown, Calendar } from 'lucide-react';
import { Product } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { mockProducts } from '../../data/mockData';
import ProductForm from '../forms/ProductForm';
import { usePaginatedData } from '../../hooks/usePaginatedData';
import PaginationControls from '../ui/PaginationControls';

const Inventory: React.FC = () => {
  const [products, setProducts] = useLocalStorage<Product[]>('products', mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  
  // Use paginated data
  const {
    paginatedData: paginatedProducts,
    pagination,
    totalItems,
    isFiltered
  } = usePaginatedData({
    data: products,
    searchTerm,
    filters: { category: categoryFilter },
    searchFields: ['name', 'supplier'],
    initialPageSize: 12
  });

  const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);

  const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id 
          ? { ...productData, id: editingProduct.id }
          : p
      ));
    } else {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString()
      };
      setProducts(prev => [...prev, newProduct]);
    }
    setShowAddModal(false);
    setEditingProduct(null);
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
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
          {isLowStock && (
            <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
              Réapprovisionner
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Stocks</h1>
          <p className="text-gray-600">Suivi des produits et consommables</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Produit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Valeur totale stock</p>
              <p className="text-2xl font-bold text-blue-700">{totalValue.toLocaleString()} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Produits en rupture</p>
              <p className="text-2xl font-bold text-orange-700">{lowStockProducts.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total produits</p>
              <p className="text-2xl font-bold text-green-700">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-800">Alerte Stock Faible</h3>
              <p className="text-orange-700">{lowStockProducts.length} produit(s) nécessitent un réapprovisionnement</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.map(product => (
              <span key={product.id} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                {product.name} ({product.quantity}/{product.minQuantity})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
        >
          <option value="all">Toutes catégories</option>
          {categories.filter(c => c !== 'all').map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <div className="text-sm text-gray-600 bg-white px-4 py-3 rounded-xl border border-gray-200">
          {isFiltered ? `${totalItems} produit(s) trouvé(s)` : `${totalItems} produit(s)`}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalItems > 0 && (
        <PaginationControls
          pagination={pagination}
          className="mt-6"
        />
      )}

      {totalItems === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-500">
            {isFiltered ? 'Aucun produit ne correspond à vos critères de recherche' : 'Commencez par ajouter votre premier produit'}
          </p>
        </div>
      )}

      {(showAddModal || editingProduct) && (
        <ProductForm
          product={editingProduct || undefined}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default Inventory;
