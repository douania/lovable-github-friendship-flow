import { supabase } from '../lib/supabase';
import { ConsumptionReport, StockAlert, CostAnalysis } from '../types';

// Fonction pour convertir les données de la DB vers le type ConsumptionReport
const mapDbConsumptionReportToConsumptionReport = (dbReport: any): ConsumptionReport => ({
  id: dbReport.id,
  appointmentId: dbReport.appointment_id,
  soinId: dbReport.soin_id,
  productId: dbReport.product_id,
  expectedQuantity: dbReport.expected_quantity,
  actualQuantity: dbReport.actual_quantity,
  varianceQuantity: dbReport.variance_quantity,
  variancePercentage: dbReport.variance_percentage,
  costImpact: dbReport.cost_impact,
  reportDate: dbReport.report_date,
  createdAt: dbReport.created_at
});

// Fonction pour convertir les données de la DB vers le type StockAlert
const mapDbStockAlertToStockAlert = (dbAlert: any): StockAlert => ({
  id: dbAlert.id,
  productId: dbAlert.product_id,
  alertType: dbAlert.alert_type,
  severity: dbAlert.severity,
  title: dbAlert.title,
  message: dbAlert.message,
  thresholdValue: dbAlert.threshold_value,
  currentValue: dbAlert.current_value,
  suggestedAction: dbAlert.suggested_action,
  isRead: dbAlert.is_read,
  isDismissed: dbAlert.is_dismissed,
  expiresAt: dbAlert.expires_at,
  createdAt: dbAlert.created_at
});

// Fonction pour convertir les données de la DB vers le type CostAnalysis
const mapDbCostAnalysisToCostAnalysis = (dbAnalysis: any): CostAnalysis => ({
  id: dbAnalysis.id,
  soinId: dbAnalysis.soin_id,
  analysisPeriodStart: dbAnalysis.analysis_period_start,
  analysisPeriodEnd: dbAnalysis.analysis_period_end,
  totalSessions: dbAnalysis.total_sessions,
  expectedCost: dbAnalysis.expected_cost,
  actualCost: dbAnalysis.actual_cost,
  costVariance: dbAnalysis.cost_variance,
  costVariancePercentage: dbAnalysis.cost_variance_percentage,
  profitMargin: dbAnalysis.profit_margin,
  optimizationSuggestions: dbAnalysis.optimization_suggestions || [],
  createdAt: dbAnalysis.created_at
});

export const consumptionService = {
  // Récupérer tous les rapports de consommation
  async getConsumptionReports(limit?: number): Promise<ConsumptionReport[]> {
    try {
      let query = supabase
        .from('consumption_reports')
        .select(`
          *,
          products (*),
          soins (*),
          appointments (*)
        `)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des rapports de consommation:', error);
        throw error;
      }

      return data?.map(mapDbConsumptionReportToConsumptionReport) || [];
    } catch (error) {
      console.error('Erreur dans getConsumptionReports:', error);
      throw error;
    }
  },

  // Récupérer les rapports de consommation par soin
  async getConsumptionReportsBySoin(soinId: string): Promise<ConsumptionReport[]> {
    try {
      const { data, error } = await supabase
        .from('consumption_reports')
        .select(`
          *,
          products (*),
          appointments (*)
        `)
        .eq('soin_id', soinId)
        .order('report_date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des rapports par soin:', error);
        throw error;
      }

      return data?.map(mapDbConsumptionReportToConsumptionReport) || [];
    } catch (error) {
      console.error('Erreur dans getConsumptionReportsBySoin:', error);
      throw error;
    }
  },

  // Récupérer les rapports de consommation par produit
  async getConsumptionReportsByProduct(productId: string): Promise<ConsumptionReport[]> {
    try {
      const { data, error } = await supabase
        .from('consumption_reports')
        .select(`
          *,
          soins (*),
          appointments (*)
        `)
        .eq('product_id', productId)
        .order('report_date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des rapports par produit:', error);
        throw error;
      }

      return data?.map(mapDbConsumptionReportToConsumptionReport) || [];
    } catch (error) {
      console.error('Erreur dans getConsumptionReportsByProduct:', error);
      throw error;
    }
  },

  // Créer un rapport de consommation
  async createConsumptionReport(reportData: Omit<ConsumptionReport, 'id' | 'varianceQuantity' | 'variancePercentage' | 'createdAt'>): Promise<ConsumptionReport> {
    try {
      const { data, error } = await supabase
        .from('consumption_reports')
        .insert([{
          appointment_id: reportData.appointmentId,
          soin_id: reportData.soinId,
          product_id: reportData.productId,
          expected_quantity: reportData.expectedQuantity,
          actual_quantity: reportData.actualQuantity,
          cost_impact: reportData.costImpact,
          report_date: reportData.reportDate
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du rapport de consommation:', error);
        throw error;
      }

      return mapDbConsumptionReportToConsumptionReport(data);
    } catch (error) {
      console.error('Erreur dans createConsumptionReport:', error);
      throw error;
    }
  },

  // Récupérer toutes les alertes de stock
  async getStockAlerts(includeRead: boolean = false): Promise<StockAlert[]> {
    try {
      let query = supabase
        .from('stock_alerts')
        .select(`
          *,
          products (*)
        `)
        .eq('is_dismissed', false)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (!includeRead) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des alertes:', error);
        throw error;
      }

      return data?.map(mapDbStockAlertToStockAlert) || [];
    } catch (error) {
      console.error('Erreur dans getStockAlerts:', error);
      throw error;
    }
  },

  // Marquer une alerte comme lue
  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) {
        console.error('Erreur lors du marquage de l\'alerte comme lue:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans markAlertAsRead:', error);
      throw error;
    }
  },

  // Ignorer une alerte
  async dismissAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .update({ is_dismissed: true })
        .eq('id', alertId);

      if (error) {
        console.error('Erreur lors de l\'ignorance de l\'alerte:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans dismissAlert:', error);
      throw error;
    }
  },

  // Générer des alertes intelligentes
  async generateSmartAlerts(): Promise<void> {
    try {
      const { error } = await supabase.rpc('generate_smart_alerts');

      if (error) {
        console.error('Erreur lors de la génération des alertes:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans generateSmartAlerts:', error);
      throw error;
    }
  },

  // Récupérer les analyses de coûts
  async getCostAnalyses(soinId?: string): Promise<CostAnalysis[]> {
    try {
      let query = supabase
        .from('cost_analysis')
        .select(`
          *,
          soins (*)
        `)
        .order('created_at', { ascending: false });

      if (soinId) {
        query = query.eq('soin_id', soinId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des analyses de coûts:', error);
        throw error;
      }

      return data?.map(mapDbCostAnalysisToCostAnalysis) || [];
    } catch (error) {
      console.error('Erreur dans getCostAnalyses:', error);
      throw error;
    }
  },

  // Calculer la variance de consommation pour un rendez-vous
  async calculateConsumptionVariance(appointmentId: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('calculate_consumption_variance', {
        appointment_id_param: appointmentId
      });

      if (error) {
        console.error('Erreur lors du calcul de la variance:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans calculateConsumptionVariance:', error);
      throw error;
    }
  },

  // Obtenir les statistiques de consommation
  async getConsumptionStats(): Promise<{
    totalReports: number;
    averageVariance: number;
    costImpact: number;
    topOverconsumedProducts: Array<{
      productId: string;
      productName: string;
      averageVariance: number;
      totalCostImpact: number;
    }>;
  }> {
    try {
      const { data, error } = await supabase
        .from('consumption_reports')
        .select(`
          *,
          products (name)
        `);

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw error;
      }

      const reports = data || [];
      const totalReports = reports.length;
      const averageVariance = reports.length > 0 
        ? reports.reduce((sum, r) => sum + r.variance_percentage, 0) / reports.length 
        : 0;
      const costImpact = reports.reduce((sum, r) => sum + r.cost_impact, 0);

      // Calculer les produits les plus surconsommés
      const productStats = reports.reduce((acc, report) => {
        const productId = report.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            productId,
            productName: report.products?.name || 'Produit inconnu',
            variances: [],
            totalCostImpact: 0
          };
        }
        acc[productId].variances.push(report.variance_percentage);
        acc[productId].totalCostImpact += report.cost_impact;
        return acc;
      }, {} as any);

      const topOverconsumedProducts = Object.values(productStats)
        .map((stats: any) => ({
          productId: stats.productId,
          productName: stats.productName,
          averageVariance: stats.variances.reduce((sum: number, v: number) => sum + v, 0) / stats.variances.length,
          totalCostImpact: stats.totalCostImpact
        }))
        .filter(p => p.averageVariance > 0)
        .sort((a, b) => b.averageVariance - a.averageVariance)
        .slice(0, 5);

      return {
        totalReports,
        averageVariance,
        costImpact,
        topOverconsumedProducts
      };
    } catch (error) {
      console.error('Erreur dans getConsumptionStats:', error);
      throw error;
    }
  }
};