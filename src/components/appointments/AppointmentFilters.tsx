import React from 'react';
import { Calendar, List, Filter, Search, X } from 'lucide-react';

interface AppointmentFiltersProps {
  viewMode: 'list' | 'calendar';
  selectedDate: string;
  statusFilter: string;
  appointmentsCount: number;
  onViewModeChange: (mode: 'list' | 'calendar') => void;
  onDateChange: (date: string) => void;
  onStatusFilterChange: (status: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  patientFilter: string;
  onPatientFilterChange: (id: string) => void;
  treatmentFilter: string;
  onTreatmentFilterChange: (id: string) => void;
  dateRangeStart: string;
  onDateRangeStartChange: (date: string) => void;
  dateRangeEnd: string;
  onDateRangeEndChange: (date: string) => void;
  patients: any[];
  treatments: any[];
}

const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  viewMode,
  selectedDate,
  statusFilter,
  appointmentsCount,
  onViewModeChange,
  onDateChange,
  onStatusFilterChange,
  searchTerm,
  onSearchChange,
  patientFilter,
  onPatientFilterChange,
  treatmentFilter,
  onTreatmentFilterChange,
  dateRangeStart,
  onDateRangeStartChange,
  dateRangeEnd,
  onDateRangeEndChange,
  patients,
  treatments
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  
  const clearAllFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onPatientFilterChange('all');
    onTreatmentFilterChange('all');
    onDateRangeStartChange('');
    onDateRangeEndChange('');
  };
  
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || 
                          patientFilter !== 'all' || treatmentFilter !== 'all' ||
                          dateRangeStart || dateRangeEnd;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Première ligne - Filtres principaux */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('list')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Liste</span>
          </button>
          <button
            onClick={() => onViewModeChange('calendar')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              viewMode === 'calendar'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Calendrier</span>
          </button>
        </div>

        {/* Recherche textuelle */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par patient ou traitement..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Date Filter */}
        <div className="w-48">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Bouton filtres avancés */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
            showAdvancedFilters || hasActiveFilters
              ? 'bg-pink-50 border-pink-500 text-pink-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Filtres</span>
          {hasActiveFilters && <span className="ml-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">!</span>}
        </button>

        {/* Count Badge */}
        <div className="flex items-center px-4 py-2 bg-pink-50 text-pink-700 rounded-lg">
          <span className="font-semibold">{appointmentsCount}</span>
          <span className="ml-1 text-sm">RDV</span>
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Filtres avancés</h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center space-x-1 text-sm text-pink-600 hover:text-pink-700"
              >
                <X className="w-4 h-4" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">Tous</option>
                <option value="scheduled">Planifié</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
                <option value="no-show">Absent</option>
              </select>
            </div>

            {/* Patient Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
              <select
                value={patientFilter}
                onChange={(e) => onPatientFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">Tous les patients</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Treatment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Traitement</label>
              <select
                value={treatmentFilter}
                onChange={(e) => onTreatmentFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">Tous les traitements</option>
                {treatments.map(treatment => (
                  <option key={treatment.id} value={treatment.id}>
                    {treatment.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plage de dates</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => onDateRangeStartChange(e.target.value)}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  placeholder="Début"
                />
                <input
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => onDateRangeEndChange(e.target.value)}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  placeholder="Fin"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentFilters;
