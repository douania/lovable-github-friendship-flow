
import React from 'react';

interface AppointmentFiltersProps {
  viewMode: 'list' | 'calendar';
  selectedDate: string;
  statusFilter: string;
  appointmentsCount: number;
  onViewModeChange: (mode: 'list' | 'calendar') => void;
  onDateChange: (date: string) => void;
  onStatusFilterChange: (status: string) => void;
}

const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  viewMode,
  selectedDate,
  statusFilter,
  appointmentsCount,
  onViewModeChange,
  onDateChange,
  onStatusFilterChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="flex space-x-2">
        <button
          onClick={() => onViewModeChange('list')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'list' ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Liste
        </button>
        <button
          onClick={() => onViewModeChange('calendar')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'calendar' ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Calendrier
        </button>
      </div>
      
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
      />
      
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
      >
        <option value="all">Tous les statuts</option>
        <option value="scheduled">Programmé</option>
        <option value="completed">Terminé</option>
        <option value="cancelled">Annulé</option>
        <option value="no-show">Absent</option>
      </select>
      
      <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
        {appointmentsCount} RDV
      </div>
    </div>
  );
};

export default AppointmentFilters;
