
import { supabase } from '../integrations/supabase/client';
import { SystemNotification, NotificationPreferences } from '../types/notification';

export const notificationService = {
  // Récupérer toutes les notifications de l'utilisateur connecté
  async getUserNotifications(): Promise<SystemNotification[]> {
    try {
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data?.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        targetUserId: notification.target_user_id,
        patientId: notification.patient_id,
        appointmentId: notification.appointment_id,
        productId: notification.product_id,
        isRead: notification.is_read,
        isDismissed: notification.is_dismissed,
        scheduledFor: notification.scheduled_for,
        sentAt: notification.sent_at,
        expiresAt: notification.expires_at,
        metadata: notification.metadata || {},
        createdAt: notification.created_at,
        updatedAt: notification.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead(): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Supprimer une notification
  async dismissNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ is_dismissed: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error dismissing notification:', error);
      throw error;
    }
  },

  // Récupérer les préférences de notification
  async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        emailNotifications: data.email_notifications,
        pushNotifications: data.push_notifications,
        smsNotifications: data.sms_notifications,
        stockAlerts: data.stock_alerts,
        appointmentReminders: data.appointment_reminders,
        paymentAlerts: data.payment_alerts,
        marketingNotifications: data.marketing_notifications,
        reminderHoursBefore: data.reminder_hours_before,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  },

  // Mettre à jour les préférences de notification
  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      const { data: existingPrefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .single();

      const updateData = {
        email_notifications: preferences.emailNotifications,
        push_notifications: preferences.pushNotifications,
        sms_notifications: preferences.smsNotifications,
        stock_alerts: preferences.stockAlerts,
        appointment_reminders: preferences.appointmentReminders,
        payment_alerts: preferences.paymentAlerts,
        marketing_notifications: preferences.marketingNotifications,
        reminder_hours_before: preferences.reminderHoursBefore
      };

      let result;
      if (existingPrefs) {
        const { data, error } = await supabase
          .from('notification_preferences')
          .update(updateData)
          .eq('id', existingPrefs.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
          .from('notification_preferences')
          .insert({ ...updateData, user_id: user.user.id })
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      return {
        id: result.id,
        userId: result.user_id,
        emailNotifications: result.email_notifications,
        pushNotifications: result.push_notifications,
        smsNotifications: result.sms_notifications,
        stockAlerts: result.stock_alerts,
        appointmentReminders: result.appointment_reminders,
        paymentAlerts: result.payment_alerts,
        marketingNotifications: result.marketing_notifications,
        reminderHoursBefore: result.reminder_hours_before,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }
};
