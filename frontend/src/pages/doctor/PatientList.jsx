import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchDoctorPatients } from '../../services/profile/fetch_clinical_folders';

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
        <div className="mb-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2">
                I tuoi Pazienti
              </h1>
              <p className="text-lg text-blue-700 max-w-2xl">
                Seleziona un paziente per visualizzare e gestire la sua cartella clinica
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button 
                onClick={() => navigate('/doctor')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center mx-auto sm:mx-0"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Torna alla Dashboard
              </button>
            </div>
          </div>
          
          {/* Debug info - solo in sviluppo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                <strong>DEBUG:</strong> Account ID: {account?.id} | Pazienti: {patients.length} | 
                Nome: {account?.name} {account?.surname}
              </p>
            </div>
          )}
        </div>
        
        {patients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center max-w-2xl mx-auto">
            <div className="text-blue-400 mb-6">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Nessun Paziente Trovato</h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              I pazienti appariranno qui dopo aver prenotato appuntamenti o creato record medici. 
              Al momento non hai pazienti associati al tuo account.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button 
                onClick={() => navigate('/doctor/appointments')}
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Gestisci Appuntamenti
              </button>
              <button 
                onClick={() => navigate('/doctor')}
                className="w-full sm:w-auto bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Torna alla Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{patients.length}</div>
                  <div className="text-sm text-gray-600">Pazienti Totali</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {patients.filter(p => p.sex === 'F').length}
                  </div>
                  <div className="text-sm text-gray-600">Pazienti Femmine</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {patients.filter(p => p.sex === 'M').length}
                  </div>
                  <div className="text-sm text-gray-600">Pazienti Maschi</div>
                </div>
              </div>
            </div>

            {/* Patient Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {patients.map(patient => (
                <div 
                  key={patient.id} 
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
                  onClick={() => handlePatientClick(patient.id)}
                >
                  {/* Header con avatar */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold">
                            {patient.name.charAt(0)}{patient.surname.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            {patient.name} {patient.surname}
                          </h3>
                          <p className="text-blue-100 text-sm">ID: {patient.id}</p>
                        </div>
                      </div>
                      <div className="text-blue-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contenuto */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm truncate">{patient.email}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Nato il: {formatDate(patient.birth_date)}</span>
                    </div>
                    
                    {patient.sex && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm">
                          Sesso: {patient.sex === 'M' ? 'Maschio' : 'Femmina'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="px-4 pb-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <span className="text-blue-600 text-sm font-medium flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Visualizza Cartella
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientList; 