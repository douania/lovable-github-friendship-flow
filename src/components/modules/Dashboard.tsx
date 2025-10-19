
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react';
import { Patient, Product, Appointment, Invoice, Treatment } from '../../types';
import { patientService } from '../../services/patientService';
import { productService } from '../../services/productService';
import { appointmentService } from '../../services/appointmentService';
import { invoiceService } from '../../services/invoiceService';
import { treatmentService } from '../../services/treatmentService';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';

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
      color: 'text-success',
      bgColor: 'bg-success-light'
    },
    {
      title: 'RDV aujourd\'hui',
      value: todayAppointments.length.toString(),
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary-light'
    },
    {
      title: 'Total patients',
      value: patients.length.toString(),
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-secondary'
    },
    {
      title: 'Stock faible',
      value: lowStockItems.toString(),
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning-light'
    }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-elegant p-6">
              <Skeleton className="h-12 w-12 rounded-xl mb-4" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
          ))}
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
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <div className="card-elegant px-6 py-4 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Revenus mensuels</p>
          </div>
          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {monthlyRevenue.toLocaleString()} FCFA
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, statIndex) => {
          const Icon = stat.icon;
          return (
            <div key={statIndex} className="card-elegant p-6 hover:shadow-elegant-lg group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium mb-2">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-elegant p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Rendez-vous du jour</h2>
            <div className="p-2 rounded-lg bg-primary-light">
              <Clock className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            {todayAppointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Aucun rendez-vous"
                description="Pas de rendez-vous programmé pour aujourd'hui"
              />
            ) : (
              todayAppointments.slice(0, 4).map((apt) => {
                const patient = patients.find(p => p.id === apt.patientId);
                const treatment = treatments.find(t => t.id === apt.treatmentId);
                return (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-semibold text-foreground">{apt.time}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground mb-1">
                        {treatment?.name || `Traitement ${apt.treatmentId.substring(0, 8)}`}
                      </p>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        apt.status === 'scheduled' ? 'bg-primary-light text-primary' :
                        apt.status === 'completed' ? 'bg-success-light text-success' :
                        apt.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                        'bg-warning-light text-warning'
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

        <div className="card-elegant p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Soins populaires</h2>
            <div className="p-2 rounded-lg bg-accent/10">
              <Star className="w-5 h-5 text-accent" />
            </div>
          </div>
          <div className="space-y-3">
            {popularTreatments.length === 0 ? (
              <EmptyState
                icon={Star}
                title="Aucun soin enregistré"
                description="Les soins les plus demandés apparaîtront ici"
              />
            ) : (
              popularTreatments.map((treatment) => (
                <div key={treatment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-light/50 to-accent/10 rounded-xl hover:shadow-elegant-sm transition-all">
                  <div>
                    <p className="font-semibold text-foreground">{treatment.name}</p>
                    <p className="text-sm text-muted-foreground">{treatment.count} séance(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {treatment.price.toLocaleString()} FCFA
                    </p>
                    <p className="text-xs text-muted-foreground">{treatment.duration} min</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {lowStockItems > 0 && (
        <div className="card-elegant p-6 bg-gradient-to-r from-warning-light to-destructive/10 border-warning animate-scale-in">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning-light">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Alerte Stock</h3>
              <p className="text-muted-foreground">{lowStockItems} produit(s) en rupture ou stock faible</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
