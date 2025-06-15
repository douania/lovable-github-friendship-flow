import React, { useState, useEffect } from 'react';
import { Search, Plus, AlertTriangle, Package, TrendingDown, Calendar } from 'lucide-react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import ProductForm from '../forms/ProductForm';
import ProductCard from '../products/ProductCard';
import LowStockAlert from '../products/LowStockAlert';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      setError('Erreur lors du chargement des produits. Vérifiez votre connexion Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.supplier && product.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      setError(null);
      
      if (editingProduct) {
        const updatedProduct = await productService.updateProduct(editingProduct.id, productData);
        setProducts(prev => prev.map(p => 
          p.id === editingProduct.id ? updatedProduct : p
        ));
      } else {
        const newProduct = await productService.createProduct(productData);
        setProducts(prev => [newProduct, ...prev]);
      }
      
      setShowAddModal(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du produit:', err);
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
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

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm underline mt-1"
          >
            Fermer
          </button>
        </div>
      )}

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

      <LowStockAlert products={lowStockProducts} />

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
          {filteredProducts.length} produit(s)
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-500">Aucun produit ne correspond à vos critères de recherche</p>
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
