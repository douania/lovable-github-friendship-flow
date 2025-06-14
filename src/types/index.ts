
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  skinType: string;
  photo?: string;
  medicalHistory: string;
  contraindications: string[];
  createdAt: string;
  lastVisit?: string;
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  photo?: string;
  contraindications: string[];
  aftercare: string[];
  isActive: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  treatmentId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  consumedProducts?: Array<{ productId: string; quantity: number; }>;
  createdAt: string;
}

export interface Invoice {
  id: string;
  appointmentId?: string;
  patientId: string;
  treatmentIds: string[];
  amount: number;
  status: 'paid' | 'partial' | 'unpaid';
  paymentMethod: 'cash' | 'mobile_money' | 'card' | 'bank_transfer';
  createdAt: string;
  paidAt?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  sellingPrice?: number;
  unit?: string;
  supplier?: string;
  expiryDate?: string;
  lastRestocked: string;
}

export interface Appareil {
  id: string;
  nom: string;
  description: string;
  icone: string;
  imageUrl?: string;
  isActive: boolean;
  ordre: number;
  createdAt: string;
}

export interface Zone {
  id: string;
  nom: string;
  description: string;
  createdAt: string;
}

export interface Soin {
  id: string;
  appareilId: string;
  zoneId: string;
  nom: string;
  description: string;
  duree: number;
  prix: number;
  contreIndications: string[];
  conseilsPostTraitement: string[];
  isActive: boolean;
  createdAt: string;
  expectedConsumables?: Array<{ productId: string; quantity: number; }>;
  // Relations
  appareil?: Appareil;
  zone?: Zone;
}

export interface Forfait {
  id: string;
  nom: string;
  description: string;
  soinIds: string[];
  prixTotal: number;
  prixReduit: number;
  nbSeances: number;
  validiteMois: number;
  isActive: boolean;
  ordre: number;
  createdAt: string;
  // Relations
  soins?: Soin[];
}

export interface Stats {
  todayRevenue: number;
  monthlyRevenue: number;
  todayAppointments: number;
  totalPatients: number;
  lowStockItems: number;
}

export interface ConsumptionReport {
  id: string;
  appointmentId: string;
  soinId: string;
  productId: string;
  expectedQuantity: number;
  actualQuantity: number;
  varianceQuantity: number;
  variancePercentage: number;
  costImpact: number;
  reportDate: string;
  createdAt: string;
  // Relations
  product?: Product;
  soin?: Soin;
  appointment?: Appointment;
}

export interface StockAlert {
  id: string;
  productId: string;
  alertType: 'low_stock' | 'high_consumption' | 'expiry_warning' | 'cost_variance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  thresholdValue?: number;
  currentValue?: number;
  suggestedAction?: string;
  isRead: boolean;
  isDismissed: boolean;
  expiresAt?: string;
  createdAt: string;
  // Relations
  product?: Product;
}

export interface CostAnalysis {
  id: string;
  soinId: string;
  analysisPeriodStart: string;
  analysisPeriodEnd: string;
  totalSessions: number;
  expectedCost: number;
  actualCost: number;
  costVariance: number;
  costVariancePercentage: number;
  profitMargin: number;
  optimizationSuggestions: Array<{
    type: string;
    description: string;
    potentialSavings: number;
    priority: 'low' | 'medium' | 'high';
  }>;
  createdAt: string;
  // Relations
  soin?: Soin;
}
