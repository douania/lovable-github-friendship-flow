import { Patient, Treatment, Appointment, Invoice, Product } from '../types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'Aïssatou',
    lastName: 'Diop',
    email: 'aissatou.diop@email.com',
    phone: '+221 77 123 4567',
    dateOfBirth: '1990-05-15',
    skinType: 'Peau mixte',
    medicalHistory: 'Aucun antécédent particulier',
    contraindications: [],
    createdAt: '2024-01-15',
    lastVisit: '2024-02-20'
  },
  {
    id: '2',
    firstName: 'Fatou',
    lastName: 'Ba',
    email: 'fatou.ba@email.com',
    phone: '+221 76 987 6543',
    dateOfBirth: '1985-08-22',
    skinType: 'Peau sèche',
    medicalHistory: 'Allergie aux cosmétiques parfumés',
    contraindications: ['Produits parfumés'],
    createdAt: '2024-01-20',
    lastVisit: '2024-02-18'
  }
];

export const mockTreatments: Treatment[] = [
  {
    id: '1',
    name: 'Laser CO2 Fractionné',
    description: 'Traitement de resurfaçage cutané pour rides et cicatrices',
    price: 150000,
    duration: 60,
    category: 'Laser',
    contraindications: ['Grossesse', 'Peau bronzée'],
    aftercare: ['Éviter le soleil 2 semaines', 'Appliquer crème cicatrisante'],
    isActive: true
  },
  {
    id: '2',
    name: 'Peeling Chimique',
    description: 'Exfoliation profonde pour améliorer la texture de la peau',
    price: 75000,
    duration: 45,
    category: 'Soin du visage',
    contraindications: ['Peau irritée', 'Exposition solaire récente'],
    aftercare: ['Hydratation intensive', 'Protection solaire obligatoire'],
    isActive: true
  },
  {
    id: '3',
    name: 'Injection Botox',
    description: 'Réduction des rides d\'expression',
    price: 200000,
    duration: 30,
    category: 'Injection',
    contraindications: ['Grossesse', 'Allaitement', 'Troubles neuromusculaires'],
    aftercare: ['Éviter allongement 4h', 'Pas de massage'],
    isActive: true
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Crème Cicatrisante Post-Laser',
    category: 'Cosmétique',
    quantity: 5,
    minQuantity: 10,
    unitPrice: 25000,
    supplier: 'DermaCare Sénégal',
    expiryDate: '2025-06-30',
    lastRestocked: '2024-01-15'
  },
  {
    id: '2',
    name: 'Seringues 1ml',
    category: 'Consommable',
    quantity: 25,
    minQuantity: 50,
    unitPrice: 5000,
    supplier: 'MedSupply Dakar',
    lastRestocked: '2024-02-01'
  }
];