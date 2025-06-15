
import React, { useState } from 'react';
import { Calendar, FileText, Star, Filter } from 'lucide-react';

const ClientHistory: React.FC = () => {
  const [filterYear, setFilterYear] = useState('2024');
  
  const treatmentHistory = [
    {
      id: '1',
      treatment: 'Soin du visage hydratant',
      date: '2024-12-20',
      practitioner: 'Dr. Martin',
      rating: 5,
      notes: 'Excellent soin, peau très douce après le traitement',
      photos: 2,
      cost: 85
    },
    {
      id: '2',
      treatment: 'Épilation laser jambes complètes',
      date: '2024-12-10',
      practitioner: 'Dr. Dubois',
      rating: 4,
      notes: 'Séance efficace, moins de douleur que prévu',
      photos: 0,
      cost: 120
    },
    {
      id: '3',
      treatment: 'Massage relaxant',
      date: '2024-11-28',
      practitioner: 'Mme. Claire',
      rating: 5,
      notes: 'Très relaxant, parfait après une semaine stressante',
      photos: 0,
      cost: 65
    }
  ];

  const totalTreatments = treatmentHistory.length;
  const totalSpent = treatmentHistory.reduce((sum, treatment) => sum + treatment.cost, 0);
  const averageRating = treatmentHistory.reduce((sum, treatment) => sum + treatment.rating, 0) / treatmentHistory.length;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Historique des soins</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="all">Toutes les années</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{totalTreatments}</p>
            <p className="text-sm text-gray-600">Soins effectués</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{totalSpent}€</p>
            <p className="text-sm text-gray-600">Total dépensé</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-1 mb-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-sm text-gray-600">Note moyenne</p>
          </div>
        </div>
      </div>

      {/* Historique des traitements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Détail des soins</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {treatmentHistory.map((treatment) => (
            <div key={treatment.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {treatment.treatment}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {renderStars(treatment.rating)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(treatment.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span>Praticien: {treatment.practitioner}</span>
                    </div>
                  </div>
                  
                  {treatment.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {treatment.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {treatment.photos > 0 && (
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{treatment.photos} photo{treatment.photos > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{treatment.cost}€</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientHistory;
