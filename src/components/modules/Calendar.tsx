import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { availabilityService } from '../../services/availabilityService';
import { useAuth } from '../../hooks/useAuth';

interface Appointment {
  id: string;
  patientId: string;
  treatmentId: string;
  date: string;
  time: string;
  status: string;
  patientName?: string;
}

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [currentDate]);

  useEffect(() => {
    if (selectedDate && user) {
      loadAvailableSlots();
    }
  }, [selectedDate, user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const allAppointments = await appointmentService.getAll();
      const monthAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= startOfMonth && aptDate <= endOfMonth;
      });

      const enrichedAppointments = await Promise.all(
        monthAppointments.map(async (apt) => {
          try {
            const patient = await patientService.getById(apt.patientId);
            return {
              ...apt,
              patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'
            };
          } catch (error) {
            console.error('Erreur patient:', error);
            return { ...apt, patientName: 'Patient inconnu' };
          }
        })
      );

      setAppointments(enrichedAppointments);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!user) return;
    
    try {
      const slots = await availabilityService.getAvailableTimeSlots(user.id, selectedDate);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux:', error);
      setAvailableSlots([]);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getAppointmentsForDate = (day: number) => {
    if (!day) return [];
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(apt => apt.date === dateString);
  };

  const handleDateClick = (day: number) => {
    if (!day) return;
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const days = getDaysInMonth();
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-pink-500" />
          Planning
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {formatDate(currentDate)}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayAppointments = day ? getAppointmentsForDate(day) : [];
                  const isSelected = day && selectedDate === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  
                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[80px] p-1 border border-gray-100 cursor-pointer transition-colors
                        ${day ? 'hover:bg-gray-50' : 'bg-gray-50'}
                        ${isSelected ? 'bg-pink-50 border-pink-200' : ''}
                      `}
                      onClick={() => day && handleDateClick(day)}
                    >
                      {day && (
                        <>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {day}
                          </div>
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map((apt) => (
                              <div
                                key={apt.id}
                                className={`text-xs px-1 py-0.5 rounded truncate ${getStatusColor(apt.status)}`}
                                title={`${apt.time} - ${apt.patientName}`}
                              >
                                {apt.time} {apt.patientName}
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{dayAppointments.length - 2} autres
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {selectedDate && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-pink-500" />
                  Créneaux disponibles
                </h3>
                <div className="text-sm text-gray-600 mb-3">
                  {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        className="p-2 text-sm border border-gray-200 rounded-lg hover:bg-pink-50 hover:border-pink-200 transition-colors"
                      >
                        {slot}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-sm text-gray-500 text-center py-4">
                      Aucun créneau disponible
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-pink-500" />
                  Rendez-vous programmés
                </h3>
                <div className="space-y-2">
                  {selectedDate && getAppointmentsForDate(parseInt(selectedDate.split('-')[2])).map((apt) => (
                    <div key={apt.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{apt.time}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {apt.patientName}
                      </div>
                    </div>
                  ))}
                  {selectedDate && getAppointmentsForDate(parseInt(selectedDate.split('-')[2])).length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                      Aucun rendez-vous programmé
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
