
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Appointment {
  id: string;
  patientId: string;
  treatmentId: string;
  date: string;
  time: string;
  status: string;
  patientName?: string;
}

interface CalendarGridProps {
  currentDate: Date;
  appointments: Appointment[];
  selectedDate: string;
  onDateClick: (day: number) => void;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  appointments,
  selectedDate,
  onDateClick,
  onNavigateMonth
}) => {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const getDayAppointments = (day: number) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(apt => apt.date === dateString);
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    const selectedDay = parseInt(selectedDate.split('-')[2]);
    return selectedDay === day;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => onNavigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => onNavigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: adjustedFirstDay }).map((_, index) => (
          <div key={`empty-${index}`} className="h-12"></div>
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dayAppointments = getDayAppointments(day);
          
          return (
            <button
              key={day}
              onClick={() => onDateClick(day)}
              className={`h-12 p-1 rounded-lg transition-colors relative ${
                isSelectedDate(day)
                  ? 'bg-pink-500 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className={`text-sm ${dayAppointments.length > 0 ? 'font-semibold' : ''}`}>
                {day}
              </span>
              {dayAppointments.length > 0 && (
                <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                  isSelectedDate(day) ? 'bg-white' : 'bg-pink-500'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
