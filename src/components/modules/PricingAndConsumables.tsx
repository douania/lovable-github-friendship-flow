import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Edit, 
  Plus, 
  Download, 
  AlertTriangle, 
  DollarSign, 
  Package, 
  Calculator,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { soinService } from '../../services/soinService';
import { forfaitService } from '../../services/forfaitService';
import { productService } from '../../services/productService';
import { Soin, Forfait, Product } from '../../types';
import SoinForm from '../forms/SoinForm';
import ForfaitForm from '../forms/ForfaitForm';

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
  comment?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
  isActive: boolean;
  data: Soin | Forfait;
}

const PricingAndConsumables: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PricingItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'soin' | 'forfait'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showSoinForm, setShowSoinForm] = useState(false);
  const [showForfaitForm, setShowForfaitForm] = useState(false);
  const [editingSoin, setEditingSoin] = useState<Soin | null>(null);
  const [editingForfait, setEditingForfait] = useState<Forfait | null>(null);
  
  const [soins, setSoins] = useState<Soin[]>([]);
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [pricingItems, searchTerm, typeFilter]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [soinsData, forfaitsData, productsData] = await Promise.all([
        soinService.getAllActive(),
        forfaitService.getAll(),
        productService.getAll()
      ]);
      
      setSoins(soinsData);
      setForfaits(forfaitsData);
      setProducts(productsData);
      
      // Transform data into unified pricing items
      const items = transformToPricingItems(soinsData, forfaitsData, productsData);
      setPricingItems(items);
      
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  const transformToPricingItems = (
    soins: Soin[], 
    forfaits: Forfait[], 
    products: Product[]
  ): PricingItem[] => {
    const items: PricingItem[] = [];
    
    // Transform soins
    soins.forEach(soin => {
      const consumables = (soin.expectedConsumables || []).map(consumable => {
        const product = products.find(p => p.id === consumable.productId);
        return {
          productId: consumable.productId,
          quantity: consumable.quantity,
          name: product?.name || 'Produit inconnu',
          unitPrice: product?.unitPrice || 0
        };
      });
      
      const consumablesCost = consumables.reduce((sum, c) => sum + (c.quantity * c.unitPrice), 0);
      const margin = soin.prix - consumablesCost;
      const marginPercentage = soin.prix > 0 ? Math.round((margin / soin.prix) * 100) : 0;
      
      items.push({
        id: soin.id,
        type: 'soin',
        name: soin.nom,
        description: soin.description,
        consumables,
        consumablesCost,
        sellingPrice: soin.prix,
        margin,
        marginPercentage,
        isActive: soin.isActive,
        data: soin
      });
    });
    
    // Transform forfaits
    forfaits.forEach(forfait => {
      const consumables: Array<{ productId: string; quantity: number; name: string; unitPrice: number; }> = [];
      
      // Calculate consumables from included soins
      forfait.soinIds.forEach(soinId => {
        const soin = soins.find(s => s.id === soinId);
        if (soin && soin.expectedConsumables) {
          soin.expectedConsumables.forEach(consumable => {
            const existingIndex = consumables.findIndex(c => c.productId === consumable.productId);
            const product = products.find(p => p.id === consumable.productId);
            
            if (existingIndex >= 0) {
              consumables[existingIndex].quantity += consumable.quantity;
            } else {
              consumables.push({
                productId: consumable.productId,
                quantity: consumable.quantity,
                name: product?.name || 'Produit inconnu',
                unitPrice: product?.unitPrice || 0
              });
            }
          });
        }
      });
      
      const consumablesCost = consumables.reduce((sum, c) => sum + (c.quantity * c.unitPrice), 0);
      const margin = forfait.prixReduit - consumablesCost;
      const marginPercentage = forfait.prixReduit > 0 ? Math.round((margin / forfait.prixReduit) * 100) : 0;
      
      items.push({
        id: forfait.id,
        type: 'forfait',
        name: forfait.nom,
        description: forfait.description,
        consumables,
        consumablesCost,
        sellingPrice: forfait.prixReduit,
        margin,
        marginPercentage,
        isActive: forfait.isActive,
        data: forfait
      });
    });
    
    return items;
  };

  const filterItems = () => {
    let filtered = pricingItems;
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }
    
    setFilteredItems(filtered);
  };

  const handleEditSoin = (soin: Soin) => {
    if (!isAdmin) return;
    setEditingSoin(soin);
    setShowSoinForm(true);
  };

  const handleEditForfait = (forfait: Forfait) => {
    if (!isAdmin) return;
    setEditingForfait(forfait);
    setShowForfaitForm(true);
  };

  const handleSaveSoin = async (soinData: Omit<Soin, 'id'>) => {
    try {
      setError(null);
      
      if (editingSoin) {
        await soinService.update(editingSoin.id, soinData);
      } else {
        await soinService.create(soinData);
      }
      
      // Reload all data to ensure synchronization
      await loadAllData();
      
      setShowSoinForm(false);
      setEditingSoin(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du soin:', err);
      setError('Erreur lors de la sauvegarde du soin.');
    }
  };

  const handleSaveForfait = async (forfaitData: Omit<Forfait, 'id'>) => {
    try {
      setError(null);
      
      if (editingForfait) {
        await forfaitService.update(editingForfait.id, forfaitData);
      } else {
        await forfaitService.create(forfaitData);
      }
      
      // Reload all data to ensure synchronization
      await loadAllData();
      
      setShowForfaitForm(false);
      setEditingForfait(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du forfait:', err);
      setError('Erreur lors de la sauvegarde du forfait.');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Type',
      'Nom',
      'Description',
      'Consommables',
      'Coût consommables (FCFA)',
      'Prix vente (FCFA)',
      'Marge (FCFA)',
      'Marge (%)',
      'Statut'
    ];
    
    const rows = filteredItems.map(item => [
      item.type === 'soin' ? 'Soin' : 'Forfait',
      item.name,
      item.description,
      item.consumables.map(c => `${c.name} (${c.quantity})`).join('; '),
      item.consumablesCost.toString(),
      item.sellingPrice.toString(),
      item.margin.toString(),
      item.marginPercentage.toString(),
      item.isActive ? 'Actif' : 'Inactif'
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tarifs-consommables-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStockAlert = (consumables: Array<{ productId: string; quantity: number; }>) => {
    const lowStockItems = consumables.filter(consumable => {
      const product = products.find(p => p.id === consumable.productId);
      return product && product.quantity < consumable.quantity;
    });
    
    return lowStockItems.length > 0 ? lowStockItems : null;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tarifs & Consommables</h1>
          <p className="text-gray-600">
            Gestion centralisée des tarifs et consommables
            {!isAdmin && (
              <span className="text-orange-600 ml-2">(Lecture seule)</span>
            )}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exporter CSV</span>
          </button>
          
          {isAdmin && (
            <>
              <button
                onClick={() => setShowSoinForm(true)}
                className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Soin</span>
              </button>
              
              <button
                onClick={() => setShowForfaitForm(true)}
                className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Forfait</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm underline mt-1"
          >
            Fermer
          </button>
        </div>
      )}

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
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'soin' | 'forfait')}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
          >
            <option value="all">Tous les types</option>
            <option value="soin">Soins uniquement</option>
            <option value="forfait">Forfaits uniquement</option>
          </select>
          
          <div className="text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
            {filteredItems.length} élément(s)
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total soins</p>
              <p className="text-2xl font-bold text-blue-700">{soins.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total forfaits</p>
              <p className="text-2xl font-bold text-purple-700">{forfaits.length}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Marge moyenne</p>
              <p className="text-2xl font-bold text-green-700">
                {filteredItems.length > 0 
                  ? Math.round(filteredItems.reduce((sum, item) => sum + item.marginPercentage, 0) / filteredItems.length)
                  : 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Alertes stock</p>
              <p className="text-2xl font-bold text-orange-700">
                {filteredItems.filter(item => getStockAlert(item.consumables)).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Type</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Nom</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Consommables</th>
                <th className="text-right py-4 px-6 font-medium text-gray-700">Coût consommables</th>
                <th className="text-right py-4 px-6 font-medium text-gray-700">Prix vente</th>
                <th className="text-right py-4 px-6 font-medium text-gray-700">Marge</th>
                <th className="text-center py-4 px-6 font-medium text-gray-700">Statut</th>
                {isAdmin && (
                  <th className="text-center py-4 px-6 font-medium text-gray-700">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const stockAlert = getStockAlert(item.consumables);
                
                return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.type === 'soin' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.type === 'soin' ? 'Soin' : 'Forfait'}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600 truncate max-w-xs">{item.description}</p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {item.consumables.length === 0 ? (
                          <span className="text-gray-500 text-sm">Aucun</span>
                        ) : (
                          item.consumables.slice(0, 3).map((consumable, index) => (
                            <div key={index} className="text-sm">
                              <span className="text-gray-800">{consumable.name}</span>
                              <span className="text-gray-500 ml-1">({consumable.quantity})</span>
                            </div>
                          ))
                        )}
                        {item.consumables.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{item.consumables.length - 3} autres...
                          </span>
                        )}
                        {stockAlert && (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-xs">Stock insuffisant</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6 text-right">
                      <span className="font-medium text-gray-800">
                        {item.consumablesCost.toLocaleString()} FCFA
                      </span>
                    </td>
                    
                    <td className="py-4 px-6 text-right">
                      <span className="font-bold text-gray-800">
                        {item.sellingPrice.toLocaleString()} FCFA
                      </span>
                    </td>
                    
                    <td className="py-4 px-6 text-right">
                      <div>
                        <span className={`font-medium ${
                          item.margin > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.margin.toLocaleString()} FCFA
                        </span>
                        <div className="flex items-center justify-end space-x-1">
                          {item.marginPercentage > 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          )}
                          <span className={`text-sm ${
                            item.marginPercentage > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.marginPercentage}%
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    
                    {isAdmin && (
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => {
                            if (item.type === 'soin') {
                              handleEditSoin(item.data as Soin);
                            } else {
                              handleEditForfait(item.data as Forfait);
                            }
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun élément trouvé</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Aucun élément ne correspond à votre recherche' : 'Aucun soin ou forfait configuré'}
            </p>
          </div>
        )}
      </div>

      {/* Forms */}
      {showSoinForm && (
        <SoinForm
          soin={editingSoin || undefined}
          onSave={handleSaveSoin}
          onCancel={() => {
            setShowSoinForm(false);
            setEditingSoin(null);
          }}
        />
      )}

      {showForfaitForm && (
        <ForfaitForm
          forfait={editingForfait || undefined}
          onSave={handleSaveForfait}
          onCancel={() => {
            setShowForfaitForm(false);
            setEditingForfait(null);
          }}
        />
      )}
    </div>
  );
};

export default PricingAndConsumables;