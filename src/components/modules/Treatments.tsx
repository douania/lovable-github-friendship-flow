import React, { useState } from 'react';
import { Search, Plus, Edit, Star, Clock, DollarSign } from 'lucide-react';
import { Treatment } from '../../types';
import { treatmentService } from '../../services/treatmentService';
import TreatmentForm from '../forms/TreatmentForm';
import { useToast } from '../../hooks/use-toast';

const Treatments: React.FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const { toast } = useToast();

  // Charger les traitements au montage du composant
  React.useEffect(() => {
    loadTreatments();
  }, []);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await treatmentService.getAll();
      setTreatments(data);
    } catch (err) {
      console.error('Erreur lors du chargement des traitements:', err);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des traitements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(treatments.map(t => t.category)))];
  
  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || treatment.category === selectedCategory;
    return matchesSearch && matchesCategory && treatment.isActive;
  });

  const handleSaveTreatment = async (treatmentData: Omit<Treatment, 'id'>) => {
    try {
      setError(null);
      
      if (editingTreatment) {
        const updatedTreatment = await treatmentService.update(editingTreatment.id, treatmentData);
        setTreatments(prev => prev.map(t => 
          t.id === editingTreatment.id ? updatedTreatment : t
        ));
        toast({
          title: "Succès",
          description: "Soin modifié avec succès"
        });
      } else {
        const newTreatment = await treatmentService.create(treatmentData);
        setTreatments(prev => [newTreatment, ...prev]);
        toast({
          title: "Succès",
          description: "Soin créé avec succès"
        });
      }
      
      setShowAddModal(false);
      setEditingTreatment(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du traitement:', err);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde du soin",
        variant: "destructive"
      });
    }
  };

  const handleEditTreatment = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setShowAddModal(true);
  };

  const TreatmentCard: React.FC<{ treatment: Treatment }> = ({ treatment }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{treatment.name}</h3>
            <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
              {treatment.category}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3">{treatment.description}</p>
        </div>
        <button 
          onClick={() => handleEditTreatment(treatment)}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Prix</p>
            <p className="font-semibold text-gray-800">{treatment.price.toLocaleString()} FCFA</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Durée</p>
            <p className="font-semibold text-gray-800">{treatment.duration} min</p>
          </div>
        </div>
      </div>
      
      {treatment.contraindications.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Contre-indications:</p>
          <div className="flex flex-wrap gap-1">
            {treatment.contraindications.map((ci, index) => (
              <span key={index} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                {ci}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {treatment.aftercare.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Soins post-traitement:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {treatment.aftercare.slice(0, 2).map((care, index) => (
              <li key={index} className="flex items-start space-x-1">
                <span className="text-pink-500 mt-1">•</span>
                <span>{care}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Catalogue des Soins</h1>
          <p className="text-gray-600">Gestion des traitements proposés</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Soin</span>
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un soin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
        >
          <option value="all">Toutes catégories</option>
          {categories.filter(c => c !== 'all').map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <div className="text-sm text-gray-600 bg-white px-4 py-3 rounded-xl border border-gray-200">
          {filteredTreatments.length} soin(s)
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des traitements...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTreatments.map((treatment) => (
            <TreatmentCard key={treatment.id} treatment={treatment} />
          ))}
        </div>
      )}

      {!loading && filteredTreatments.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun soin trouvé</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Aucun soin ne correspond à votre recherche' : 'Commencez par ajouter votre premier soin'}
          </p>
        </div>
      )}

      {(showAddModal || editingTreatment) && (
        <TreatmentForm
          treatment={editingTreatment || undefined}
          onSave={handleSaveTreatment}
          onCancel={() => {
            setShowAddModal(false);
            setEditingTreatment(null);
          }}
        />
      )}
    </div>
  );
};

export default Treatments;