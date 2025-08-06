import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FolderOpen, User, FileText, ArrowLeft, Stethoscope, Calendar, MapPin } from 'lucide-react';
import { fetchClinicalFolderByDoctor } from '../../services/profile/fetch_clinical_folders';
import { getPatientDoctors } from '../../services/profile/fetch_patient_profile';

const ClinicalFolder = () => {
  const navigate = useNavigate();
  const { account, loading } = useAuth();
  const [clinicalFolders, setClinicalFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Protezione: redirect se non autenticato
  useEffect(() => {
    if (!loading && !account) {
      navigate('/login');
    }
  }, [account, loading, navigate]);

  // Carica i dottori del paziente
  const loadDoctors = async () => {
    if (!account?.id) return;
    
    setLoadingDoctors(true);
    try {
      const data = await getPatientDoctors(account.id);
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error('Errore caricamento dottori:', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Carica le cartelle cliniche per ogni dottore
  const loadClinicalFolders = async () => {
    if (!account?.id || doctors.length === 0) return;

    setLoadingFolders(true);
    setError(null);
    
    try {
      const foldersData = [];
      
      for (const doctor of doctors) {
        try {
          const folderData = await fetchClinicalFolderByDoctor(account.id, doctor.id);
          console.log(`Cartella per dottore ${doctor.id}:`, folderData);
          foldersData.push({
            doctor: doctor,
            folder: folderData
          });
        } catch (err) {
          console.error(`Errore caricamento cartella per dottore ${doctor.id}:`, err);
          // Aggiungi comunque il dottore anche se non ha cartella
          foldersData.push({
            doctor: doctor,
            folder: null
          });
        }
      }
      
      setClinicalFolders(foldersData);
    } catch (err) {
      console.error('Errore caricamento cartelle cliniche:', err);
      setError('Errore nel caricamento delle cartelle cliniche');
    } finally {
      setLoadingFolders(false);
    }
  };

  useEffect(() => {
    if (account?.id) {
      loadDoctors();
    }
  }, [account?.id]);

  useEffect(() => {
    if (doctors.length > 0) {
      loadClinicalFolders();
    }
  }, [doctors, account?.id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRecordStatus = (record) => {
    if (record.diagnosis && record.treatment_plan) {
      return { status: 'Completato', color: 'bg-green-100 text-green-800' };
    } else if (record.symptoms) {
      return { status: 'In corso', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'Iniziale', color: 'bg-blue-100 text-blue-800' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">Caricamento...</p>
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
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/hub')}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cartelle Cliniche</h1>
                <p className="text-gray-600">Le tue cartelle cliniche con i dottori</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Paziente</p>
              <p className="font-semibold text-gray-900">{account.name} {account.surname}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
        </motion.div>

        {/* Contenuto principale */}
        {loadingDoctors ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento dottori...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">👨‍⚕️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun dottore trovato</h3>
              <p className="text-gray-600 mb-4">Non hai ancora dottori associati. Prenota la tua prima visita per iniziare!</p>
              <button
                onClick={() => navigate('/book')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Prenota Visita
              </button>
            </div>
          </div>
        ) : loadingFolders ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento cartelle cliniche...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {clinicalFolders.map((folderData, index) => (
              <motion.div
                key={folderData.doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Header dottore */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Dr. {folderData.doctor.name} {folderData.doctor.surname}</h3>
                        <p className="text-blue-100">{folderData.doctor.specialization}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{folderData.doctor.locations?.join(', ') || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Ultima visita: {
                              folderData.folder?.medical_records && folderData.folder.medical_records.length > 0 
                                ? formatDate(folderData.folder.medical_records[0].created_at || folderData.folder.medical_records[0].record_date)
                                : 'N/A'
                            }</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {folderData.folder?.medical_records?.length || 0}
                      </div>
                      <div className="text-blue-100 text-sm">Record medici</div>
                    </div>
                  </div>
                </div>

                {/* Contenuto cartella */}
                <div className="p-6">
                  {!folderData.folder ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📋</div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Nessuna cartella clinica</h4>
                      <p className="text-gray-600 mb-4">Non ci sono ancora record medici per questo dottore.</p>
                      <button
                        onClick={() => navigate('/book')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Prenota Visita
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Record medici */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Stethoscope className="h-5 w-5" />
                          Record Medici
                        </h4>
                        {folderData.folder.medical_records?.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">Nessun record medico disponibile</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {folderData.folder.medical_records?.map((record, recordIndex) => {
                              const status = getRecordStatus(record);
                              return (
                                <div key={recordIndex} className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h5 className="font-semibold text-gray-900">
                                        Visita del {formatDate(record.created_at)}
                                      </h5>
                                      <p className="text-sm text-gray-500">
                                        Dottore: Dr. {folderData.doctor.name} {folderData.doctor.surname}
                                      </p>
                                    </div>
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.color}`}>
                                      {status.status}
                                    </span>
                                  </div>
                                  
                                  {record.symptoms && (
                                    <div className="mb-3">
                                      <h6 className="font-medium text-gray-700 mb-1">Sintomi:</h6>
                                      <p className="text-gray-600 text-sm">{record.symptoms}</p>
                                    </div>
                                  )}
                                  
                                  {record.diagnosis && (
                                    <div className="mb-3">
                                      <h6 className="font-medium text-gray-700 mb-1">Diagnosi:</h6>
                                      <p className="text-gray-600 text-sm">{record.diagnosis}</p>
                                    </div>
                                  )}
                                  
                                  {record.treatment_plan && (
                                    <div className="mb-3">
                                      <h6 className="font-medium text-gray-700 mb-1">Piano di trattamento:</h6>
                                      <p className="text-gray-600 text-sm">{record.treatment_plan}</p>
                                    </div>
                                  )}
                                  
                                  {record.notes && (
                                    <div>
                                      <h6 className="font-medium text-gray-700 mb-1">Note:</h6>
                                      <p className="text-gray-600 text-sm">{record.notes}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Documenti */}
                      {folderData.folder.documents && folderData.folder.documents.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Documenti Medici
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {folderData.folder.documents.map((doc, docIndex) => (
                              <div key={docIndex} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-6 w-6 text-blue-600" />
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">{doc.title}</h5>
                                    <p className="text-sm text-gray-500">{doc.document_type}</p>
                                    <p className="text-xs text-gray-400">{formatDate(doc.created_at)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalFolder;