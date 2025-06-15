
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { availabilityService } from '../../services/availabilityService';
import { useAuth } from '../../hooks/useAuth';
import CalendarGrid from '../calendar/CalendarGrid';
import CalendarSidebar from '../calendar/CalendarSidebar';

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
  const [error, setError] = useState<string | null>(null);

  console.log('Calendar component rendering with date:', currentDate);

  useEffect(() => {
    console.log('Calendar useEffect for appointments triggered');
    loadAppointments();
  }, [currentDate.getFullYear(), currentDate.getMonth()]); // Dependency plus spécifique

  useEffect(() => {
    console.log('Calendar useEffect for available slots triggered', { selectedDate, user: !!user });
    if (selectedDate && user) {
      loadAvailableSlots();
    }
  }, [selectedDate, user?.id]); // Dependency plus spécifique

  const loadAppointments = async () => {
    try {
      console.log('Loading appointments for:', currentDate);
      setLoading(true);
      setError(null);
      
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const allAppointments = await appointmentService.getAll();
      const monthAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= startOfMonth && aptDate <= endOfMonth;
      });

      console.log('Found appointments:', monthAppointments.length);

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
      setError('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!user) {
      console.log('No user, skipping available slots loading');
      return;
    }
    
    try {
      console.log('Loading available slots for:', selectedDate);
      const slots = await availabilityService.getAvailableTimeSlots(user.id, selectedDate);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux:', error);
      setAvailableSlots([]);
    }
  };

  const handleDateClick = (day: number) => {
    if (!day) return;
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log('Date clicked:', dateString);
    setSelectedDate(dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    console.log('Navigating month:', direction);
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

  const getDayAppointments = () => {
    if (!selectedDate) return [];
    return appointments.filter(apt => apt.date === selectedDate);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erreur</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              loadAppointments();
            }}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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
          <CalendarGrid
            currentDate={currentDate}
            appointments={appointments}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
            onNavigateMonth={navigateMonth}
          />
        </div>

        <CalendarSidebar
          selectedDate={selectedDate}
          availableSlots={availableSlots}
          dayAppointments={getDayAppointments()}
        />
      </div>
    </div>
  );
};

export default Calendar;
