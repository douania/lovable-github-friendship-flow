import { supabase } from '../integrations/supabase/client';

class SchedulerService {
  // Démarrer les tâches automatiques
  async initializeScheduler() {
    // Programmer les rappels de rendez-vous
    this.scheduleAppointmentReminders();
    
    // Programmer les sauvegardes automatiques  
    this.scheduleAutoBackups();
    
    // Programmer la génération d'alertes intelligentes
    this.scheduleSmartAlerts();
  }

  // Programmer les rappels de rendez-vous (tous les jours à 9h)
  private scheduleAppointmentReminders() {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(9, 0, 0, 0);
    
    // Si 9h est déjà passé aujourd'hui, programmer pour demain
    if (now > nextRun) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    const timeUntilNext = nextRun.getTime() - now.getTime();
    
    setTimeout(() => {
      this.sendAppointmentReminders();
      // Répéter toutes les 24 heures
      setInterval(() => this.sendAppointmentReminders(), 24 * 60 * 60 * 1000);
    }, timeUntilNext);
  }

  // Programmer les sauvegardes automatiques (tous les jours à 2h du matin)
  private scheduleAutoBackups() {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(2, 0, 0, 0);
    
    if (now > nextRun) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    const timeUntilNext = nextRun.getTime() - now.getTime();
    
    setTimeout(() => {
      this.createAutoBackup();
      // Répéter toutes les 24 heures
      setInterval(() => this.createAutoBackup(), 24 * 60 * 60 * 1000);
    }, timeUntilNext);
  }

  // Programmer les alertes intelligentes (toutes les heures)
  private scheduleSmartAlerts() {
    // Exécuter immédiatement puis toutes les heures
    this.generateSmartAlerts();
    setInterval(() => this.generateSmartAlerts(), 60 * 60 * 1000);
  }

  // Envoyer les rappels de rendez-vous
  private async sendAppointmentReminders() {
    try {
      const { data, error } = await supabase.functions.invoke('send-appointment-reminder');
      
      if (error) {
        console.error('Erreur rappels automatiques:', error);
        return;
      }
      
      console.log('Rappels automatiques envoyés:', data);
    } catch (error) {
      console.error('Erreur service rappels:', error);
    }
  }

  // Créer une sauvegarde automatique
  private async createAutoBackup() {
    try {
      const { data, error } = await supabase.functions.invoke('auto-backup');
      
      if (error) {
        console.error('Erreur sauvegarde automatique:', error);
        return;
      }
      
      console.log('Sauvegarde automatique créée:', data);
    } catch (error) {
      console.error('Erreur service sauvegarde:', error);
    }
  }

  // Générer des alertes intelligentes
  private async generateSmartAlerts() {
    try {
      // Vérifier les stocks faibles
      await this.checkLowStock();
      
      // Vérifier les rendez-vous à confirmer
      await this.checkPendingAppointments();
      
      // Vérifier les produits proches de l'expiration
      await this.checkExpiringProducts();
      
    } catch (error) {
      console.error('Erreur génération alertes:', error);
    }
  }

  // Vérifier les stocks faibles
  private async checkLowStock() {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .lte('quantity', supabase.rpc('min_quantity'));
    
    if (error) return;
    
    for (const product of products || []) {
      // Vérifier si une alerte existe déjà
      const { data: existingAlert } = await supabase
        .from('system_notifications')
        .select('id')
        .eq('type', 'stock_alert')
        .eq('product_id', product.id)
        .eq('is_dismissed', false)
        .single();
      
      if (!existingAlert) {
        await supabase
          .from('system_notifications')
          .insert({
            type: 'stock_alert',
            title: `Stock faible: ${product.name}`,
            message: `Le produit "${product.name}" a un stock de ${product.quantity} unités (minimum: ${product.min_quantity})`,
            priority: product.quantity === 0 ? 'urgent' : 'high',
            product_id: product.id,
            metadata: {
              current_stock: product.quantity,
              min_stock: product.min_quantity,
              suggested_reorder: product.min_quantity * 3
            }
          });
      }
    }
  }

  // Vérifier les rendez-vous en attente de confirmation
  private async checkPendingAppointments() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (
          first_name,
          last_name,
          phone
        )
      `)
      .eq('status', 'scheduled')
      .eq('date', tomorrow.toISOString().split('T')[0]);
    
    if (error || !appointments) return;
    
    for (const appointment of appointments) {
      // Vérifier si un rappel existe déjà
      const { data: existingReminder } = await supabase
        .from('system_notifications')
        .select('id')
        .eq('type', 'appointment_confirmation')
        .eq('appointment_id', appointment.id)
        .single();
      
      if (!existingReminder) {
        await supabase
          .from('system_notifications')
          .insert({
            type: 'appointment_confirmation',
            title: 'Confirmer rendez-vous de demain',
            message: `Rendez-vous avec ${appointment.patients.first_name} ${appointment.patients.last_name} à ${appointment.time}`,
            priority: 'medium',
            appointment_id: appointment.id,
            patient_id: appointment.patient_id,
            metadata: {
              patient_phone: appointment.patients.phone,
              appointment_time: appointment.time,
              appointment_date: appointment.date
            }
          });
      }
    }
  }

  // Vérifier les produits proches de l'expiration
  private async checkExpiringProducts() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .not('expiry_date', 'is', null)
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0]);
    
    if (error || !products) return;
    
    for (const product of products) {
      const daysUntilExpiry = Math.ceil(
        (new Date(product.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilExpiry <= 30) {
        // Vérifier si une alerte existe déjà
        const { data: existingAlert } = await supabase
          .from('system_notifications')
          .select('id')
          .eq('type', 'stock_alert') // Utiliser le même type pour les expirations
          .eq('product_id', product.id)
          .like('message', '%expire%')
          .eq('is_dismissed', false)
          .single();
        
        if (!existingAlert) {
          await supabase
            .from('system_notifications')
            .insert({
              type: 'stock_alert',
              title: `Produit proche de l'expiration: ${product.name}`,
              message: `Le produit "${product.name}" expire dans ${daysUntilExpiry} jour(s) (${new Date(product.expiry_date).toLocaleDateString('fr-FR')})`,
              priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
              product_id: product.id,
              expires_at: new Date(product.expiry_date).toISOString(),
              metadata: {
                days_until_expiry: daysUntilExpiry,
                expiry_date: product.expiry_date,
                current_stock: product.quantity
              }
            });
        }
      }
    }
  }

  // Méthodes pour les tests et le contrôle manuel
  async triggerAppointmentReminders() {
    return this.sendAppointmentReminders();
  }

  async triggerAutoBackup() {
    return this.createAutoBackup();
  }

  async triggerSmartAlerts() {
    return this.generateSmartAlerts();
  }
}

export const schedulerService = new SchedulerService();