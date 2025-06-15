
import React, { useState } from 'react';
import { Edit2, Save, X, Eye, EyeOff } from 'lucide-react';
import { useClientAuth } from '../../hooks/useClientAuth';

const ClientProfile: React.FC = () => {
  const { patient, client } = useClientAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [formData, setFormData] = useState({
    firstName: patient?.first_name || '',
    lastName: patient?.last_name || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    dateOfBirth: patient?.date_of_birth || '',
    skinType: patient?.skin_type || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async () => {
    // TODO: Implement profile update
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: patient?.first_name || '',
      lastName: patient?.last_name || '',
      email: patient?.email || '',
      phone: patient?.phone || '',
      dateOfBirth: patient?.date_of_birth || '',
      skinType: patient?.skin_type || ''
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    // TODO: Implement password change
    console.log('Changing password');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordSection(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            <span>Modifier</span>
          </button>
        )}
      </div>

      {/* Informations personnelles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              ) : (
                <p className="text-gray-900">{formData.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              ) : (
                <p className="text-gray-900">{formData.lastName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              ) : (
                <p className="text-gray-900">{formData.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              ) : (
                <p className="text-gray-900">{formData.phone}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de naissance
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              ) : (
                <p className="text-gray-900">
                  {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('fr-FR') : '-'}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de peau
              </label>
              {isEditing ? (
                <select
                  value={formData.skinType}
                  onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Sélectionner</option>
                  <option value="normale">Normale</option>
                  <option value="seche">Sèche</option>
                  <option value="grasse">Grasse</option>
                  <option value="mixte">Mixte</option>
                  <option value="sensible">Sensible</option>
                </select>
              ) : (
                <p className="text-gray-900">{formData.skinType || '-'}</p>
              )}
            </div>
          </div>
          
          {isEditing && (
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Enregistrer</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Annuler</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sécurité */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="text-pink-600 hover:text-pink-700 text-sm font-medium"
            >
              Changer le mot de passe
            </button>
          </div>
        </div>
        
        {showPasswordSection && (
          <div className="p-6">
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handlePasswordChange}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-6 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            <p><strong>Dernière connexion:</strong> {client?.lastLogin ? new Date(client.lastLogin).toLocaleString('fr-FR') : 'Jamais'}</p>
            <p><strong>Compte créé le:</strong> {client?.createdAt ? new Date(client.createdAt).toLocaleDateString('fr-FR') : '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
