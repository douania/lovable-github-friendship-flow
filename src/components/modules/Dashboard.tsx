
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  Clock,
  Star
} from 'lucide-react';
import { Patient, Product } from '../../types';
import { patientService } from '../../services/patientService';
import { productService } from '../../services/productService';

const Dashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [patientsData, productsData] = await Promise.all([
        patientService.getAll(),
        productService.getAll()
      ]);
      setPatients(patientsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayRevenue = 425000;
  const monthlyRevenue = 3200000;
  const todayAppointments = 6;
  const lowStockItems = products.filter(p => p.quantity <= p.minQuantity).length;

  const stats = [
    {
      title: 'Revenus du jour',
      value: `${todayRevenue.toLocaleString()} FCFA`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'RDV aujourd\'hui',
      value: todayAppointments.toString(),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total patients',
      value: patients.length.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Stock faible',
      value: lowStockItems.toString(),
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const recentAppointments = [
    { time: '09:00', patient: 'Aïssatou Diop', treatment: 'Laser CO2', status: 'confirmed' },
    { time: '10:30', patient: 'Fatou Ba', treatment: 'Peeling', status: 'confirmed' },
    { time: '14:00', patient: 'Marième Fall', treatment: 'Botox', status: 'pending' },
    { time: '15:30', patient: 'Khady Sy', treatment: 'Consultation', status: 'confirmed' }
  ];

  const popularTreatments = [
    { id: '1', name: 'Laser CO2 Fractionné', category: 'Laser', price: 125000, duration: 45 },
    { id: '2', name: 'Peeling Chimique', category: 'Soins visage', price: 75000, duration: 30 },
    { id: '3', name: 'Botox Rides', category: 'Injection', price: 150000, duration: 20 },
    { id: '4', name: 'Consultation', category: 'Diagnostic', price: 25000, duration: 30 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-600">Vue d'ensemble de votre activité</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Revenus mensuels</p>
          <p className="text-2xl font-bold text-pink-600">{monthlyRevenue.toLocaleString()} FCFA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, statIndex) => {
          const Icon = stat.icon;
          return (
            <div key={statIndex} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Rendez-vous du jour</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentAppointments.map((apt, aptIndex) => (
              <div key={aptIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-800">{apt.time}</p>
                    <p className="text-sm text-gray-600">{apt.patient}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{apt.treatment}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    apt.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {apt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Soins populaires</h2>
            <Star className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {popularTreatments.slice(0, 4).map((treatment) => (
              <div key={treatment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">{treatment.name}</p>
                  <p className="text-sm text-gray-600">{treatment.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-pink-600">{treatment.price.toLocaleString()} FCFA</p>
                  <p className="text-xs text-gray-500">{treatment.duration} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lowStockItems > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-6 rounded-2xl">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-800">Alerte Stock</h3>
              <p className="text-orange-700">{lowStockItems} produit(s) en rupture ou stock faible</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
