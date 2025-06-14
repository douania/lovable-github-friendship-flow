
import { Patient, Treatment, Product } from '../types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'Aïssatou',
    lastName: 'Diop',
    email: 'aissatou.diop@email.com',
    phone: '+221 77 123 45 67',
    dateOfBirth: '1990-05-15',
    skinType: 'Peau mixte',
    medicalHistory: 'Aucun antécédent particulier',
    contraindications: ['Grossesse'],
    createdAt: '2024-01-15T10:00:00Z',
    lastVisit: '2024-03-20T14:30:00Z'
  },
  {
    id: '2',
    firstName: 'Fatou',
    lastName: 'Ba',
    email: 'fatou.ba@email.com',
    phone: '+221 77 234 56 78',
    dateOfBirth: '1985-08-22',
    skinType: 'Peau grasse',
    medicalHistory: 'Acné juvénile',
    contraindications: ['Allergie au rétinol'],
    createdAt: '2024-01-20T11:00:00Z',
    lastVisit: '2024-03-18T16:00:00Z'
  }
];

export const mockTreatments: Treatment[] = [
  {
    id: '1',
    name: 'Laser CO2 Fractionné',
    description: 'Traitement de resurfaçage au laser CO2 fractionné pour améliorer la texture de la peau',
    price: 150000,
    duration: 60,
    category: 'Laser',
    contraindications: ['Grossesse', 'Allaitement', 'Peau bronzée'],
    aftercare: ['Éviter le soleil', 'Appliquer une crème cicatrisante'],
    isActive: true
  },
  {
    id: '2',
    name: 'Injection Botox',
    description: 'Injection de toxine botulique pour traiter les rides d\'expression',
    price: 200000,
    duration: 30,
    category: 'Injection',
    contraindications: ['Grossesse', 'Troubles neuromusculaires'],
    aftercare: ['Ne pas masser la zone', 'Éviter le sport pendant 24h'],
    isActive: true
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Crème anesthésiante',
    category: 'Anesthésie',
    quantity: 5,
    minQuantity: 10,
    unitPrice: 25000,
    supplier: 'MedSupply',
    expiryDate: '2024-12-31',
    lastRestocked: '2024-03-01'
  },
  {
    id: '2',
    name: 'Botox Allergan',
    category: 'Injectable',
    quantity: 3,
    minQuantity: 5,
    unitPrice: 180000,
    supplier: 'Allergan',
    expiryDate: '2024-08-15',
    lastRestocked: '2024-02-15'
  }
];
