import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Clock, 
  Database,
  Save,
  Mail,
  Phone
} from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../hooks/useAuth';

interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  appointment_reminders: boolean;
  stock_alerts: boolean;
  payment_alerts: boolean;
  marketing_notifications: boolean;
  reminder_hours_before: number;
}

interface UserProfile {
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url?: string;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    phone: ''
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    appointment_reminders: true,
    stock_alerts: true,
    payment_alerts: true,
    marketing_notifications: false,
    reminder_hours_before: 24
  });

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          phone: profileData.phone || ''
        });
      }

      // Load notification preferences
      const { data: notifData, error: notifError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (notifError && notifError.code !== 'PGRST116') {
        throw notifError;
      }

      if (notifData) {
        setNotifications({
          email_notifications: notifData.email_notifications ?? true,
          sms_notifications: notifData.sms_notifications ?? false,
          push_notifications: notifData.push_notifications ?? true,
          appointment_reminders: notifData.appointment_reminders ?? true,
          stock_alerts: notifData.stock_alerts ?? true,
          payment_alerts: notifData.payment_alerts ?? true,
          marketing_notifications: notifData.marketing_notifications ?? false,
          reminder_hours_before: notifData.reminder_hours_before ?? 24
        });
      }

    } catch (error: any) {
      console.error('Error loading user data:', error);
      console.log("Erreur: Impossible de charger les paramètres utilisateur");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log("Succès: Profil mis à jour avec succès");

    } catch (error: any) {
      console.error('Error saving profile:', error);
      console.log("Erreur: Impossible de sauvegarder le profil");
    } finally {
      setLoading(false);
    }
  };

  const saveNotifications = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...notifications,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log("Succès: Préférences de notification mises à jour");

    } catch (error: any) {
      console.error('Error saving notifications:', error);
      console.log("Erreur: Impossible de sauvegarder les préférences");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'system', name: 'Système', icon: Database }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
              Prénom
            </label>
            <input
              type="text"
              id="first_name"
              value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom
            </label>
            <input
              type="text"
              id="last_name"
              value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={saveProfile}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder le profil'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Préférences de notification</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Notifications par email</p>
                <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email_notifications}
                onChange={(e) => setNotifications({ ...notifications, email_notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Notifications SMS</p>
                <p className="text-sm text-gray-500">Recevoir les notifications par SMS</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.sms_notifications}
                onChange={(e) => setNotifications({ ...notifications, sms_notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Rappels de rendez-vous</p>
                <p className="text-sm text-gray-500">Recevoir des rappels avant les rendez-vous</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.appointment_reminders}
                onChange={(e) => setNotifications({ ...notifications, appointment_reminders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <p className="font-medium text-gray-900">Délai de rappel</p>
            </div>
            <div className="ml-8">
              <label htmlFor="reminder_hours" className="block text-sm text-gray-700 mb-2">
                Envoyer un rappel {notifications.reminder_hours_before} heure(s) avant le rendez-vous
              </label>
              <input
                type="range"
                id="reminder_hours"
                min="1"
                max="72"
                value={notifications.reminder_hours_before}
                onChange={(e) => setNotifications({ ...notifications, reminder_hours_before: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1h</span>
                <span>24h</span>
                <span>72h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={saveNotifications}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sécurité et confidentialité</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Changement de mot de passe</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Pour modifier votre mot de passe, vous devez vous déconnecter et utiliser la fonction "Mot de passe oublié" sur la page de connexion.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Database className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Sauvegarde des données</p>
                <p className="text-sm text-blue-700 mt-1">
                  Vos données sont automatiquement sauvegardées et sécurisées. Consultez l'onglet "Système" pour plus d'informations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations système</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Version de l'application</h4>
            <p className="text-sm text-gray-600">Version 2.1.0 - Dernière mise à jour : Janvier 2025</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Base de données</h4>
            <p className="text-sm text-gray-600">Connecté à Supabase - Toutes les données sont sécurisées</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Support technique</h4>
            <p className="text-sm text-gray-600">
              Pour toute assistance technique, contactez l'équipe de support à 
              <a href="mailto:support@institut.com" className="text-pink-600 hover:text-pink-700 ml-1">
                support@institut.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && !profile.first_name) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <SettingsIcon className="w-6 h-6 text-pink-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        </div>
        <p className="text-gray-600">Gérez vos préférences et paramètres de compte</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'system' && renderSystemTab()}
        </div>
      </div>
    </div>
  );
};

export default Settings;