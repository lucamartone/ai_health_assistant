import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  BarChart3, User, Calendar, Stethoscope, MessageCircle, Star,
  Heart, Shield, Settings
} from 'lucide-react';
import { NumberOfPendingAppointments, NumberOfCompletedAppointments, NumberOfAppointments, NumberOfDoctorsVisited, LastVisitDate } from '../../services/profile/fetch_overview';

import PanoramicaTab from '../../components/profile/patient/PanoramicaTab';
import ProfileTab from '../../components/profile/patient/ProfileTab';
import AppointmentsTab from '../../components/profile/patient/AppointmentsTab';
import HistoryTab from '../../components/profile/patient/HistoryTab';
import HealthTab from '../../components/profile/patient/HealthTab';
import SecurityTab from '../../components/profile/patient/SecurityTab';
import PreferencesTab from '../../components/profile/patient/PreferencesTab';
import RankTab from '../../components/profile/patient/RankTab';

const TABS = [
  { key: 'overview', label: 'Panoramica', icon: <BarChart3 className="h-5 w-5" /> },
  { key: 'profile', label: 'Profilo', icon: <User className="h-5 w-5" /> },
  { key: 'appointments', label: 'Appuntamenti', icon: <Calendar className="h-5 w-5" /> },
  { key: 'history', label: 'Cronologia', icon: <Stethoscope className="h-5 w-5" /> },
  { key: 'rank', label: 'Valuta', icon: <Star className="h-5 w-5" />},
  { key: 'health', label: 'Salute', icon: <Heart className="h-5 w-5" /> },
  { key: 'security', label: 'Sicurezza', icon: <Shield className="h-5 w-5" /> },
  { key: 'preferences', label: 'Preferenze', icon: <Settings className="h-5 w-5" /> },
];

function Profile() {
  const navigate = useNavigate();
  const { account, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
    doctorsVisited: 0,
    lastVisit: null,
  });

  useEffect(() => {
    if (!loading && !account) navigate('/login');
    window.scrollTo(0, 0);
  }, [loading, account, navigate]);

  useEffect(() => {
    if (!account?.id) return;

    const fetchStats = async () => {
      try {
        const upcoming = await NumberOfPendingAppointments(account.id);
        const completed = await NumberOfCompletedAppointments(account.id);
        const total = await NumberOfAppointments(account.id);
        const doctorsVisited = await NumberOfDoctorsVisited(account.id);
        const lastVisit = await LastVisitDate(account.id);
        setStats({
          totalAppointments: total,
          completedAppointments: completed,
          upcomingAppointments: upcoming,
          doctorsVisited: doctorsVisited,
          lastVisit: lastVisit || 'N/A',
        });
      } catch (error) {
        console.error('Errore nel recupero delle statistiche:', error);
      }
    };

    fetchStats();
  }, [account]);


  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-800 font-medium">
        Caricamento profilo...
      </div>
    );
  }

  if (!account) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* 🟦 Statistiche sempre visibili in alto */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <div className="text-sm opacity-90">Appuntamenti</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.completedAppointments}</div>
            <div className="text-sm opacity-90">Completati</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            <div className="text-sm opacity-90">Prossimi</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.doctorsVisited}</div>
            <div className="text-sm opacity-90">Medici</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-4 text-center">
            <div className="text-xl font-semibold">{stats.lastVisit}</div>
            <div className="text-sm opacity-90">Ultima Visita</div>
          </div>
        </div>

        {/* Tabs raggruppati con separazione visiva */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-x-auto">
          <div className="flex justify-center items-center space-x-6 px-4 py-2">
            
            {/* Gruppo sinistra */}
            <div className="flex space-x-1 pr-4 border-r border-gray-200">
              {TABS.filter(tab => ['overview', 'profile', 'health'].includes(tab.key)).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg whitespace-nowrap transition ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Gruppo centro */}
            <div className="flex space-x-1 px-4 border-r border-gray-200">
              {TABS.filter(tab => ['appointments', 'history', 'rank'].includes(tab.key)).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg whitespace-nowrap transition ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Gruppo destra */}
            <div className="flex space-x-1 pl-4">
              {TABS.filter(tab => ['security', 'preferences'].includes(tab.key)).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg whitespace-nowrap transition ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

          </div>
        </div>



        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {activeTab === 'overview' && <PanoramicaTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'appointments' && <AppointmentsTab account={account}/>}
          {activeTab === 'rank' && <RankTab account={account}/>}
          {activeTab === 'history' && <HistoryTab account={account}/>}
          {activeTab === 'health' && <HealthTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'preferences' && <PreferencesTab />}
        </motion.div>

        {/* Logout */}
        <div className="text-center mt-8">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
