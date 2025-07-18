import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface ProfitabilityData {
  treatment_id: string;
  treatment_name: string;
  total_sessions: number;
  total_revenue: number;
  total_cost: number;
  profit: number;
  profit_margin: number;
  avg_session_cost: number;
  avg_session_price: number;
}

interface MonthlyStats {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
  sessions: number;
}

interface CostAnalysis {
  id: string;
  soin_id: string | null;
  analysis_period_start: string;
  analysis_period_end: string;
  expected_cost: number | null;
  actual_cost: number | null;
  cost_variance: number | null;
  cost_variance_percentage: number | null;
  profit_margin: number | null;
  total_sessions: number | null;
  optimization_suggestions: any[] | null;
}

const ProfitabilityDashboard: React.FC = () => {
  const [profitabilityData, setProfitabilityData] = useState<ProfitabilityData[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [costAnalyses, setCostAnalyses] = useState<CostAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('3months');
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalCosts: 0,
    totalProfit: 0,
    profitMargin: 0,
    totalSessions: 0
  });

  useEffect(() => {
    loadProfitabilityData();
  }, [selectedPeriod]);

  const loadProfitabilityData = async () => {
    setLoading(true);
    try {
      // Calculer les dates selon la période sélectionnée
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case '1month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Charger les rendez-vous avec les détails des soins
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          status,
          treatment_id,
          consumed_products,
          soins!appointments_treatment_id_fkey(nom, prix)
        `)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .eq('status', 'completed');

      if (appointmentsError) throw appointmentsError;

      // Charger les analyses de coûts
      const { data: analyses, error: analysesError } = await supabase
        .from('cost_analysis')
        .select('*')
        .gte('analysis_period_start', startDate.toISOString().split('T')[0])
        .order('analysis_period_start', { ascending: false });

      if (analysesError) throw analysesError;

      const processedAnalyses: CostAnalysis[] = (analyses || []).map(analysis => ({
        ...analysis,
        optimization_suggestions: Array.isArray(analysis.optimization_suggestions) 
          ? analysis.optimization_suggestions 
          : []
      }));
      setCostAnalyses(processedAnalyses);

      // Calculer la rentabilité par soin
      const treatmentStats = new Map<string, any>();
      
      (appointments || []).forEach((appointment: any) => {
        const treatmentId = appointment.treatment_id;
        const treatmentName = appointment.soins?.nom || 'Soin inconnu';
        const sessionPrice = appointment.soins?.prix || 0;
        
        // Calculer le coût des produits consommés
        let sessionCost = 0;
        if (appointment.consumed_products) {
          // Note: Ici on devrait calculer le coût réel des produits
          // Pour l'instant, on estime 30% du prix du soin
          sessionCost = sessionPrice * 0.3;
        }

        if (treatmentStats.has(treatmentId)) {
          const existing = treatmentStats.get(treatmentId);
          existing.total_sessions += 1;
          existing.total_revenue += sessionPrice;
          existing.total_cost += sessionCost;
        } else {
          treatmentStats.set(treatmentId, {
            treatment_id: treatmentId,
            treatment_name: treatmentName,
            total_sessions: 1,
            total_revenue: sessionPrice,
            total_cost: sessionCost,
            avg_session_price: sessionPrice
          });
        }
      });

      // Finaliser les calculs
      const profitabilityResults: ProfitabilityData[] = Array.from(treatmentStats.values()).map(stat => {
        const profit = stat.total_revenue - stat.total_cost;
        const profitMargin = stat.total_revenue > 0 ? (profit / stat.total_revenue) * 100 : 0;
        const avgSessionCost = stat.total_sessions > 0 ? stat.total_cost / stat.total_sessions : 0;

        return {
          ...stat,
          profit,
          profit_margin: profitMargin,
          avg_session_cost: avgSessionCost
        };
      }).sort((a, b) => b.profit - a.profit);

      setProfitabilityData(profitabilityResults);

      // Calculer les statistiques totales
      const totals = profitabilityResults.reduce((acc, item) => ({
        totalRevenue: acc.totalRevenue + item.total_revenue,
        totalCosts: acc.totalCosts + item.total_cost,
        totalProfit: acc.totalProfit + item.profit,
        totalSessions: acc.totalSessions + item.total_sessions
      }), { totalRevenue: 0, totalCosts: 0, totalProfit: 0, totalSessions: 0 });

      const overallProfitMargin = totals.totalRevenue > 0 
        ? (totals.totalProfit / totals.totalRevenue) * 100 
        : 0;

      setTotalStats({ ...totals, profitMargin: overallProfitMargin });

      // Générer les stats mensuelles
      generateMonthlyStats(appointments || []);

    } catch (error) {
      console.error('Error loading profitability data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyStats = (appointments: any[]) => {
    const monthlyMap = new Map<string, any>();
    
    appointments.forEach((appointment: any) => {
      const date = new Date(appointment.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const revenue = appointment.soins?.prix || 0;
      const cost = revenue * 0.3; // Estimation du coût

      if (monthlyMap.has(monthKey)) {
        const existing = monthlyMap.get(monthKey);
        existing.revenue += revenue;
        existing.costs += cost;
        existing.sessions += 1;
      } else {
        monthlyMap.set(monthKey, {
          month: monthKey,
          revenue,
          costs: cost,
          sessions: 1
        });
      }
    });

    const monthlyResults = Array.from(monthlyMap.values()).map(stat => ({
      ...stat,
      profit: stat.revenue - stat.costs
    })).sort((a, b) => a.month.localeCompare(b.month));

    setMonthlyStats(monthlyResults);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getProfitColor = (profitMargin: number) => {
    if (profitMargin >= 50) return 'text-green-600';
    if (profitMargin >= 30) return 'text-blue-600';
    if (profitMargin >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfitIcon = (profitMargin: number) => {
    if (profitMargin >= 30) return Award;
    if (profitMargin >= 15) return Target;
    return AlertCircle;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyse de la rentabilité en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 text-green-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Analyse de Rentabilité</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1month">Dernier mois</option>
              <option value="3months">3 derniers mois</option>
              <option value="6months">6 derniers mois</option>
              <option value="1year">Dernière année</option>
            </select>
          </div>
        </div>
        <p className="text-gray-600">Tableau de bord de performance financière et d'optimisation des coûts</p>
      </div>

      {/* Indicateurs globaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(totalStats.totalRevenue)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Coûts totaux</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(totalStats.totalCosts)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Bénéfice net</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(totalStats.totalProfit)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Marge bénéficiaire</p>
              <p className={`text-2xl font-bold ${getProfitColor(totalStats.profitMargin)}`}>
                {totalStats.profitMargin.toFixed(1)}%
              </p>
            </div>
            <PieChart className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Sessions totales</p>
              <p className="text-2xl font-bold text-yellow-700">
                {totalStats.totalSessions}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Évolution mensuelle */}
      {monthlyStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Évolution mensuelle</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {monthlyStats.map((stat) => (
                <div key={stat.month} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                      {formatMonth(stat.month)}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">CA:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(stat.revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Coûts:</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(stat.costs)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2">
                        <span className="text-gray-500">Bénéfice:</span>
                        <span className={`font-bold ${stat.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(stat.profit)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {stat.sessions} sessions
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rentabilité par soin */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Rentabilité par soin</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Soin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chiffre d'affaires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coûts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bénéfice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {profitabilityData.map((item) => {
                const ProfitIcon = getProfitIcon(item.profit_margin);
                return (
                  <tr key={item.treatment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.treatment_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.total_sessions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(item.total_revenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">
                        {formatCurrency(item.total_cost)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(item.profit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${getProfitColor(item.profit_margin)}`}>
                        {item.profit_margin.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${getProfitColor(item.profit_margin)}`}>
                        <ProfitIcon className="w-4 h-4 mr-1" />
                        <span className="text-xs">
                          {item.profit_margin >= 50 ? 'Excellent' :
                           item.profit_margin >= 30 ? 'Très bon' :
                           item.profit_margin >= 15 ? 'Correct' : 'À améliorer'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analyses de coûts récentes */}
      {costAnalyses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Analyses de coûts récentes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {costAnalyses.slice(0, 5).map((analysis) => (
                <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          Période: {new Date(analysis.analysis_period_start).toLocaleDateString('fr-FR')} - {new Date(analysis.analysis_period_end).toLocaleDateString('fr-FR')}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {analysis.total_sessions} sessions
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Coût prévu:</span>
                          <div className="font-medium">{formatCurrency(analysis.expected_cost || 0)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Coût réel:</span>
                          <div className="font-medium">{formatCurrency(analysis.actual_cost || 0)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Écart:</span>
                          <div className={`font-medium ${(analysis.cost_variance || 0) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {(analysis.cost_variance || 0) >= 0 ? '+' : ''}{formatCurrency(analysis.cost_variance || 0)}
                            ({(analysis.cost_variance_percentage || 0) >= 0 ? '+' : ''}{(analysis.cost_variance_percentage || 0).toFixed(1)}%)
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Marge:</span>
                          <div className={`font-medium ${getProfitColor(analysis.profit_margin || 0)}`}>
                            {analysis.profit_margin?.toFixed(1) || 0}%
                          </div>
                        </div>
                      </div>

                      {analysis.optimization_suggestions && analysis.optimization_suggestions.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs font-medium text-blue-800 mb-1">
                            💡 Suggestions d'optimisation:
                          </p>
                          <ul className="text-xs text-blue-700 space-y-1">
                            {analysis.optimization_suggestions.slice(0, 3).map((suggestion, index) => (
                              <li key={index}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitabilityDashboard;