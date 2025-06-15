
import React, { useState, useEffect } from 'react';
import { Bell, Save, AlertCircle } from 'lucide-react';
import { NotificationPreferences } from '../../types/notification';
import { notificationService } from '../../services/notificationService';

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotificationPreferences();
      setPreferences(data || {
        id: '',
        userId: '',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        stockAlerts: true,
        appointmentReminders: true,
        paymentAlerts: true,
        marketingNotifications: false,
        reminderHoursBefore: 24,
        createdAt: '',
        updatedAt: ''
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des préférences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    setError(null);
    try {
      await notificationService.updateNotificationPreferences(preferences);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="p-6 text-center text-gray-500">
        Impossible de charger les préférences
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-800">
            Préférences de notification
          </h2>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <p className="text-green-700 text-sm">Préférences sauvegardées avec succès !</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Canaux de notification
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-gray-700">Notifications par email</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-gray-700">Notifications push</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.smsNotifications}
                  onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-gray-700">Notifications SMS</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Types de notifications
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.stockAlerts}
                  onChange={(e) => handleChange('stockAlerts', e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-gray-700">Alertes de stock</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.appointmentReminders}
                  onChange={(e) => handleChange('appointmentReminders', e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-gray-700">Rappels de rendez-vous</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.paymentAlerts}
                  onChange={(e) => handleChange('paymentAlerts', e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-gray-700">Alertes de paiement</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.marketingNotifications}
                  onChange={(e) => handleChange('marketingNotifications', e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-gray-700">Notifications marketing</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Paramètres des rappels
            </h3>
            <div className="space-y-3">
              <label className="block">
                <span className="text-gray-700 text-sm">
                  Envoyer les rappels de rendez-vous
                </span>
                <select
                  value={preferences.reminderHoursBefore}
                  onChange={(e) => handleChange('reminderHoursBefore', parseInt(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value={1}>1 heure avant</option>
                  <option value={2}>2 heures avant</option>
                  <option value={4}>4 heures avant</option>
                  <option value={24}>24 heures avant</option>
                  <option value={48}>48 heures avant</option>
                  <option value={72}>72 heures avant</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
