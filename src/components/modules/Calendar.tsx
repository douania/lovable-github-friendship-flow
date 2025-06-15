
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

  const getDayAppointments = () => {
    if (!selectedDate) return [];
    const dayNumber = parseInt(selectedDate.split('-')[2]);
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    return appointments.filter(apt => apt.date === dateString);
  };

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
