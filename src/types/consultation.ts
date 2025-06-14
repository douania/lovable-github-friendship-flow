
export interface Consultation {
  id: string;
  patientId: string;
  appointmentId?: string;
  soinId: string;
  practitionerId: string;
  consultationDate: string;
  notesPreTreatment: string;
  notesPostTreatment: string;
  photosBefore: string[];
  photosAfter: string[];
  sideEffects: string;
  nextAppointmentRecommended?: string;
  consentSigned: boolean;
  satisfactionRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  patientId: string;
  practitionerId?: string;
  treatmentItems: QuoteItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  soinId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Notification {
  id: string;
  patientId?: string;
  appointmentId?: string;
  type: 'appointment_reminder' | 'follow_up' | 'payment_reminder' | 'satisfaction_survey';
  method: 'email' | 'sms' | 'app';
  title: string;
  message: string;
  scheduledFor: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  metadata: Record<string, any>;
  createdAt: string;
}

export interface AvailabilitySlot {
  id: string;
  practitionerId: string;
  dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, etc.
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isAvailable: boolean;
  createdAt: string;
}
