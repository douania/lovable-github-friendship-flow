import { supabase } from '../integrations/supabase/client';
import { ConsumptionReport, StockAlert, CostAnalysis } from '../types';

// Fonction pour convertir les données de la DB vers le type ConsumptionReport
const mapDbConsumptionReportToConsumptionReport = (dbReport: any): ConsumptionReport => ({
  id: dbReport.id,
  appointmentId: dbReport.appointment_id || '',
  soinId: dbReport.soin_id || '',
  productId: dbReport.product_id || '',
  expectedQuantity: dbReport.expected_quantity,
  actualQuantity: dbReport.actual_quantity,
  varianceQuantity: dbReport.variance_quantity || 0,
  variancePercentage: dbReport.variance_percentage || 0,
  costImpact: dbReport.cost_impact || 0,
  reportDate: dbReport.report_date || '',
  createdAt: dbReport.created_at || ''
});

// Fonction pour convertir les données de la DB vers le type StockAlert
const mapDbStockAlertToStockAlert = (dbAlert: any): StockAlert => ({
  id: dbAlert.id,
  productId: dbAlert.product_id || '',
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
  createdAt: dbAlert.created_at || ''
});

// Fonction pour convertir les données de la DB vers le type CostAnalysis
const mapDbCostAnalysisToCostAnalysis = (dbAnalysis: any): CostAnalysis => ({
  id: dbAnalysis.id,
  soinId: dbAnalysis.soin_id || '',
  analysisPeriodStart: dbAnalysis.analysis_period_start,
  analysisPeriodEnd: dbAnalysis.analysis_period_end,
  totalSessions: dbAnalysis.total_sessions,
  expectedCost: dbAnalysis.expected_cost,
  actualCost: dbAnalysis.actual_cost,
  costVariance: dbAnalysis.cost_variance,
  costVariancePercentage: dbAnalysis.cost_variance_percentage,
  profitMargin: dbAnalysis.profit_margin,
  optimizationSuggestions: dbAnalysis.optimization_suggestions || [],
  createdAt: dbAnalysis.created_at || ''
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
  async createConsumptionReport(reportData: Omit<ConsumptionReport, 'id' | 'createdAt'>): Promise<ConsumptionReport> {
    try {
      const { data, error } = await supabase
        .from('consumption_reports')
        .insert([{
          appointment_id: reportData.appointmentId,
          soin_id: reportData.soinId,
          product_id: reportData.productId,
          expected_quantity: reportData.expectedQuantity,
          actual_quantity: reportData.actualQuantity,
          variance_quantity: reportData.varianceQuantity,
          variance_percentage: reportData.variancePercentage,
          cost_impact: reportData.costImpact,
          report_date: reportData.reportDate,
          created_at: new Date().toISOString()
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
  async getConsumptionStats(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('consumption_reports')
        .select('*');

      if (error) throw error;

      // Calculate basic stats
      const totalReports = data?.length || 0;
      const averageVariance = data?.reduce((sum, report) => sum + (report.variance_percentage || 0), 0) / totalReports || 0;
      const costImpact = data?.reduce((sum, report) => sum + (report.cost_impact || 0), 0) || 0;

      return {
        totalReports,
        averageVariance,
        costImpact,
        topOverconsumedProducts: []
      };
    } catch (error) {
      console.error('Error fetching consumption stats:', error);
      throw error;
    }
  },

  // Récupérer les tendances de consommation
  async getConsumptionTrends(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('consumption_reports')
        .select('*')
        .gte('report_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('report_date');

      if (error) throw error;

      // Group by product and calculate trends
      const grouped = data?.reduce((acc: any, report: any) => {
        if (!acc[report.product_id]) {
          acc[report.product_id] = [];
        }
        acc[report.product_id].push(report);
        return acc;
      }, {});

      return Object.entries(grouped || {}).map(([productId, reports]: [string, any]) => ({
        productId,
        totalConsumed: (reports as any[]).reduce((sum: number, r: any) => sum + r.actual_quantity, 0),
        averageConsumption: (reports as any[]).reduce((sum: number, r: any) => sum + r.actual_quantity, 0) / (reports as any[]).length,
        variance: (reports as any[]).reduce((acc: number, report: any) => {
          return acc + Math.abs(report.variance_quantity || 0);
        }, 0)
      }));
    } catch (error) {
      console.error('Error fetching consumption trends:', error);
      throw error;
    }
  }
};
