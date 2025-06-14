
import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react';

interface ProfitabilityOverviewProps {
  profitable: number;
  moderate: number;
  low: number;
  totalItems: number;
}

const ProfitabilityOverview: React.FC<ProfitabilityOverviewProps> = ({
  profitable,
  moderate,
  low,
  totalItems
}) => {
  const profitablePercentage = totalItems > 0 ? Math.round((profitable / totalItems) * 100) : 0;
  const moderatePercentage = totalItems > 0 ? Math.round((moderate / totalItems) * 100) : 0;
  const lowPercentage = totalItems > 0 ? Math.round((low / totalItems) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Highly Profitable */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-2xl font-bold text-green-600">{profitablePercentage}%</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-800 mb-1">Très rentables</h3>
          <p className="text-sm text-green-600">
            {profitable} service(s) avec marge ≥ 30%
          </p>
        </div>
      </div>

      {/* Moderately Profitable */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border border-orange-100">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <Target className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-2xl font-bold text-orange-600">{moderatePercentage}%</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-orange-800 mb-1">Rentabilité modérée</h3>
          <p className="text-sm text-orange-600">
            {moderate} service(s) avec marge 15-30%
          </p>
        </div>
      </div>

      {/* Low Profitability */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-100">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <span className="text-2xl font-bold text-red-600">{lowPercentage}%</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-800 mb-1">Faible rentabilité</h3>
          <p className="text-sm text-red-600">
            {low} service(s) avec marge < 15%
          </p>
        </div>
      </div>

      {/* Total Services */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-blue-600">{totalItems}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-800 mb-1">Total services</h3>
          <p className="text-sm text-blue-600">
            Services analysés au total
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfitabilityOverview;
