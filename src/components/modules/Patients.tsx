import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Phone, Mail, Calendar } from 'lucide-react';
import { Patient } from '../../types';
import { patientService } from '../../services/patientService';
import PatientForm from '../forms/PatientForm';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Charger les patients au montage du composant
  React.useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err) {
      console.error('Erreur lors du chargement des patients:', err);
      setError('Erreur lors du chargement des patients. Vérifiez votre connexion Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handleSavePatient = async (patientData: Omit<Patient, 'id'>) => {
    try {
      setError(null);
      
      if (editingPatient) {
        // Mise à jour d'un patient existant
        const updatedPatient = await patientService.update(editingPatient.id, patientData);
        setPatients(prev => prev.map(p => 
          p.id === editingPatient.id ? updatedPatient : p
        ));
      } else {
        // Création d'un nouveau patient
        const newPatient = await patientService.create(patientData);
        setPatients(prev => [newPatient, ...prev]);
      }
      
      setShowAddModal(false);
      setEditingPatient(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du patient:', err);
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowAddModal(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      return;
    }

    try {
      setError(null);
      await patientService.delete(patientId);
      setPatients(prev => prev.filter(p => p.id !== patientId));
      setSelectedPatient(null);
    } catch (err) {
      console.error('Erreur lors de la suppression du patient:', err);
      setError('Erreur lors de la suppression. Veuillez réessayer.');
    }
  };

  const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-700">
              {patient.firstName[0]}{patient.lastName[0]}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{patient.firstName} {patient.lastName}</h3>
            <p className="text-sm text-gray-600">{patient.skinType}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedPatient(patient)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
          <button 
            onClick={() => handleEditPatient(patient)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{patient.phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>{patient.email}</span>
        </div>
        {patient.lastVisit && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Dernière visite: {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
      </div>
      
      {patient.contraindications.length > 0 && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-800 font-medium">Contre-indications:</p>
          <p className="text-sm text-orange-700">{patient.contraindications.join(', ')}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
          <p className="text-gray-600">Gestion des fiches clients</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Patient</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm underline mt-1"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        <div className="text-sm text-gray-600 bg-white px-4 py-3 rounded-xl border border-gray-200">
          {filteredPatients.length} patient(s)
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des patients...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}

      {!loading && filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun patient trouvé</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Aucun patient ne correspond à votre recherche' : 'Commencez par ajouter votre premier patient'}
          </p>
        </div>
      )}

      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Fiche Patient</h2>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-700">
                    {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h3>
                  <p className="text-gray-600">{selectedPatient.skinType}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-800">{selectedPatient.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <p className="text-gray-800">{selectedPatient.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                  <p className="text-gray-800">{new Date(selectedPatient.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de peau</label>
                  <p className="text-gray-800">{selectedPatient.skinType}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Antécédents médicaux</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">{selectedPatient.medicalHistory}</p>
                </div>
              </div>
              
              {selectedPatient.contraindications.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contre-indications</label>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-orange-800">{selectedPatient.contraindications.join(', ')}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <button
                onClick={() => handleDeletePatient(selectedPatient.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => handleEditPatient(selectedPatient)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {(showAddModal || editingPatient) && (
        <PatientForm
          patient={editingPatient || undefined}
          onSave={handleSavePatient}
          onCancel={() => {
            setShowAddModal(false);
            setEditingPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default Patients;