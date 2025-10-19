
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Clock, Package, Calendar } from 'lucide-react';
import { SystemNotification } from '../../types/notification';
import { notificationService } from '../../services/notificationService';

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getUserNotifications();
      setNotifications(data.filter(n => !n.isDismissed));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDismiss = async (notificationId: string) => {
    try {
      await notificationService.dismissNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };


  const getNotificationIcon = (type: SystemNotification['type']) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'stock_alert':
        return <Package className={`${iconClass} text-warning`} />;
      case 'appointment_reminder':
        return <Calendar className={`${iconClass} text-primary`} />;
      case 'payment_due':
        return <AlertCircle className={`${iconClass} text-destructive`} />;
      case 'system_maintenance':
        return <Clock className={`${iconClass} text-muted-foreground`} />;
      default:
        return <Bell className={`${iconClass} text-primary`} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary-light transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 bg-card rounded-xl shadow-elegant-lg border border-border z-50 max-h-[32rem] overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary-light/20 to-accent/10">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-primary hover:text-primary-glow font-medium transition-colors"
                  >
                    Tout lire
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-muted-foreground text-sm">Chargement...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-8 h-8 text-primary opacity-50" />
                  </div>
                  <p className="text-muted-foreground">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 transition-all hover:bg-muted/30 ${
                      notification.priority === 'urgent' ? 'border-l-destructive bg-destructive/5' :
                      notification.priority === 'high' ? 'border-l-warning bg-warning-light/50' :
                      notification.priority === 'medium' ? 'border-l-primary bg-primary-light/30' :
                      'border-l-muted bg-card'
                    } ${!notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          notification.type === 'stock_alert' ? 'bg-warning-light' :
                          notification.type === 'appointment_reminder' ? 'bg-primary-light' :
                          notification.type === 'payment_due' ? 'bg-destructive/10' :
                          'bg-muted'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-semibold mb-1 ${
                            !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            {new Date(notification.createdAt).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-success hover:bg-success-light transition-all"
                            title="Marquer comme lu"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(notification.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          title="Supprimer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
