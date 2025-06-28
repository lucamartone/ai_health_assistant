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
          setError('Dottore non autenticato');
          return;
        }
        
        const response = await fetchDoctorPatients(account.id);
        setPatients(response.data.patients || []);
      } catch (err) {
        console.error('Errore caricamento pazienti:', err);
        setError('Errore nel caricamento dei pazienti');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [account]);

  const handlePatientClick = (patientId) => {
    navigate(`/doctor/records/${patientId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (loading) return <div className="text-center p-8">Caricamento pazienti...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">I tuoi Pazienti</h2>
      <p className="text-gray-600 mb-6">Seleziona un paziente per visualizzare la sua cartella clinica</p>
      
      {patients.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          Nessun paziente trovato. I pazienti appariranno qui dopo aver prenotato appuntamenti o creato record medici.
        </div>
      ) : (
        <div className="grid gap-4">
          {patients.map(patient => (
            <div 
              key={patient.id} 
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handlePatientClick(patient.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">
                    {patient.name} {patient.surname}
                  </h3>
                  <div className="text-gray-600 space-y-1">
                    <p>{patient.email}</p>
                    <p>Nato il: {formatDate(patient.birth_date)}</p>
                    {patient.sex && <p>Sesso: {patient.sex}</p>}
                  </div>
                </div>
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientList; 