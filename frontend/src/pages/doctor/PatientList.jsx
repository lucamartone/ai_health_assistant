import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchDoctorPatients } from '../../services/profile/fetch_clinical_folders';
import { motion } from 'framer-motion';
import { Users, User, ArrowLeft, Calendar, FolderOpen, Heart } from 'lucide-react';

const PatientList = () => {
  const navigate = useNavigate();
  const { account } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        if (!account?.id) {
          console.log('DEBUG: Account non trovato:', account);
          setError('Dottore non autenticato');
          return;
        }
        
        console.log('DEBUG: Caricamento pazienti per dottore ID:', account.id);
        const response = await fetchDoctorPatients(account.id);
        console.log('DEBUG: Risposta API pazienti:', response);
        
        if (response && response.patients) {
          console.log('DEBUG: Pazienti trovati:', response.patients.length);
          setPatients(response.patients);
        } else {
          console.log('DEBUG: Nessun paziente nella risposta:', response);
          setPatients([]);
        }
      } catch (err) {
        console.error('DEBUG: Errore caricamento pazienti:', err);
        console.error('DEBUG: Dettagli errore:', err.response?.data || err.message);
        setError(`Errore nel caricamento dei pazienti: ${err.response?.data?.detail || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [account]);

  const handlePatientClick = (patientId) => {
    console.log('DEBUG: Click su paziente ID:', patientId);
    navigate(`/doctor/records/${patientId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getAgeGroup = (age) => {
    if (!age) return 'N/A';
    if (age < 18) return 'Minorenne';
    if (age < 30) return '18-29';
    if (age < 50) return '30-49';
    if (age < 65) return '50-64';
    return '65+';
  };

  console.log('DEBUG: Stato componente - loading:', loading, 'error:', error, 'patients:', patients.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 pt-20">
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Caricamento Pazienti</h2>
            <p className="text-blue-600">Stiamo recuperando la lista dei tuoi pazienti...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-red-200 pt-20">
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-red-500 mb-6">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-red-800 mb-4">Errore di Caricamento</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Riprova
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            <div className="flex flex-col items-center text-center lg:text-left">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">I tuoi Pazienti</h1>
              <p className="text-lg text-blue-600 font-medium">Gestione Cartelle Cliniche</p>
              <p className="text-gray-500 mt-2">Seleziona un paziente per visualizzare la sua cartella clinica</p>
            </div>

            {/* Statistiche rapide */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{patients.length}</div>
                <div className="text-sm opacity-90">Pazienti Totali</div>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">
                  {patients.filter(p => p.sex === 'F').length}
                </div>
                <div className="text-sm opacity-90">Femmine</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">
                  {patients.filter(p => p.sex === 'M').length}
                </div>
                <div className="text-sm opacity-90">Maschi</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">
                  {patients.filter(p => p.email).length}
                </div>
                <div className="text-sm opacity-90">Con Email</div>
              </div>
            </div>
          </div>

          {/* Pulsante torna indietro */}
          <div className="mt-6 flex justify-center lg:justify-start">
            <button 
              onClick={() => navigate('/doctor')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Torna alla Dashboard
            </button>
          </div>
        </motion.div>
        
        {patients.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center max-w-2xl mx-auto"
          >
            <div className="text-blue-400 mb-6">
              <Users className="w-24 h-24 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Nessun Paziente Trovato</h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              I pazienti appariranno qui dopo aver prenotato appuntamenti o creato record medici. 
              Al momento non hai pazienti associati al tuo account.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button 
                onClick={() => navigate('/doctor/appointments')}
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Gestisci Appuntamenti
              </button>
              <button 
                onClick={() => navigate('/doctor')}
                className="w-full sm:w-auto bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Torna alla Dashboard
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {patients.map((patient, index) => (
              <motion.div 
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group"
                onClick={() => handlePatientClick(patient.id)}
              >
                {/* Header con avatar */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold">
                        {patient.name?.charAt(0)}{patient.surname?.charAt(0)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">ID: {patient.id}</div>
                      <div className="text-xs opacity-75">{patient.sex === 'F' ? 'Femmina' : 'Maschio'}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1">
                    {patient.name} {patient.surname}
                  </h3>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    {patient.birth_date ? (
                      <>
                        <span>{calculateAge(patient.birth_date)} anni</span>
                        <span>•</span>
                        <span className="bg-white/20 px-2 py-1 rounded text-xs">
                          {getAgeGroup(calculateAge(patient.birth_date))}
                        </span>
                      </>
                    ) : (
                      <span>Età non disponibile</span>
                    )}
                  </div>
                </div>

                {/* Contenuto */}
                <div className="p-6">
                  <div className="space-y-3">
                    {patient.birth_date && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium w-16">Età:</span>
                        <span>{calculateAge(patient.birth_date)} anni ({getAgeGroup(calculateAge(patient.birth_date))})</span>
                      </div>
                    )}
                    
                    {patient.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium w-16">Email:</span>
                        <span className="truncate">{patient.email}</span>
                      </div>
                    )}
                    
                    {patient.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium w-16">Telefono:</span>
                        <span>{patient.phone}</span>
                      </div>
                    )}
                    
                    {patient.address && (
                      <div className="flex items-start text-sm text-gray-600">
                        <span className="font-medium w-16">Indirizzo:</span>
                        <span className="line-clamp-2">{patient.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Pulsante azione */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 group-hover:bg-blue-700">
                      <FolderOpen className="w-4 h-4" />
                      Visualizza Cartella
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientList; 