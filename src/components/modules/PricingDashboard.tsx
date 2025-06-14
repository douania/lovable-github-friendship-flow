
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { soinService } from '../../services/soinService';
import { forfaitService } from '../../services/forfaitService';
import { productService } from '../../services/productService';
import { Soin, Forfait, Product } from '../../types';
import { useToast } from '../../hooks/use-toast';
import PricingCard from './pricing/PricingCard';
import ProfitabilityOverview from './pricing/ProfitabilityOverview';
import PriceSimulator from './pricing/PriceSimulator';
import PricingFilters from './pricing/PricingFilters';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

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
  data: Soin | Forfait;
}

const PricingDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';
  
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PricingItem | null>(null);
  
  const [soins, setSoins] = useState<Soin[]>([]);
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [soinsData, forfaitsData, productsData] = await Promise.all([
        soinService.getAllActive(),
        forfaitService.getAll(),
        productService.getAll()
      ]);
      
      setSoins(soinsData);
      setForfaits(forfaitsData);
      setProducts(productsData);
      
      const items = transformToPricingItems(soinsData, forfaitsData, productsData);
      setPricingItems(items);
      setFilteredItems(items);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive",
      });
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

  const handleFilterChange = (filtered: PricingItem[]) => {
    setFilteredItems(filtered);
  };

  const handlePriceUpdate = async (item: PricingItem, newPrice: number) => {
    try {
      if (item.type === 'soin') {
        await soinService.update(item.id, { ...item.data as Soin, prix: newPrice });
      } else {
        await forfaitService.update(item.id, { ...item.data as Forfait, prixReduit: newPrice });
      }
      
      await loadAllData();
      
      toast({
        title: "Prix mis à jour",
        description: `Le prix de ${item.name} a été mis à jour avec succès.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le prix.",
        variant: "destructive",
      });
    }
  };

  const getProfitabilityStats = () => {
    const profitable = filteredItems.filter(item => item.marginPercentage >= 30);
    const moderate = filteredItems.filter(item => item.marginPercentage >= 15 && item.marginPercentage < 30);
    const low = filteredItems.filter(item => item.marginPercentage < 15);
    
    return { profitable, moderate, low };
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

  const stats = getProfitabilityStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Tarifs & Rentabilité</h1>
          <p className="text-gray-600">
            Gestion intelligente des prix et analyse de rentabilité
            {!isAdmin && (
              <span className="text-orange-600 ml-2">(Lecture seule)</span>
            )}
          </p>
        </div>
      </div>

      {/* Profitability Overview */}
      <ProfitabilityOverview 
        profitable={stats.profitable.length}
        moderate={stats.moderate.length}
        low={stats.low.length}
        totalItems={filteredItems.length}
      />

      {/* Filters */}
      <PricingFilters 
        items={pricingItems}
        onFilterChange={handleFilterChange}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pricing Cards - 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Analyse par service ({filteredItems.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <PricingCard
                key={item.id}
                item={item}
                onSelect={() => setSelectedItem(item)}
                onPriceUpdate={isAdmin ? handlePriceUpdate : undefined}
                isAdmin={isAdmin}
              />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun service trouvé</h3>
              <p className="text-gray-500">Ajustez vos filtres pour voir plus de résultats</p>
            </div>
          )}
        </div>

        {/* Price Simulator - 1/3 width */}
        <div className="lg:col-span-1">
          <PriceSimulator 
            selectedItem={selectedItem}
            onPriceUpdate={isAdmin ? handlePriceUpdate : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default PricingDashboard;
