
export interface SystemNotification {
  id: string;
  type: 'stock_alert' | 'appointment_reminder' | 'payment_due' | 'system_maintenance' | 'appointment_confirmation';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetUserId?: string;
  patientId?: string;
  appointmentId?: string;
  productId?: string;
  isRead: boolean;
  isDismissed: boolean;
  scheduledFor?: string;
  sentAt?: string;
  expiresAt?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  stockAlerts: boolean;
  appointmentReminders: boolean;
  paymentAlerts: boolean;
  marketingNotifications: boolean;
  reminderHoursBefore: number;
  createdAt: string;
  updatedAt: string;
}
