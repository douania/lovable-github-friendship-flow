
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  Clock,
  Star
} from 'lucide-react';
import { Patient, Product, Appointment, Invoice, Treatment } from '../../types';
import { patientService } from '../../services/patientService';
import { productService } from '../../services/productService';
import { appointmentService } from '../../services/appointmentService';
import { invoiceService } from '../../services/invoiceService';
import { treatmentService } from '../../services/treatmentService';

const Dashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [patientsData, productsData, appointmentsData, invoicesData, treatmentsData] = await Promise.all([
        patientService.getAll(),
        productService.getAll(),
        appointmentService.getAll(),
        invoiceService.getAll(),
        treatmentService.getAll()
      ]);
      setPatients(patientsData);
      setProducts(productsData);
      setAppointments(appointmentsData);
      setInvoices(invoicesData);
      setTreatments(treatmentsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculs des métriques réelles
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  // Revenus du jour (factures payées aujourd'hui)
  const todayRevenue = invoices
    .filter(invoice => 
      invoice.status === 'paid' && 
      invoice.paidAt && 
      invoice.paidAt.split('T')[0] === today
    )
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  // Revenus mensuels (factures payées ce mois)
  const monthlyRevenue = invoices
    .filter(invoice => 
      invoice.status === 'paid' && 
      invoice.paidAt && 
      invoice.paidAt >= startOfMonth
    )
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  // Rendez-vous d'aujourd'hui
  const todayAppointments = appointments.filter(apt => apt.date === today);

  // Produits en stock faible
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
      value: todayAppointments.length.toString(),
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

  // Calcul des soins populaires basé sur les vrais rendez-vous avec les noms des traitements
  const treatmentCounts = appointments.reduce((acc, apt) => {
    acc[apt.treatmentId] = (acc[apt.treatmentId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const popularTreatments = Object.entries(treatmentCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([treatmentId, count]) => {
      const treatment = treatments.find(t => t.id === treatmentId);
      return {
        id: treatmentId,
        name: treatment?.name || `Traitement ${treatmentId.substring(0, 8)}`,
        category: treatment?.category || 'Soin',
        price: treatment?.price || 0,
        duration: treatment?.duration || 45,
        count
      };
    });

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
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Aucun rendez-vous aujourd'hui</p>
              </div>
            ) : (
              todayAppointments.slice(0, 4).map((apt) => {
                const patient = patients.find(p => p.id === apt.patientId);
                const treatment = treatments.find(t => t.id === apt.treatmentId);
                return (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-800">{apt.time}</p>
                        <p className="text-sm text-gray-600">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">
                        {treatment?.name || `Traitement ${apt.treatmentId.substring(0, 8)}`}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        apt.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                        apt.status === 'completed' ? 'bg-green-100 text-green-600' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {apt.status === 'scheduled' ? 'Programmé' :
                         apt.status === 'completed' ? 'Terminé' :
                         apt.status === 'cancelled' ? 'Annulé' :
                         apt.status === 'no-show' ? 'Absent' : apt.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Soins populaires</h2>
            <Star className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {popularTreatments.length === 0 ? (
              <div className="text-center py-8">
                <Star className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Aucun traitement enregistré</p>
              </div>
            ) : (
              popularTreatments.map((treatment) => (
                <div key={treatment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">{treatment.name}</p>
                    <p className="text-sm text-gray-600">{treatment.count} séance(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-pink-600">{treatment.price.toLocaleString()} FCFA</p>
                    <p className="text-xs text-gray-500">{treatment.duration} min</p>
                  </div>
                </div>
              ))
            )}
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
