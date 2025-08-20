// pages/patient/Hub.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getStats } from '../../services/profile/patient_profile';
import {
  BarChart3, User, Calendar, Stethoscope, Star, Heart, Shield, Settings,
  Clock, Users, CheckCircle, CalendarDays
} from 'lucide-react';

const TABS = [
  { key: 'overview', label: 'Panoramica', icon: <BarChart3 className="h-5 w-5" /> },
  { key: 'profile', label: 'Profilo', icon: <User className="h-5 w-5" /> },
  { key: 'appointments', label: 'Appuntamenti', icon: <Calendar className="h-5 w-5" /> },
  { key: 'history', label: 'Cronologia', icon: <Stethoscope className="h-5 w-5" /> },
  { key: 'rank', label: 'Valuta', icon: <Star className="h-5 w-5" /> },
  { key: 'health', label: 'Salute', icon: <Heart className="h-5 w-5" /> },
  { key: 'security', label: 'Sicurezza', icon: <Shield className="h-5 w-5" /> },
  { key: 'preferences', label: 'Preferenze', icon: <Settings className="h-5 w-5" /> },
];

function Hub() {
  const navigate = useNavigate();
  const { account, loading } = useAuth();

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
  }, [loading, account]);

  useEffect(() => {
    if (!account?.id) return;

    const fetchStats = async () => {
      try {
        const stats = await getStats(account.id);
        
        // Formatta la data dell'ultima visita
        let formattedLastVisit = 'N/A';
        if (stats.last_visit && stats.last_visit !== 'N/A') {
          try {
            const date = new Date(stats.last_visit);
            formattedLastVisit = date.toLocaleDateString('it-IT', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          } catch (e) {
            formattedLastVisit = 'N/A';
          }
        }
        
        setStats({
          totalAppointments: stats.total_appointments,
          completedAppointments: stats.completed_appointments,
          upcomingAppointments: stats.upcoming_appointments,
          doctorsVisited: stats.doctors_visited,
          lastVisit: formattedLastVisit,
        });
      } catch (error) {
        console.error('Errore nel recupero delle statistiche:', error);
      }
    };

    fetchStats();
  }, [account]);

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

        {/* Statistiche */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <div className="text-sm opacity-90">Appuntamenti</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold">{stats.completedAppointments}</div>
            <div className="text-sm opacity-90">Completati</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-1">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            <div className="text-sm opacity-90">Prossimi</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold">{stats.doctorsVisited}</div>
            <div className="text-sm opacity-90">Medici</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-6 w-6" />
            </div>
            <div className="text-xl font-semibold">{stats.lastVisit}</div>
            <div className="text-sm opacity-90">Ultima Visita</div>
          </div>
        </div>

        {/* Tabs Navigation con NavLink */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-x-auto">
          <div className="flex justify-center items-center space-x-6 px-4 py-2">
            <div className="flex space-x-1 pr-4 border-r border-gray-200">
              {TABS.filter(tab => ['overview', 'profile', 'health'].includes(tab.key)).map((tab) => (
                <NavLink
                  key={tab.key}
                  to={`/hub/${tab.key}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`
                  }
                >
                  {tab.icon}
                  {tab.label}
                </NavLink>
              ))}
            </div>

            <div className="flex space-x-1 px-4 border-r border-gray-200">
              {TABS.filter(tab => ['appointments', 'history', 'rank'].includes(tab.key)).map((tab) => (
                <NavLink
                  key={tab.key}
                  to={`/hub/${tab.key}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`
                  }
                >
                  {tab.icon}
                  {tab.label}
                </NavLink>
              ))}
            </div>

            <div className="flex space-x-1 pl-4">
              {TABS.filter(tab => ['security', 'preferences'].includes(tab.key)).map((tab) => (
                <NavLink
                  key={tab.key}
                  to={`/hub/${tab.key}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`
                  }
                >
                  {tab.icon}
                  {tab.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Hub;
