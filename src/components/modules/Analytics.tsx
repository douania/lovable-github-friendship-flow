
import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Calendar, Star, Package } from 'lucide-react';
import { Patient, Product } from '../../types';
import { patientService } from '../../services/patientService';
import { productService } from '../../services/productService';

const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const [patientsData, productsData] = await Promise.all([
        patientService.getAll(),
        productService.getAll()
      ]);
      setPatients(patientsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthlyRevenue = 3200000;
  const dailyAverage = monthlyRevenue / 30;
  const growthRate = 15.3;
  
  const topTreatments = [
    { name: 'Laser CO2 Fractionné', revenue: 900000, count: 6, growth: 20 },
    { name: 'Injection Botox', revenue: 800000, count: 4, growth: 12 },
    { name: 'Peeling Chimique', revenue: 525000, count: 7, growth: -5 },
    { name: 'Consultation', revenue: 300000, count: 15, growth: 8 }
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 2800000, appointments: 42 },
    { month: 'Fév', revenue: 3200000, appointments: 48 },
    { month: 'Mar', revenue: 2900000, appointments: 45 },
    { month: 'Avr', revenue: 3500000, appointments: 52 },
    { month: 'Mai', revenue: 3100000, appointments: 49 }
  ];

  const paymentMethods = [
    { method: 'Mobile Money', percentage: 45, amount: 1440000 },
    { method: 'Espèces', percentage: 35, amount: 1120000 },
    { method: 'Carte bancaire', percentage: 20, amount: 640000 }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Comptabilité & Analytics</h1>
          <p className="text-gray-600">Analyse financière et statistiques</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
        >
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette année</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{growthRate}%
            </span>
          </div>
          <div>
            <p className="text-sm text-green-600 font-medium">Revenus mensuels</p>
            <p className="text-2xl font-bold text-green-700">{monthlyRevenue.toLocaleString()} FCFA</p>
            <p className="text-sm text-green-600 mt-1">Moy: {dailyAverage.toLocaleString()} FCFA/jour</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-blue-600 text-sm font-medium">48 RDV</span>
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">Taux occupation</p>
            <p className="text-2xl font-bold text-blue-700">85%</p>
            <p className="text-sm text-blue-600 mt-1">+5% vs mois dernier</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-purple-600 text-sm font-medium">+12</span>
          </div>
          <div>
            <p className="text-sm text-purple-600 font-medium">Nouveaux patients</p>
            <p className="text-2xl font-bold text-purple-700">28</p>
            <p className="text-sm text-purple-600 mt-1">Ce mois-ci</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-orange-600 text-sm font-medium">Top</span>
          </div>
          <div>
            <p className="text-sm text-orange-600 font-medium">Soin le plus rentable</p>
            <p className="text-lg font-bold text-orange-700">Laser CO2</p>
            <p className="text-sm text-orange-600 mt-1">900k FCFA</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Soins par Revenus</h2>
          <div className="space-y-4">
            {topTreatments.map((treatment) => (
              <div key={treatment.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-pink-600">{topTreatments.indexOf(treatment) + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{treatment.name}</p>
                    <p className="text-sm text-gray-600">{treatment.count} séances</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{treatment.revenue.toLocaleString()} FCFA</p>
                  <p className={`text-sm ${treatment.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {treatment.growth > 0 ? '+' : ''}{treatment.growth}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Répartition des Paiements</h2>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.method} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">{method.method}</span>
                  <span className="text-sm text-gray-600">{method.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-orange-500 h-2 rounded-full" 
                    style={{ width: `${method.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{method.amount.toLocaleString()} FCFA</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Évolution Mensuelle</h2>
        <div className="grid grid-cols-5 gap-4">
          {monthlyData.map((data) => (
            <div key={data.month} className="text-center">
              <div className="mb-2">
                <div 
                  className="bg-gradient-to-t from-pink-500 to-orange-400 rounded-lg mx-auto"
                  style={{ 
                    height: `${(data.revenue / 4000000) * 120}px`,
                    width: '40px'
                  }}
                ></div>
              </div>
              <p className="text-sm font-medium text-gray-800">{data.month}</p>
              <p className="text-xs text-gray-600">{(data.revenue / 1000000).toFixed(1)}M</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Patients Fidèles</h2>
          <div className="space-y-3">
            {patients.slice(0, 5).map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">
                      {patient.firstName[0]}{patient.lastName[0]}
                    </span>
                  </div>
                  <span className="font-medium text-gray-800">{patient.firstName} {patient.lastName}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{Math.floor(Math.random() * 8) + 3} visites</p>
                  <p className="text-xs text-gray-600">{(Math.random() * 500000 + 100000).toLocaleString()} FCFA</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Alertes Stock</h2>
          <div className="space-y-3">
            {products.filter(p => p.quantity <= p.minQuantity).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">{product.name}</p>
                    <p className="text-sm text-orange-600">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-800">{product.quantity} restant</p>
                  <p className="text-xs text-orange-600">Min: {product.minQuantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
