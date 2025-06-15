
import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Save } from 'lucide-react';
import { useClientAuth } from '../../hooks/useClientAuth';

const ClientProfile: React.FC = () => {
  const { patient } = useClientAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: patient?.first_name || '',
    lastName: patient?.last_name || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    dateOfBirth: patient?.date_of_birth || '',
    skinType: patient?.skin_type || '',
    medicalHistory: patient?.medical_history || ''
  });

  const handleSave = () => {
    // Ici on pourrait implémenter la sauvegarde
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Sauvegarder</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              Modifier
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-20 w-20 bg-pink-100 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-pink-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {patient?.first_name} {patient?.last_name}
            </h2>
            <p className="text-gray-600">Client depuis {new Date(patient?.created_at).getFullYear()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Prénom
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              />
            ) : (
              <p className="text-gray-900 py-2">{patient?.first_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nom
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              />
            ) : (
              <p className="text-gray-900 py-2">{patient?.last_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              />
            ) : (
              <p className="text-gray-900 py-2">{patient?.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Téléphone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              />
            ) : (
              <p className="text-gray-900 py-2">{patient?.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date de naissance
            </label>
            {isEditing ? (
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              />
            ) : (
              <p className="text-gray-900 py-2">
                {patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('fr-FR') : 'Non renseigné'}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="">Sélectionner</option>
                <option value="normale">Normale</option>
                <option value="seche">Sèche</option>
                <option value="grasse">Grasse</option>
                <option value="mixte">Mixte</option>
                <option value="sensible">Sensible</option>
              </select>
            ) : (
              <p className="text-gray-900 py-2">{patient?.skin_type || 'Non renseigné'}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Historique médical
          </label>
          {isEditing ? (
            <textarea
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              placeholder="Antécédents médicaux, allergies, traitements en cours..."
            />
          ) : (
            <p className="text-gray-900 py-2 bg-gray-50 rounded-lg px-3 min-h-[100px]">
              {patient?.medical_history || 'Aucun antécédent médical renseigné'}
            </p>
          )}
        </div>
      </div>

      {/* Conseils de sécurité */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Conseils de sécurité
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Vos données personnelles sont protégées et confidentielles</li>
          <li>• Tenez vos informations à jour pour un suivi optimal</li>
          <li>• Signalez tout changement médical important</li>
          <li>• N&apos;hésitez pas à poser vos questions lors des consultations</li>
        </ul>
      </div>
    </div>
  );
};

export default ClientProfile;
