import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, Save } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../hooks/useAuth';

interface AvailabilitySlot {
  id: string;
  practitioner_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean | null;
  created_at: string | null;
}

interface NewSlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
}

const Availability: React.FC = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState<NewSlot>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    duration_minutes: 30,
    is_available: true
  });

  const daysOfWeek = [
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' },
    { value: 0, label: 'Dimanche' }
  ];

  useEffect(() => {
    loadAvailabilitySlots();
  }, [user]);

  const loadAvailabilitySlots = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('practitioner_id', user.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      setSlots(data || []);
    } catch (error: any) {
      console.error('Error loading availability slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .insert([{
          practitioner_id: user.id,
          ...newSlot
        }])
        .select()
        .single();

      if (error) throw error;

      setSlots([...slots, data]);
      setShowAddForm(false);
      setNewSlot({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        duration_minutes: 30,
        is_available: true
      });

      console.log("Succès: Créneaux ajoutés avec succès");
    } catch (error: any) {
      console.error('Error adding slot:', error);
      console.log("Erreur: Impossible d'ajouter les créneaux");
    } finally {
      setLoading(false);
    }
  };

  const deleteSlot = async (slotId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      setSlots(slots.filter(slot => slot.id !== slotId));
      console.log("Succès: Créneau supprimé");
    } catch (error: any) {
      console.error('Error deleting slot:', error);
      console.log("Erreur: Impossible de supprimer le créneau");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Extract HH:MM from HH:MM:SS
  };

  const generateTimeSlots = (startTime: string, endTime: string, duration: number) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    let current = new Date(start);
    while (current < end) {
      const timeSlot = current.toTimeString().slice(0, 5);
      slots.push(timeSlot);
      current.setMinutes(current.getMinutes() + duration);
    }
    
    return slots;
  };

  const groupedSlots = slots.reduce((groups, slot) => {
    const day = slot.day_of_week;
    if (!groups[day]) {
      groups[day] = [];
    }
    groups[day].push(slot);
    return groups;
  }, {} as Record<number, AvailabilitySlot[]>);

  if (loading && slots.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-pink-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Gestion des disponibilités</h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter des créneaux
          </button>
        </div>
        <p className="text-gray-600">Configurez vos horaires de disponibilité pour la prise de rendez-vous</p>
      </div>

      {/* Form to add new slots */}
      {showAddForm && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter un nouveau créneau</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jour de la semaine
              </label>
              <select
                value={newSlot.day_of_week}
                onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              >
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de début
              </label>
              <input
                type="time"
                value={newSlot.start_time}
                onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de fin
              </label>
              <input
                type="time"
                value={newSlot.end_time}
                onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (minutes)
              </label>
              <select
                value={newSlot.duration_minutes}
                onChange={(e) => setNewSlot({ ...newSlot, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 heure</option>
                <option value={90}>1h30</option>
                <option value={120}>2 heures</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_available"
                checked={newSlot.is_available}
                onChange={(e) => setNewSlot({ ...newSlot, is_available: e.target.checked })}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                Disponible pour les rendez-vous
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                Annuler
              </button>
              <button
                onClick={addSlot}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display availability slots by day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {daysOfWeek.map(day => (
          <div key={day.value} className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{day.label}</h3>
            </div>
            
            <div className="p-6">
              {groupedSlots[day.value] && groupedSlots[day.value].length > 0 ? (
                <div className="space-y-3">
                  {groupedSlots[day.value].map(slot => (
                    <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({slot.duration_minutes} min)
                        </span>
                        {!slot.is_available && (
                          <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                            Indisponible
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingSlot(slot.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSlot(slot.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucun créneau défini pour ce jour
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview of time slots */}
      {slots.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Aperçu des créneaux disponibles</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {daysOfWeek.map(day => {
                const daySlots = groupedSlots[day.value]?.filter(slot => slot.is_available) || [];
                
                return (
                  <div key={day.value} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{day.label}</h4>
                    {daySlots.length > 0 ? (
                      <div className="space-y-2">
                        {daySlots.map(slot => {
                          const timeSlots = generateTimeSlots(slot.start_time, slot.end_time, slot.duration_minutes);
                          return (
                            <div key={slot.id} className="text-xs">
                              <div className="flex flex-wrap gap-1">
                                {timeSlots.slice(0, 6).map((time, index) => (
                                  <span key={index} className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
                                    {time}
                                  </span>
                                ))}
                                {timeSlots.length > 6 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                                    +{timeSlots.length - 6}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">Fermé</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Availability;