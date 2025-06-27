import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const TABS = [
  { key: 'profile', label: 'Profilo' },
  { key: 'appointments', label: 'Appuntamenti' },
  { key: 'schedule', label: 'Orari' },
  { key: 'security', label: 'Sicurezza' },
  { key: 'preferences', label: 'Preferenze' },
];

function Profile() {
  const navigate = useNavigate();
  const { account, setAccount, loading, logout } = useAuth();
  const fileInputRef = useRef(null);

  // Protezione: redirect se non autenticato
  useEffect(() => {
    if (!loading && !account) {
      navigate('/doctor/login');
    }
  }, [account, loading, navigate]);

  const [successMsg, setSuccessMsg] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Stato per la cronologia appuntamenti
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');

  useEffect(() => {
    if (activeTab === 'appointments') {
      async function fetchAppointments() {
        setLoadingAppointments(true);
        setAppointmentsError('');
        try {
          const res = await fetch(`/doctor/appointments?doctor_id=${account?.id}`);
          if (!res.ok) throw new Error('Errore nel recupero degli appuntamenti');
          const data = await res.json();
          setAppointments(data.appointments || []);
        } catch (err) {
          setAppointmentsError(err.message);
        } finally {
          setLoadingAppointments(false);
        }
      }
      fetchAppointments();
    }
  }, [account?.id, activeTab]);

  const handleChange = (e) => {
    // Aggiorna l'account locale per la visualizzazione
    const updatedAccount = { ...account, [e.target.name]: e.target.value };
    setAccount(updatedAccount);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('Modifiche salvate con successo!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setPasswordMsg('La password deve contenere almeno 8 caratteri.');
      return;
    }
    if (password !== password2) {
      setPasswordMsg('Le password non coincidono.');
      return;
    }
    setPasswordMsg('Password aggiornata con successo!');
    setTimeout(() => setPasswordMsg(''), 3000);
    setPassword('');
    setPassword2('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/doctor');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;
  }

  if (!account) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2 mt-16">
      {/* Header profilo */}
      <div className="w-full max-w-3xl flex flex-col items-center gap-2 mb-8">
        <div className="flex flex-col items-center gap-2">
          {account?.avatar ? (
            <img
              src={account?.avatar}
              alt="Foto profilo"
              className="w-24 h-24 rounded-full border-2 border-gray-200 object-cover cursor-pointer hover:opacity-80 transition"
              onClick={handleAvatarClick}
              aria-label="Cambia foto profilo"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition"
              onClick={handleAvatarClick}
              aria-label="Cambia foto profilo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a8.963 8.963 0 01-6.879-3.196z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
            aria-label="Carica nuova foto profilo"
          />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">Dr. {account?.name} {account?.surname}</div>
          <div className="text-gray-500 text-sm">{account?.email}</div>
          <div className="text-gray-400 text-xs mt-1">{account?.specialization || 'Medico'} &middot; Registrato il {account?.joined}</div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>

      {/* Tab navigation */}
      <div className="w-full max-w-3xl flex border-b border-gray-200 mb-8">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-lg font-medium transition border-b-2 ${activeTab === tab.key ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 bg-gray-50 hover:bg-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow p-6 min-h-[300px]">
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="name">Nome</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={account?.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Il tuo nome"
                  aria-label="Nome"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="surname">Cognome</label>
                <input
                  type="text"
                  name="surname"
                  id="surname"
                  value={account?.surname}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Il tuo cognome"
                  aria-label="Cognome"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={account?.email}
                  className="w-full px-4 py-2 rounded-md bg-gray-100 border border-gray-200 cursor-not-allowed"
                  aria-label="Email"
                  readOnly
                  tabIndex={-1}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="specialization">Specializzazione</label>
                <input
                  type="text"
                  name="specialization"
                  id="specialization"
                  value={account?.specialization || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Es. Cardiologia"
                  aria-label="Specializzazione"
                />
              </div>
            </div>
            {successMsg && (
              <div className="bg-green-50 text-green-800 rounded p-2 text-center font-semibold">
                {successMsg}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-blue-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-800 transition"
                aria-label="Salva modifiche"
              >
                Salva modifiche
              </button>
            </div>
          </form>
        )}

        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">I tuoi appuntamenti</h2>
            {loadingAppointments && <div className="text-blue-700">Caricamento...</div>}
            {appointmentsError && <div className="text-red-700">{appointmentsError}</div>}
            {!loadingAppointments && !appointmentsError && appointments.length === 0 && (
              <div className="text-gray-500">Nessun appuntamento programmato.</div>
            )}
            {!loadingAppointments && !appointmentsError && appointments.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-gray-500 uppercase text-xs">
                      <th className="px-2 py-1">Data</th>
                      <th className="px-2 py-1">Paziente</th>
                      <th className="px-2 py-1">Tipo</th>
                      <th className="px-2 py-1">Stato</th>
                      <th className="px-2 py-1">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => {
                      let badgeColor = 'bg-gray-200 text-gray-700';
                      if (appointment.state === 'confirmed') badgeColor = 'bg-green-100 text-green-800';
                      if (appointment.state === 'pending') badgeColor = 'bg-yellow-100 text-yellow-800';
                      if (appointment.state === 'cancelled') badgeColor = 'bg-red-100 text-red-800';
                      return (
                        <tr key={appointment.id} className="bg-white rounded shadow-sm">
                          <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">
                            {new Date(appointment.date_time).toLocaleString()}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            {appointment.patient_name} {appointment.patient_surname}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">{appointment.type}</td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeColor}`}>{appointment.state}</span>
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            <button className="text-blue-700 hover:underline text-xs">Gestisci</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gestione orari</h2>
            <div className="text-gray-500">Prossimamente potrai gestire i tuoi orari di disponibilità e prenotazioni.</div>
          </div>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Modifica password</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="password">Nuova password</label>
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nuova password"
                aria-label="Nuova password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="password2">Ripeti password</label>
              <input
                type="password"
                name="password2"
                id="password2"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ripeti password"
                aria-label="Ripeti password"
                required
              />
            </div>
            {passwordMsg && (
              <div className={`rounded p-2 text-center font-semibold ${passwordMsg.includes('successo') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {passwordMsg}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-blue-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-800 transition"
                aria-label="Aggiorna password"
              >
                Aggiorna password
              </button>
            </div>
          </form>
        )}

        {activeTab === 'preferences' && (
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Preferenze e notifiche</h2>
            <div className="text-gray-500">Prossimamente potrai gestire le tue preferenze di comunicazione e notifiche.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile; 