import React, { useState, useEffect } from 'react';
import { Clock, ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useClientAuth } from '../../hooks/useClientAuth';

interface AvailableSlot {
  date: string;
  time: string;
  practitioner_id: string;
  practitioner_name: string;
  duration: number;
}

interface Treatment {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

const AppointmentBooking: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { patient } = useClientAuth();
  const [step, setStep] = useState(1);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    loadTreatments();
  }, []);

  useEffect(() => {
    if (selectedTreatment) {
      loadAvailableSlots();
    }
  }, [selectedTreatment, currentWeek]);

  const loadTreatments = async () => {
    try {
      const { data, error } = await supabase
        .from('soins')
        .select('id, nom, duree, prix, description')
        .eq('is_active', true)
        .order('nom');

      if (error) throw error;

      setTreatments(data.map(item => ({
        id: item.id,
        name: item.nom,
        duration: item.duree,
        price: item.prix,
        description: item.description || ''
      })));
    } catch (error) {
      console.error('Error loading treatments:', error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedTreatment) return;

    setLoading(true);
    try {
      // Get week start and end dates
      const weekStart = new Date(currentWeek);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Sunday

      // Load availability slots for the week
      const { data: slots, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('is_available', true)
        .gte('day_of_week', 0)
        .lte('day_of_week', 6);

      if (error) throw error;

      // Generate available slots for the week
      const generatedSlots: AvailableSlot[] = [];
      
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + day);
        
        // Skip past dates
        if (currentDate < new Date()) continue;

        const dayOfWeek = currentDate.getDay();
        const daySlots = slots?.filter(slot => slot.day_of_week === dayOfWeek) || [];

        for (const slot of daySlots) {
          // Generate time slots for this availability window
          const startTime = new Date(`2000-01-01T${slot.start_time}`);
          const endTime = new Date(`2000-01-01T${slot.end_time}`);
          
          let currentTime = new Date(startTime);
          while (currentTime < endTime) {
            const timeStr = currentTime.toTimeString().slice(0, 5);
            
            // Check if this slot can accommodate the treatment duration
            const slotEnd = new Date(currentTime);
            slotEnd.setMinutes(slotEnd.getMinutes() + selectedTreatment.duration);
            
            if (slotEnd <= endTime) {
              generatedSlots.push({
                date: currentDate.toISOString().split('T')[0],
                time: timeStr,
                practitioner_id: slot.practitioner_id,
                practitioner_name: 'Praticien',
                duration: selectedTreatment.duration
              });
            }

            currentTime.setMinutes(currentTime.getMinutes() + slot.duration_minutes);
          }
        }
      }

      setAvailableSlots(generatedSlots);
    } catch (error) {
      console.error('Error loading available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async () => {
    if (!patient || !selectedTreatment || !selectedSlot) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: patient.id,
          treatment_id: selectedTreatment.id,
          date: selectedSlot.date,
          time: selectedSlot.time,
          status: 'scheduled',
          notes: notes
        }]);

      if (error) throw error;

      console.log("Succès: Rendez-vous réservé avec succès !");
      onClose();
    } catch (error) {
      console.error('Error booking appointment:', error);
      console.log("Erreur: Impossible de réserver le rendez-vous");
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = () => {
    const weekStart = new Date(currentWeek);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const nextWeek = () => {
    const next = new Date(currentWeek);
    next.setDate(next.getDate() + 7);
    setCurrentWeek(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeek);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeek(prev);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  };

  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Réserver un rendez-vous</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mt-2">Étape 1/3 : Choisissez votre soin</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {treatments.map((treatment) => (
                <div
                  key={treatment.id}
                  onClick={() => {
                    setSelectedTreatment(treatment);
                    setStep(2);
                  }}
                  className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 hover:bg-pink-50 cursor-pointer transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{treatment.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{treatment.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {treatment.duration} min
                    </div>
                    <div className="text-lg font-bold text-pink-600">
                      {treatment.price}€
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    const weekDates = getWeekDates();
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Choisir un créneau</h2>
                <p className="text-gray-600 mt-1">
                  Soin sélectionné : <span className="font-medium">{selectedTreatment?.name}</span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Retour
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 mt-2">Étape 2/3 : Sélectionnez une date et heure</p>
          </div>

          <div className="p-6">
            {/* Week navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevWeek}
                className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Semaine précédente
              </button>
              
              <div className="text-lg font-medium text-gray-900">
                {weekDates[0].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </div>
              
              <button
                onClick={nextWeek}
                className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Semaine suivante
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-4">
              {weekDates.map((date, index) => {
                const dateStr = date.toISOString().split('T')[0];
                const daySlots = availableSlots.filter(slot => slot.date === dateStr);
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 text-center">
                      <div className="font-medium text-gray-900">
                        {formatDate(date)}
                      </div>
                    </div>
                    
                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                      {daySlots.length > 0 ? (
                        daySlots.map((slot, slotIndex) => (
                          <button
                            key={slotIndex}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setStep(3);
                            }}
                            className="w-full text-xs p-2 text-left border border-gray-200 rounded hover:border-pink-300 hover:bg-pink-50 transition-colors"
                          >
                            <div className="font-medium">{slot.time}</div>
                            <div className="text-gray-500">{slot.practitioner_name}</div>
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 text-center py-4">
                          Aucun créneau disponible
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Chargement des créneaux...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Confirmer la réservation</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mt-2">Étape 3/3 : Confirmez les détails</p>
          </div>

          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Récapitulatif</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Soin :</span>
                  <span className="font-medium">{selectedTreatment?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date :</span>
                  <span className="font-medium">
                    {selectedSlot && new Date(selectedSlot.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Heure :</span>
                  <span className="font-medium">{selectedSlot?.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Durée :</span>
                  <span className="font-medium">{selectedTreatment?.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Praticien :</span>
                  <span className="font-medium">{selectedSlot?.practitioner_name}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-600">Prix :</span>
                  <span className="font-bold text-lg">{selectedTreatment?.price}€</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes ou demandes particulières (optionnel)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="Précisez vos besoins ou contraintes..."
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Modifier le créneau
              </button>
              
              <button
                onClick={bookAppointment}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Réservation...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmer la réservation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AppointmentBooking;