import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  BarChart3, User, Calendar, Stethoscope, MessageCircle,
  Heart, Shield, Settings
} from 'lucide-react';

import PanoramicaTab from '../../components/profile/PanoramicaTab';
import ProfileTab from '../../components/profile/ProfileTab';
import AppointmentsTab from '../../components/profile/AppointmentsTab';
import DoctorsTab from '../../components/profile/DoctorsTab';
import ChatTab from '../../components/profile/ChatTab';
import HealthTab from '../../components/profile/HealthTab';
import SecurityTab from '../../components/profile/SecurityTab';
import PreferencesTab from '../../components/profile/PreferencesTab';

const TABS = [
  { key: 'overview', label: 'Panoramica', icon: <BarChart3 className="h-5 w-5" /> },
  { key: 'profile', label: 'Profilo', icon: <User className="h-5 w-5" /> },
  { key: 'appointments', label: 'Appuntamenti', icon: <Calendar className="h-5 w-5" /> },
  { key: 'doctors', label: 'I Miei Dottori', icon: <Stethoscope className="h-5 w-5" /> },
  { key: 'chat', label: 'Chat AI', icon: <MessageCircle className="h-5 w-5" /> },
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
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setStats({
      totalAppointments: 12,
      completedAppointments: 10,
      upcomingAppointments: 2,
      doctorsVisited: 3,
      lastVisit: '2024-01-15',
    });
  };

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-x-auto flex justify-center">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
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
          {activeTab === 'appointments' && <AppointmentsTab />}
          {activeTab === 'doctors' && <DoctorsTab />}
          {activeTab === 'chat' && <ChatTab />}
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
