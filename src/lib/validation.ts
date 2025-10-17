import { z } from 'zod';

// Patient validation schema
export const patientSchema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est requis").max(100, "Le prénom ne peut pas dépasser 100 caractères"),
  last_name: z.string().trim().min(1, "Le nom est requis").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z.string().email("Email invalide").max(255, "L'email ne peut pas dépasser 255 caractères"),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, "Numéro de téléphone invalide"),
  date_of_birth: z.string().refine((date) => !isNaN(Date.parse(date)), "Date de naissance invalide"),
  medical_history: z.string().max(5000, "L'historique médical ne peut pas dépasser 5000 caractères").optional().or(z.literal('')),
  skin_type: z.string().max(100, "Le type de peau ne peut pas dépasser 100 caractères").optional().or(z.literal('')),
  contraindications: z.array(z.string().max(200)).max(50, "Maximum 50 contre-indications").optional(),
  last_visit: z.string().optional()
});

// Appointment validation schema
export const appointmentSchema = z.object({
  patient_id: z.string().uuid("ID patient invalide"),
  treatment_id: z.string().uuid("ID traitement invalide"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), "Date invalide"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, "Heure invalide"),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  notes: z.string().max(2000, "Les notes ne peuvent pas dépasser 2000 caractères").optional().or(z.literal('')),
  consumed_products: z.array(z.any()).optional(),
  actual_consumption: z.array(z.any()).optional(),
  consumption_variance: z.any().optional()
});

// Invoice validation schema
export const invoiceSchema = z.object({
  patient_id: z.string().uuid("ID patient invalide"),
  amount: z.number().int().min(0, "Le montant doit être positif"),
  status: z.enum(['paid', 'partial', 'unpaid']),
  payment_method: z.enum(['cash', 'card', 'transfer', 'check']),
  treatment_ids: z.array(z.string().uuid()).min(1, "Au moins un traitement est requis"),
  paid_at: z.string().optional()
});

// Consultation validation schema
export const consultationSchema = z.object({
  patient_id: z.string().uuid("ID patient invalide"),
  appointment_id: z.string().uuid("ID rendez-vous invalide").optional(),
  soin_id: z.string().uuid("ID soin invalide").optional(),
  practitioner_id: z.string().uuid("ID praticien invalide").optional(),
  consultation_date: z.string().refine((date) => !isNaN(Date.parse(date)), "Date invalide"),
  notes_pre_treatment: z.string().max(2000, "Les notes pré-traitement ne peuvent pas dépasser 2000 caractères").optional().or(z.literal('')),
  notes_post_treatment: z.string().max(2000, "Les notes post-traitement ne peuvent pas dépasser 2000 caractères").optional().or(z.literal('')),
  side_effects: z.string().max(1000, "Les effets secondaires ne peuvent pas dépasser 1000 caractères").optional().or(z.literal('')),
  photos_before: z.array(z.string()).optional(),
  photos_after: z.array(z.string()).optional(),
  next_appointment_recommended: z.string().optional(),
  consent_signed: z.boolean().optional(),
  satisfaction_rating: z.number().int().min(1).max(5).optional()
});

// Product validation schema
export const productSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(200, "Le nom ne peut pas dépasser 200 caractères"),
  category: z.string().trim().min(1, "La catégorie est requise").max(100),
  quantity: z.number().int().min(0, "La quantité doit être positive"),
  min_quantity: z.number().int().min(0, "La quantité minimum doit être positive"),
  unit_price: z.number().int().min(0, "Le prix unitaire doit être positif"),
  selling_price: z.number().int().min(0, "Le prix de vente doit être positif").optional(),
  unit: z.string().max(50).optional().or(z.literal('')),
  supplier: z.string().max(200).optional().or(z.literal('')),
  batch_number: z.string().max(100).optional().or(z.literal('')),
  expiry_date: z.string().optional(),
  last_restocked: z.string().optional()
});

// Treatment validation schema
export const treatmentSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(200),
  category: z.string().trim().min(1, "La catégorie est requise").max(100),
  description: z.string().max(2000).optional().or(z.literal('')),
  price: z.number().int().min(0, "Le prix doit être positif"),
  duration: z.number().int().min(1, "La durée doit être d'au moins 1 minute"),
  contraindications: z.array(z.string()).optional(),
  aftercare: z.array(z.string()).optional(),
  is_active: z.boolean().optional()
});

// Quote validation schema
export const quoteSchema = z.object({
  patient_id: z.string().uuid("ID patient invalide"),
  practitioner_id: z.string().uuid("ID praticien invalide").optional(),
  quote_number: z.string().trim().min(1, "Le numéro de devis est requis"),
  treatment_items: z.array(z.any()).min(1, "Au moins un élément est requis"),
  subtotal: z.number().int().min(0, "Le sous-total doit être positif"),
  discount_amount: z.number().int().min(0).optional(),
  tax_amount: z.number().int().min(0).optional(),
  total_amount: z.number().int().min(0, "Le total doit être positif"),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected']),
  valid_until: z.string().optional(),
  notes: z.string().max(2000).optional().or(z.literal(''))
});
