
import React, { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

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

interface PricingFiltersProps {
  items: PricingItem[];
  onFilterChange: (filtered: PricingItem[]) => void;
}

const PricingFilters: React.FC<PricingFiltersProps> = ({ items, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'soin' | 'forfait'>('all');
  const [profitabilityFilter, setProfitabilityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'margin' | 'price'>('margin');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    filterAndSortItems();
  }, [items, searchTerm, typeFilter, profitabilityFilter, sortBy, sortOrder]);

  const filterAndSortItems = () => {
    let filtered = [...items];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Profitability filter
    if (profitabilityFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (profitabilityFilter === 'high') return item.marginPercentage >= 30;
        if (profitabilityFilter === 'medium') return item.marginPercentage >= 15 && item.marginPercentage < 30;
        if (profitabilityFilter === 'low') return item.marginPercentage < 15;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'margin':
          aValue = a.marginPercentage;
          bValue = b.marginPercentage;
          break;
        case 'price':
          aValue = a.sellingPrice;
          bValue = b.sellingPrice;
          break;
        default:
          aValue = a.marginPercentage;
          bValue = b.marginPercentage;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    onFilterChange(filtered);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'soin' | 'forfait')}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="all">Tous les types</option>
          <option value="soin">Soins uniquement</option>
          <option value="forfait">Forfaits uniquement</option>
        </select>

        {/* Profitability Filter */}
        <select
          value={profitabilityFilter}
          onChange={(e) => setProfitabilityFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="all">Toutes rentabilités</option>
          <option value="high">Très rentable (≥30%)</option>
          <option value="medium">Modérément rentable (15-30%)</option>
          <option value="low">Peu rentable (&lt;15%)</option>
        </select>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'margin' | 'price')}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="margin">Trier par marge</option>
            <option value="price">Trier par prix</option>
            <option value="name">Trier par nom</option>
          </select>
          
          <button
            onClick={toggleSortOrder}
            className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            title={`Tri ${sortOrder === 'asc' ? 'croissant' : 'décroissant'}`}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="w-5 h-5 text-gray-600" />
            ) : (
              <SortDesc className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingFilters;
