import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const TABS = [
  { key: 'overview', label: 'Panoramica', icon: '📊' },
  { key: 'profile', label: 'Profilo', icon: '👤' },
  { key: 'appointments', label: 'Appuntamenti', icon: '📅' },
  { key: 'health', label: 'Salute', icon: '❤️' },
  { key: 'security', label: 'Sicurezza', icon: '🔒' },
  { key: 'preferences', label: 'Preferenze', icon: '⚙️' },
];

function Profile() {
  const navigate = useNavigate();
  const { account, setAccount, loading, logout } = useAuth();
  const fileInputRef = useRef(null);

  // Protezione: redirect se non autenticato
  useEffect(() => {
    if (!loading && !account) {
      navigate('/login');
    }
  }, [account, loading, navigate]);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Stato per la cronologia appuntamenti
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');

  // Statistiche
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
    doctorsVisited: 0,
    lastVisit: null,
  });

  // Dati salute
  const [healthData, setHealthData] = useState({
    bloodType: 'A+',
    allergies: ['Nessuna allergia nota'],
    medications: ['Nessuna terapia in corso'],
    conditions: ['Nessuna condizione cronica'],
    emergencyContact: {
      name: 'Mario Rossi',
      phone: '+39 123 456 7890',
      relationship: 'Familiare'
    }
  });

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [account?.id, activeTab]);

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    setAppointmentsError('');
    try {
      const res = await fetch(`/profile/patient/appointments/history?patient_id=${account?.id}`);
      if (!res.ok) throw new Error('Errore nel recupero degli appuntamenti');
      const data = await res.json();
      setAppointments(data.history || []);
    } catch (err) {
      setAppointmentsError(err.message);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchStats = async () => {
    // Simulazione statistiche - in produzione verrebbero dal backend
    setStats({
      totalAppointments: 12,
      completedAppointments: 10,
      upcomingAppointments: 2,
      doctorsVisited: 3,
      lastVisit: '2024-01-15',
    });
  };

  const handleChange = (e) => {
    const updatedAccount = { ...account, [e.target.name]: e.target.value };
    setAccount(updatedAccount);
  };

  const handleHealthDataChange = (field, value) => {
    setHealthData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('L\'immagine deve essere inferiore a 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedAccount = { ...account, avatar: reader.result };
        setAccount(updatedAccount);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulazione chiamata API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMsg('Profilo aggiornato con successo!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Errore durante l\'aggiornamento del profilo');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setPasswordMsg('La password deve contenere almeno 8 caratteri.');
      return;
    }
    if (password !== password2) {
      setPasswordMsg('Le password non coincidono.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulazione chiamata API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordMsg('Password aggiornata con successo!');
      setPassword('');
      setPassword2('');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) {
      setPasswordMsg('Errore durante l\'aggiornamento della password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header profilo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Avatar e info principali */}
            <div className="flex flex-col items-center text-center lg:text-left">
              <div className="relative group">
                {account?.avatar ? (
                  <img
                    src={account?.avatar}
                    alt="Foto profilo"
                    className="w-32 h-32 rounded-full border-4 border-blue-200 object-cover cursor-pointer hover:opacity-80 transition-all duration-300 shadow-lg"
                    onClick={handleAvatarClick}
                  />
                ) : (
                  <div
                    className="w-32 h-32 rounded-full border-4 border-blue-200 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center cursor-pointer hover:opacity-80 transition-all duration-300 shadow-lg"
                    onClick={handleAvatarClick}
                  >
                    <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <svg className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              
              <div className="mt-4">
                <h1 className="text-3xl font-bold text-gray-900">{account?.name} {account?.surname}</h1>
                <p className="text-lg text-blue-600 font-medium mt-1">Paziente</p>
                <p className="text-gray-500 mt-2">{account?.email}</p>
                <p className="text-sm text-gray-400 mt-1">Registrato il {formatDate(account?.joined || new Date())}</p>
              </div>
            </div>

            {/* Statistiche rapide */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          </div>

          {/* Messaggi di successo/errore */}
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
            >
              {successMsg}
            </motion.div>
          )}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
            >
              {errorMsg}
            </motion.div>
          )}
        </motion.div>

        {/* Tab navigation */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="flex overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.key 
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
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
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Panoramica Salute</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Prossimi Appuntamenti</h3>
                    <div className="space-y-3">
                      {appointments.slice(0, 3).map((apt, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">Dr. {apt.doctor_name || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{formatDate(apt.date)} - {apt.time}</p>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {apt.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Informazioni Salute</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Gruppo sanguigno</span>
                        <span className="font-bold text-blue-600">{healthData.bloodType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Allergie</span>
                        <span className="font-bold text-blue-600">{healthData.allergies.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Ultima visita</span>
                        <span className="font-bold text-blue-600">{stats.lastVisit ? formatDate(stats.lastVisit) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Informazioni Personali</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Annulla' : 'Modifica'}
                </button>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      name="name"
                      value={account?.name || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Il tuo nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cognome</label>
                    <input
                      type="text"
                      name="surname"
                      value={account?.surname || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Il tuo cognome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={account?.email || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Telefono</label>
                    <input
                      type="tel"
                      name="phone"
                      value={account?.phone || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Il tuo numero di telefono"
                    />
                  </div>
                </div>
                
                {isEditing && (
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Salvando...' : 'Salva Modifiche'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Annulla
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cronologia Appuntamenti</h2>
              {loadingAppointments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Caricamento appuntamenti...</p>
                </div>
              ) : appointmentsError ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{appointmentsError}</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Nessun appuntamento trovato</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Dr. {apt.doctor_name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{formatDate(apt.date)} - {apt.time}</p>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'health' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informazioni Salute</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informazioni base */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Informazioni Base</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Gruppo Sanguigno</label>
                        <select
                          value={healthData.bloodType}
                          onChange={(e) => handleHealthDataChange('bloodType', e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contatto di emergenza */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-4">Contatto di Emergenza</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
                        <input
                          type="text"
                          value={healthData.emergencyContact.name}
                          onChange={(e) => handleHealthDataChange('emergencyContact', { ...healthData.emergencyContact, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Telefono</label>
                        <input
                          type="tel"
                          value={healthData.emergencyContact.phone}
                          onChange={(e) => handleHealthDataChange('emergencyContact', { ...healthData.emergencyContact, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Relazione</label>
                        <input
                          type="text"
                          value={healthData.emergencyContact.relationship}
                          onChange={(e) => handleHealthDataChange('emergencyContact', { ...healthData.emergencyContact, relationship: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allergie e condizioni */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-4">Allergie</h3>
                    <div className="space-y-2">
                      {healthData.allergies.map((allergy, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={allergy}
                            onChange={(e) => {
                              const newAllergies = [...healthData.allergies];
                              newAllergies[index] = e.target.value;
                              handleHealthDataChange('allergies', newAllergies);
                            }}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newAllergies = healthData.allergies.filter((_, i) => i !== index);
                              handleHealthDataChange('allergies', newAllergies);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleHealthDataChange('allergies', [...healthData.allergies, ''])}
                        className="text-sm text-yellow-700 hover:text-yellow-900"
                      >
                        + Aggiungi allergia
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4">Condizioni Croniche</h3>
                    <div className="space-y-2">
                      {healthData.conditions.map((condition, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={condition}
                            onChange={(e) => {
                              const newConditions = [...healthData.conditions];
                              newConditions[index] = e.target.value;
                              handleHealthDataChange('conditions', newConditions);
                            }}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newConditions = healthData.conditions.filter((_, i) => i !== index);
                              handleHealthDataChange('conditions', newConditions);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleHealthDataChange('conditions', [...healthData.conditions, ''])}
                        className="text-sm text-purple-700 hover:text-purple-900"
                      >
                        + Aggiungi condizione
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sicurezza Account</h2>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nuova Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Inserisci la nuova password"
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Conferma Password</label>
                  <input
                    type="password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Conferma la nuova password"
                    minLength={8}
                  />
                </div>
                
                {passwordMsg && (
                  <div className={`p-4 rounded-lg ${
                    passwordMsg.includes('successo') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {passwordMsg}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Aggiornando...' : 'Aggiorna Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferenze</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifiche</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span>Promemoria appuntamenti</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span>Notifiche risultati esami</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span>Newsletter salute</span>
                    </label>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span>Condividi dati con i medici</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span>Profilo pubblico visibile</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Logout button */}
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
