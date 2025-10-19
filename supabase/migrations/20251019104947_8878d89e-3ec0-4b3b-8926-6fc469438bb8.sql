-- Add database-level validation constraints for critical fields

-- Patients table validation
ALTER TABLE patients
ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE patients
ADD CONSTRAINT check_first_name_length 
CHECK (char_length(first_name) BETWEEN 1 AND 100);

ALTER TABLE patients
ADD CONSTRAINT check_last_name_length 
CHECK (char_length(last_name) BETWEEN 1 AND 100);

ALTER TABLE patients
ADD CONSTRAINT check_phone_length 
CHECK (phone IS NULL OR char_length(phone) BETWEEN 1 AND 50);

-- Products table validation
ALTER TABLE products
ADD CONSTRAINT check_product_name_length 
CHECK (char_length(name) BETWEEN 1 AND 200);

ALTER TABLE products
ADD CONSTRAINT check_quantity_non_negative 
CHECK (quantity >= 0);

ALTER TABLE products
ADD CONSTRAINT check_min_quantity_non_negative 
CHECK (min_quantity >= 0);

ALTER TABLE products
ADD CONSTRAINT check_unit_price_non_negative 
CHECK (unit_price >= 0);

-- Treatments/Soins table validation
ALTER TABLE soins
ADD CONSTRAINT check_soin_name_length 
CHECK (char_length(nom) BETWEEN 1 AND 200);

ALTER TABLE soins
ADD CONSTRAINT check_soin_price_non_negative 
CHECK (prix >= 0);

ALTER TABLE soins
ADD CONSTRAINT check_soin_duration_positive 
CHECK (duree > 0);

-- Appointments table validation
ALTER TABLE appointments
ADD CONSTRAINT check_appointment_status 
CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'));

ALTER TABLE appointments
ADD CONSTRAINT check_notes_length 
CHECK (notes IS NULL OR char_length(notes) <= 5000);

-- Invoices table validation
ALTER TABLE invoices
ADD CONSTRAINT check_invoice_amount_non_negative 
CHECK (amount >= 0);

ALTER TABLE invoices
ADD CONSTRAINT check_invoice_status 
CHECK (status IN ('paid', 'unpaid', 'overdue', 'cancelled'));

ALTER TABLE invoices
ADD CONSTRAINT check_invoice_payment_method 
CHECK (payment_method IN ('cash', 'card', 'check', 'transfer', 'other'));

-- Consultations table validation
ALTER TABLE consultations
ADD CONSTRAINT check_satisfaction_rating_range 
CHECK (satisfaction_rating IS NULL OR (satisfaction_rating >= 1 AND satisfaction_rating <= 5));

ALTER TABLE consultations
ADD CONSTRAINT check_notes_pre_treatment_length 
CHECK (notes_pre_treatment IS NULL OR char_length(notes_pre_treatment) <= 5000);

ALTER TABLE consultations
ADD CONSTRAINT check_notes_post_treatment_length 
CHECK (notes_post_treatment IS NULL OR char_length(notes_post_treatment) <= 5000);

ALTER TABLE consultations
ADD CONSTRAINT check_side_effects_length 
CHECK (side_effects IS NULL OR char_length(side_effects) <= 5000);